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
  // filebrowser/filebrowser line (now titled "File Browser (unsupported)") and
  // its successor FileBrowser Quantum, which carries a `#quantum` flavor. A
  // flavored version does not satisfy an unflavored range, so both lines are
  // named explicitly — otherwise Quantum, the supported one, fails to match.
  // Either satisfies us: both expose the `data` volume we mount, and both run
  // as uid 1000 (verified in filebrowser/filebrowser's Dockerfile and in the
  // gtstef/filebrowser image), which is what lets main.ts share files with
  // YTPTube's `app` user without an idmap.
  if (downloadDestination === 'filebrowser') {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.63.2:0 || >=#quantum:1.5.2:0',
    }
  }

  return deps
})
