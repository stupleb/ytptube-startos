import { store } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { configMounts } from '../utils'

const { InputSpec, Value, Variants } = sdk

// YTPTube's upgrader (app/upgrader.py) installs the chosen yt-dlp into a user
// site under /config (python<ver>-packages) on every start: the newest stable
// release by default, the newest nightly for 'nightly', or exactly the version
// given. Specific versions are limited to releases; nightlies go through
// 'nightly', which follows the newest one.
//
// Its check of what is installed reads the image's own copy, not the one in the
// user site, so after a specific version it keeps that version when told to go
// back to stable, or to the version the image ships (seen with 2.7.4). When the
// choice changes, the handler removes the user site's version stamp: on the
// next start the upgrader then clears everything it installed and installs the
// new choice from scratch.
// A yt-dlp release number. Also checked in the handler: a text field's pattern
// is enforced by the form only, not on input sent to the action directly.
const releaseVersion = '^\\d{4}\\.\\d{1,2}\\.\\d{1,2}(\\.\\d{1,2})?$'

export const inputSpec = InputSpec.of({
  release: Value.union({
    name: i18n('yt-dlp Release'),
    description: i18n(
      'Which yt-dlp YTPTube installs when it starts. Stable suits almost everyone. When YouTube changes something and downloads start failing, the fix usually reaches Nightly first. Changing this restarts YTPTube.',
    ),
    default: 'stable',
    variants: Variants.of({
      stable: {
        name: i18n('Stable (recommended)'),
        spec: InputSpec.of({}),
      },
      nightly: {
        name: i18n('Nightly'),
        spec: InputSpec.of({}),
      },
      specific: {
        name: i18n('Specific Version'),
        spec: InputSpec.of({
          version: Value.text({
            name: i18n('Version'),
            description: i18n(
              'A yt-dlp release to stay on, as shown on its releases page.',
            ),
            required: true,
            default: null,
            placeholder: '2026.08.19',
            patterns: [
              {
                regex: releaseVersion,
                description: i18n('A release version, such as 2026.08.19'),
              },
            ],
          }),
        }),
      },
    }),
  }),
  debug: Value.toggle({
    name: i18n('Verbose yt-dlp Logging'),
    description: i18n(
      "Writes yt-dlp's detailed output for every download to the service logs, which helps when downloads fail. That detail includes the web addresses YouTube serves videos from, which contain your public IP address, so check logs before sharing them, and turn this off when you are done.",
    ),
    default: false,
  }),
})

export const ytdlpSettings = sdk.Action.withInput(
  // id
  'ytdlp-settings',

  // metadata
  async ({ effects }) => ({
    name: i18n('yt-dlp Settings'),
    description: i18n(
      'Choose which yt-dlp release to use, and turn on detailed logging for troubleshooting',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current settings
  async ({ effects }) => {
    const s = await store.read().once()
    const version = s?.ytdlpVersion
    return {
      release:
        !version || version === 'stable'
          ? { selection: 'stable' as const, value: {} }
          : version === 'nightly'
            ? { selection: 'nightly' as const, value: {} }
            : { selection: 'specific' as const, value: { version } },
      debug: s?.ytdlpDebug ?? false,
    }
  },

  // execution: persist the settings (the service restarts to apply them)
  async ({ effects, input }) => {
    const ytdlpVersion =
      input.release.selection === 'specific'
        ? input.release.value.version
        : input.release.selection
    if (
      input.release.selection === 'specific' &&
      !new RegExp(releaseVersion).test(ytdlpVersion)
    )
      throw new Error(i18n('A release version, such as 2026.08.19'))
    const previous =
      (await store.read((s) => s.ytdlpVersion).once()) ?? 'stable'
    if (ytdlpVersion !== previous)
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'ytptube' },
        configMounts,
        'ytdlp-reset',
        (sub) =>
          sub.execFail(['sh', '-c', 'rm -f /config/python*-packages/.version']),
      )
    await store.merge(effects, { ytdlpVersion, ytdlpDebug: input.debug })
  },
)
