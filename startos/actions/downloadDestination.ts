import { ExtendedVersion, T, VersionRange } from '@start9labs/start-sdk'
import { nextexplorerVersionRange } from '../dependencies'
import { destinations } from '../destinations'
import { store } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

export const inputSpec = InputSpec.of({
  downloadDestination: Value.union({
    name: i18n('Download Destination'),
    description: i18n(
      'Where YTPTube saves downloads. "File Browser" or "NextExplorer" sends every download into that service (it becomes the only download location while selected); "Local Storage" keeps them in YTPTube.',
    ),
    default: 'local',
    variants: Variants.of({
      local: {
        name: i18n('Local Storage'),
        spec: InputSpec.of({}),
      },
      filebrowser: {
        name: i18n('File Browser'),
        spec: InputSpec.of({}),
      },
      nextexplorer: {
        name: i18n('NextExplorer'),
        spec: InputSpec.of({
          location: Value.text({
            name: i18n('NextExplorer Location'),
            description: i18n(
              'The NextExplorer location YTPTube saves into, added to NextExplorer if it does not exist. Use a location that only YTPTube saves into: Clear History deletes everything in it. If you rename the location in NextExplorer, enter its new name here.',
            ),
            required: true,
            default: destinations.nextexplorer.defaultLocation,
            placeholder: destinations.nextexplorer.defaultLocation,
            // NextExplorer's own rule; Add Location also refuses its reserved names.
            patterns: [
              {
                regex: '^[^./][^/]*$',
                description: i18n('Cannot start with a dot or contain a slash'),
              },
            ],
          }),
        }),
      },
    }),
  }),
})

// Add Location admits only a declared dependent, and the store declares
// NextExplorer only once it is chosen, so declare it for the call and take it
// back if the call fails.
const addNextexplorerLocation = async (effects: T.Effects, name: string) => {
  if (!(await sdk.getInstalledPackages(effects)).includes('nextexplorer'))
    throw new Error(i18n('Install NextExplorer first.'))
  const version = await sdk
    .getServiceManifest(effects, 'nextexplorer', (m) => m?.version ?? '')
    .once()
  if (
    !version ||
    !ExtendedVersion.parse(version).satisfies(
      VersionRange.parse(nextexplorerVersionRange),
    )
  )
    throw new Error(i18n('Update NextExplorer to 3.1.0:2 or later first.'))
  const previous = await effects.getDependencies()
  if (!previous.some((d) => d.id === 'nextexplorer'))
    await effects.setDependencies({
      dependencies: [
        ...previous,
        {
          id: 'nextexplorer',
          kind: 'exists',
          versionRange: nextexplorerVersionRange,
        },
      ],
    })
  try {
    await sdk.action.run({
      effects,
      packageId: 'nextexplorer',
      actionId: 'add-location',
      input: () => ({ name }),
    })
  } catch (e) {
    await effects.setDependencies({ dependencies: previous })
    throw e
  }
}

export const downloadDestination = sdk.Action.withInput(
  // id
  'download-destination',

  // metadata
  async ({ effects }) => ({
    name: i18n('Select Download Destination'),
    description: i18n('Where YTPTube saves downloads'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current choice, keeping the NextExplorer location when
  // another destination is selected
  async ({ effects }) => {
    const s = await store.read().once()
    const selection = s?.downloadDestination ?? 'local'
    const location =
      s?.nextexplorerLocation ?? destinations.nextexplorer.defaultLocation
    return {
      downloadDestination:
        selection === 'nextexplorer'
          ? { selection, value: { location } }
          : { selection, value: {}, other: { nextexplorer: { location } } },
    }
  },

  // execution: persist the choice (the service restarts to apply it)
  async ({ effects, input }) => {
    const choice = input.downloadDestination
    if (choice.selection === 'nextexplorer') {
      const location = choice.value.location.trim()
      await addNextexplorerLocation(effects, location)
      await store.merge(effects, {
        downloadDestination: 'nextexplorer',
        nextexplorerLocation: location,
      })
    } else {
      await store.merge(effects, { downloadDestination: choice.selection })
    }
  },
)
