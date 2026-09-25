import { store } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

// Upstream's defaults (app/library/config.py), shown when nothing is stored.
const defaults = {
  maxWorkersPerExtractor: 2,
  maxWorkers: 20,
  retry: 0,
  autoClearHistoryDays: 0,
  removeFiles: false,
}

export const inputSpec = InputSpec.of({
  maxWorkersPerExtractor: Value.number({
    name: i18n('Downloads at Once per Site'),
    description: i18n(
      'How many downloads from the same site run at the same time. Raising it for YouTube makes YouTube more likely to slow down or block your downloads.',
    ),
    required: true,
    default: defaults.maxWorkersPerExtractor,
    min: 1,
    max: 10,
    integer: true,
  }),
  maxWorkers: Value.number({
    name: i18n('Downloads at Once in Total'),
    description: i18n(
      'How many downloads run at the same time across all sites. Lower it on a server with little memory.',
    ),
    required: true,
    default: defaults.maxWorkers,
    min: 1,
    max: 50,
    integer: true,
  }),
  retry: Value.number({
    name: i18n('Retries'),
    description: i18n(
      'Extra attempts for a download that fails with a temporary error. 0 turns retries off.',
    ),
    required: true,
    default: defaults.retry,
    min: 0,
    max: 10,
    integer: true,
  }),
  autoClearHistoryDays: Value.number({
    name: i18n('Forget Finished Downloads After'),
    description: i18n(
      'Removes finished downloads from the history list after this many days. Their files are kept. 0 keeps history forever.',
    ),
    required: true,
    default: defaults.autoClearHistoryDays,
    min: 0,
    max: 3650,
    integer: true,
    units: i18n('days'),
  }),
  removeFiles: Value.toggle({
    name: i18n('Delete Files With Their History Entries'),
    description: i18n(
      'When on, deleting a finished download in YTPTube, one at a time or by clearing the whole list, also deletes its file. YTPTube looks for that file in the current download destination only: after you switch destinations, files saved earlier are left behind, and a different file with the same name in the new destination would be deleted instead.',
    ),
    default: defaults.removeFiles,
    warning: i18n(
      'While this is on, clearing the list of finished downloads in YTPTube also deletes their files.',
    ),
  }),
})

export const downloadSettings = sdk.Action.withInput(
  // id
  'download-settings',

  // metadata
  async ({ effects }) => ({
    name: i18n('Download Settings'),
    description: i18n(
      'How many downloads run at once, retries, and what happens to finished downloads',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current settings, or upstream's defaults
  async ({ effects }) => {
    const s = await store.read().once()
    return {
      maxWorkersPerExtractor:
        s?.maxWorkersPerExtractor ?? defaults.maxWorkersPerExtractor,
      maxWorkers: s?.maxWorkers ?? defaults.maxWorkers,
      retry: s?.retry ?? defaults.retry,
      autoClearHistoryDays:
        s?.autoClearHistoryDays ?? defaults.autoClearHistoryDays,
      removeFiles: s?.removeFiles ?? defaults.removeFiles,
    }
  },

  // execution: persist the settings (the service restarts to apply them)
  async ({ effects, input }) => store.merge(effects, input),
)
