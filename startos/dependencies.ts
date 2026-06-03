import { T } from '@start9labs/start-sdk'
import { store } from './fileModels/store.json'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const downloadDestination =
    (await store.read((s) => s.downloadDestination).const(effects)) ?? 'local'

  const deps: T.CurrentDependenciesResult<any> = {}

  // Only require File Browser when it's the chosen download location. `exists`
  // (not `running`) — we only need its data volume present to write into.
  if (downloadDestination === 'filebrowser') {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.63.2:0',
    }
  }

  return deps
})
