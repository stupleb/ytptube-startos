import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { store } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { authUsername, uiPort } from './utils'

// When File Browser is the chosen destination, downloads go into this folder
// inside File Browser's data volume (created + chmod 777'd by the setup oneshot
// so the cross-package, idmapped write is permitted). This is the same approach
// MeTube uses — point the download path straight at the mount, rather than
// trying to expose it as a sub-folder of /downloads (which YTPTube's
// calc_download_path confinement rejects).
const FB_MOUNT = '/mnt/filebrowser'
const FB_DOWNLOAD_PATH = `${FB_MOUNT}/ytptube-downloads`

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting YTPTube!'))

  // Reactive reads — changing either restarts the daemon so the mount set and
  // env below are re-evaluated.
  const adminPassword = await store.read((s) => s.adminPassword).const(effects)
  const destination =
    (await store.read((s) => s.downloadDestination).const(effects)) ?? 'local'
  const filebrowser = destination === 'filebrowser'

  const downloadPath = filebrowser ? FB_DOWNLOAD_PATH : '/downloads'

  let mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/config',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'downloads',
      subpath: null,
      mountpoint: '/downloads',
      readonly: false,
    })

  if (filebrowser) {
    mounts = mounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: FB_MOUNT,
      readonly: false,
    })
  }

  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'ytptube' },
    mounts,
    'ytptube-sub',
  )

  // Setup oneshot (runs as root before the daemon). YTPTube's image runs as the
  // unprivileged `app` user and its entrypoint aborts if it cannot write to its
  // config/download paths. `chmod 777` on the File Browser sub-folder makes the
  // cross-userns write work without matching uids (the idmapping means File
  // Browser's `user` and YTPTube's `app` do not line up on disk).
  const setupScript = filebrowser
    ? `chown -R app:app /config; mkdir -p '${FB_DOWNLOAD_PATH}' && chmod 777 '${FB_DOWNLOAD_PATH}'`
    : 'chown -R app:app /config /downloads'

  return sdk.Daemons.of(effects)
    .addOneshot('setup', {
      subcontainer: sub,
      exec: { command: ['sh', '-c', setupScript], user: 'root' },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: sub,
      // Image ENTRYPOINT (/entrypoint.sh) + default CMD, run as the image's
      // `app` user. We override the download path (and, for File Browser, the
      // temp path so large in-progress files don't fill the ephemeral rootfs),
      // and layer on StartOS-appropriate defaults:
      //   - BROWSER_CONTROL_ENABLED: rename/delete/move/mkdir in the built-in
      //     file manager (off upstream by default).
      //   - CHECK_FOR_UPDATES off: StartOS manages package updates.
      //   - AUTH_*: credentials generated on install (see init/watchAuth.ts).
      // Note: the in-app terminal (YTP_CONSOLE_ENABLED) is intentionally left
      // off — it executes commands and is a remote-exec surface.
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          YTP_BROWSER_CONTROL_ENABLED: 'true',
          YTP_CHECK_FOR_UPDATES: 'false',
          YTP_DOWNLOAD_PATH: downloadPath,
          ...(filebrowser ? { YTP_TEMP_PATH: downloadPath } : {}),
          ...(adminPassword
            ? {
                YTP_AUTH_USERNAME: authUsername,
                YTP_AUTH_PASSWORD: adminPassword,
              }
            : {}),
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['setup'],
    })
})
