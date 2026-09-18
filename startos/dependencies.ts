import { T } from '@start9labs/start-sdk'
import { store } from './fileModels/store.json'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const downloadDestination =
    (await store.read((s) => s.downloadDestination).const(effects)) ?? 'local'

  const deps: T.CurrentDependenciesResult<any> = {}

  // Only require File Browser when it's the chosen download location. `exists`
  // (not `running`) — we only need its data volume present to write into.
  //
  // Two packages ship under the `filebrowser` id: the original
  // filebrowser/filebrowser line (end of life) and its successor FileBrowser
  // Quantum, whose versions carry a `#quantum` flavor. Quantum declares
  // `satisfies('2.63.23:2')` and the StartOS UI honours it, so an unflavored
  // range alone would match Quantum there — but a flavored version satisfies
  // no unflavored range on its own, and not every check consults `satisfies`
  // (SDK 2.0.9's `checkDependencies().satisfied()` does not). Naming both
  // lines matches either, everywhere. Both expose the `data` volume we mount
  // and both run as uid 1000 (verified in filebrowser/filebrowser's Dockerfile
  // and in the gtstef/filebrowser image), which is what lets main.ts share
  // files with YTPTube's `app` user without an idmap.
  if (downloadDestination === 'filebrowser') {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.63.2:0 || >=#quantum:1.5.2:0',
    }
  }

  return deps
})
