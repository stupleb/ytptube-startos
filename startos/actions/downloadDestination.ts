import { store } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  downloadDestination: Value.select({
    name: i18n('Download Destination'),
    description: i18n(
      'Where YTPTube saves downloads. "File Browser" sends every download into File Browser (it becomes the sole download location while selected); "Local Storage" keeps them in YTPTube.',
    ),
    values: {
      local: i18n('Local Storage'),
      filebrowser: i18n('File Browser'),
    },
    default: 'local',
  }),
})

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

  // pre-fill with the current selection
  async ({ effects }) => ({
    downloadDestination:
      (await store.read((s) => s.downloadDestination).const(effects)) || 'local',
  }),

  // execution: persist the choice (the service restarts to apply it)
  async ({ effects, input }) =>
    store.merge(effects, { downloadDestination: input.downloadDestination }),
)
