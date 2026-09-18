import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { store } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { authUsername, uiPort } from './utils'

// When File Browser is the chosen destination, downloads land in a
// 'ytptube-downloads' folder at the top level of File Browser's data volume.
// Only that folder is mounted (a subpath mount, auto-created by the host on
// first use), so YTPTube cannot touch the rest of File Browser's files. No
// idmap is needed on the mount: StartOS applies the same base id-mapping to
// every volume mount, so on-disk uids are shared 1:1 across services — and
// YTPTube's `app` and File Browser's `user` are both uid 1000 in their
// images, so files either side writes are natively owned by the other. If
// either image ever changes its uid, an `idmap` on the mount below
// ([{ fromId: <filebrowser uid>, toId: <ytptube uid> }]) is the remedy.
// The mountpoint keeps the container-visible path from before 2.5.6:1 (when
// the whole volume was mounted at /mnt/filebrowser), so any absolute paths
// YTPTube persisted — history entries, user-set templates — stay valid.
const FB_DOWNLOAD_PATH = '/mnt/filebrowser/ytptube-downloads'

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
      subpath: 'ytptube-downloads',
      mountpoint: FB_DOWNLOAD_PATH,
      readonly: false,
    })
  }

  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'ytptube' },
    mounts,
    'ytptube-sub',
  )

  // Setup oneshot (runs as root before the daemon). YTPTube's image runs as the
  // unprivileged `app` user and its entrypoint aborts unless its config/download
  // paths are writable. The File Browser folder is created root-owned by the
  // host on first mount (and pre-2.5.6:1 installs left it root-owned and
  // world-writable), so hand it to `app` — File Browser's `user` is the same
  // uid, so both services own it. The chmod strips the legacy 777 bit.
  const setupScript = filebrowser
    ? `chown -R app:app /config && chown app:app '${FB_DOWNLOAD_PATH}' && chmod 755 '${FB_DOWNLOAD_PATH}'`
    : 'chown -R app:app /config /downloads'

  return sdk.Daemons.of(effects)
    .addOneshot('setup', {
      subcontainer: sub,
      exec: { command: ['sh', '-c', setupScript], user: 'root' },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: sub,
      // Image ENTRYPOINT (`tini -g -- /entrypoint.sh`) + default CMD, run as
      // the image's `app` user. The entrypoint hands off to the image's
      // start-services script, which runs YTPTube alongside the bundled bgutil
      // YouTube PO-token server (Deno, :4416) and stops both if either exits.
      // We override the download path (and, for File Browser, the temp path so
      // large in-progress files don't fill the ephemeral rootfs), and layer on
      // StartOS-appropriate defaults:
      //   - BROWSER_CONTROL_ENABLED: rename/delete/move/mkdir in the built-in
      //     file manager (off upstream by default).
      //   - CHECK_FOR_UPDATES off: StartOS manages package updates.
      //   - AUTH_*: credentials generated on install (see init/watchAuth.ts).
      //   - TINI_SUBREAPER: a subcontainer's PID 1 is StartOS's own launcher,
      //     not tini, so tini must register as a child subreaper to reap the
      //     processes yt-dlp orphans (ffmpeg and friends). Without it tini
      //     warns on every start and zombie reaping falls to the launcher.
      // Note: the in-app terminal (YTP_CONSOLE_ENABLED) is intentionally left
      // off — it executes commands and is a remote-exec surface.
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          TINI_SUBREAPER: '1',
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
      // Don't report ready until a database-backed endpoint answers. YTPTube
      // opens its HTTP port BEFORE its SQLite connection finishes initializing
      // (the DB connects asynchronously on the STARTED event), so a port-only
      // check goes green too early — the user opens the UI and hits "Failed to
      // load configuration" during that window.
      //
      // `/api/auth/status` is public and counts rows in the users table, so it
      // proves the database is up without sending credentials. That matters
      // since upstream 2.7.0: the account lives in the database and the user
      // can change their own username and password in the app, which would
      // leave any credentialed probe of ours authenticating with stale details
      // and reporting a healthy service as broken.
      ready: {
        display: i18n('Web Interface'),
        gracePeriod: 60_000,
        fn: async () => {
          const ok = {
            result: 'success',
            message: i18n('The web interface is ready'),
          } as const
          const notOk = {
            result: 'failure',
            message: i18n('The web interface is not ready'),
          } as const
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 5_000)
          try {
            const res = await fetch(
              `http://localhost:${uiPort}/api/auth/status`,
              { signal: controller.signal },
            )
            return res.ok ? ok : notOk
          } catch {
            return notOk
          } finally {
            clearTimeout(timer)
          }
        },
      },
      requires: ['setup'],
    })
})
