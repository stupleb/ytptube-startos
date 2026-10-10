import { store } from './fileModels/store.json'
import {
  filebrowserDescription,
  nextexplorerDescription,
} from './manifest/i18n'
import { sdk } from './sdk'

// The first NextExplorer release that lets other services run its Add Location.
export const nextexplorerVersionRange = '>=3.1.0:2'

// Each is enabled only while it is the chosen download destination, and needs
// only to exist: YTPTube writes into its `data` volume whether it runs or not.
export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('filebrowser', {
      description: filebrowserDescription,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-startos/fbf1fefb51cca9731f2a9a9e6f790ca150aa9d04/icon.svg',
      },
      // FileBrowser Quantum ships under the same id, with `#quantum` versions.
      versionRange: '>=2.63.2:0 || >=#quantum:1.5.2:0',
      kind: 'exists',
      enabled: async ({ effects }) =>
        (await store.read((s) => s.downloadDestination).const(effects)) ===
        'filebrowser',
    }),
  )
  .addDependency(
    sdk.Dependency.optional('nextexplorer', {
      description: nextexplorerDescription,
      metadata: {
        title: 'NextExplorer',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextexplorer-startos/d8588c6874e0f7e5ca1e160dc58e1fcf06c0ef59/icon.svg',
      },
      versionRange: nextexplorerVersionRange,
      kind: 'exists',
      enabled: async ({ effects }) =>
        (await store.read((s) => s.downloadDestination).const(effects)) ===
        'nextexplorer',
    }),
  )
