// Here we define any constants or functions that are shared by multiple components
// throughout the package codebase. This file will be unnecessary for many packages.

import { sdk } from './sdk'

export const uiPort = 8081

// The username for YTPTube's built-in auth. The password is generated on
// install and stored in store.json; both are injected as YTP_AUTH_* env vars.
export const authUsername = 'admin'

// YTPTube's SQLite database, inside the `main` volume (YTP_CONFIG_PATH).
export const dbFile = '/config/ytptube.db'

// Just the config volume, for one-off tasks that need the database without the
// download paths (see actions/resetAdminPassword.ts).
export const configMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: '/config',
  readonly: false,
})
