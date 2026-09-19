import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextexplorerManifest } from 'nextexplorer-startos/startos/manifest'
import {
  Destination,
  destinations,
  PackageInstalled,
  RetryAfter,
} from './destinations'
import { store } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { authUsername, uiPort } from './utils'

// Downloads can go to a folder in another service's `data` volume instead of
// YTPTube's own `downloads` volume (see destinations.ts). Only that folder is
// mounted — a subpath mount, created by the host on first use — so YTPTube
// cannot touch the rest of the other service's files. No idmap is needed:
// StartOS applies the same base id-mapping to every volume mount, so on-disk
// uids are shared 1:1 across services, and YTPTube's `app`, File Browser's
// user and NextExplorer's server all run as uid 1000 — files either side
// writes are natively owned by the other. If an image ever changes its uid, an
// `idmap` on the mount ([{ fromId: <their uid>, toId: <ytptube uid> }]) is the
// remedy.

// How long to wait before retrying a destination whose volume was not there
// yet (see below). Doubles per failed attempt, capped, so a long restore does
// not restart YTPTube every half minute; resets once a mount succeeds.
const firstRetryMs = 30_000
const maxRetryMs = 5 * 60_000
let retryMs = firstRetryMs

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting YTPTube!'))

  // Reactive reads — a change to any of them restarts the daemon so the mount
  // set and env below are re-evaluated.
  const adminPassword = await store.read((s) => s.adminPassword).const(effects)
  const destination =
    (await store.read((s) => s.downloadDestination).const(effects)) ?? 'local'

  // A destination whose service is not installed would leave downloads in a
  // volume no installed service shows, so fall back to local storage until it
  // is back; init/watchDestination.ts tells the user. PackageInstalled re-runs
  // this only when that service is installed or uninstalled, not when it
  // merely starts or stops.
  const installed =
    destination !== 'local' &&
    (await new PackageInstalled(
      effects,
      destinations[destination].packageId,
    ).const())
  if (destination === 'filebrowser' && !installed)
    console.warn(
      i18n(
        'File Browser is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.',
      ),
    )
  if (destination === 'nextexplorer' && !installed)
    console.warn(
      i18n(
        'NextExplorer is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.',
      ),
    )

  const localMounts = sdk.Mounts.of()
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

  const remoteMounts = !installed
    ? null
    : destination === 'filebrowser'
      ? localMounts.mountDependency<typeof filebrowserManifest>({
          dependencyId: 'filebrowser',
          volumeId: 'data',
          subpath: destinations.filebrowser.subpath,
          mountpoint: destinations.filebrowser.mountpoint,
          readonly: false,
        })
      : destination === 'nextexplorer'
        ? localMounts.mountDependency<typeof nextexplorerManifest>({
            dependencyId: 'nextexplorer',
            volumeId: 'data',
            subpath: destinations.nextexplorer.subpath,
            mountpoint: destinations.nextexplorer.mountpoint,
            readonly: false,
          })
        : null

  let effective: Destination = 'local'
  let sub: ReturnType<typeof sdk.SubContainer.of> | null = null
  if (remoteMounts) {
    const remote = sdk.SubContainer.of(
      effects,
      { imageId: 'ytptube' },
      remoteMounts,
      'ytptube-sub',
    )
    // Materialize here rather than on the setup oneshot's first run. The
    // service counts as installed from the moment its install or restore
    // begins, before its volume exists, and StartOS refuses to mount a volume
    // that doesn't exist. Failing inside the oneshot would be permanent: the
    // lazy handle caches a rejected materialization, so every retry fails the
    // same way. Here it can fall back to local storage and try again later —
    // nothing else re-runs main when that install finishes.
    try {
      await remote.eager()
      sub = remote
      effective = destination
      retryMs = firstRetryMs
    } catch (e) {
      console.warn(
        i18n(
          'The download destination is not ready yet, so downloads are going to Local Storage for now. YTPTube switches over by itself once it is.',
        ),
        e,
      )
      await new RetryAfter(effects, retryMs).const()
      retryMs = Math.min(retryMs * 2, maxRetryMs)
    }
  }
  sub ??= sdk.SubContainer.of(
    effects,
    { imageId: 'ytptube' },
    localMounts,
    'ytptube-sub',
  )

  const downloadPath =
    effective === 'local' ? '/downloads' : destinations[effective].mountpoint

  // Setup oneshot (runs as root before the daemon). YTPTube's image runs as the
  // unprivileged `app` user and its entrypoint aborts unless its config and
  // download paths are writable. A destination folder is created root-owned by
  // the host on first mount, so hand it to `app`; the other service's user is
  // the same uid, so both services own it. The chmod also strips the
  // world-writable bit that installs of older versions of this package left on
  // the File Browser folder.
  const setupScript =
    effective === 'local'
      ? 'chown -R app:app /config /downloads'
      : `chown -R app:app /config && chown app:app '${downloadPath}' && chmod 755 '${downloadPath}'`

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
      // We override the download path (and, for File Browser or NextExplorer,
      // the temp path, so large in-progress files don't fill the ephemeral
      // rootfs), and layer on StartOS-appropriate defaults:
      //   - BROWSER_CONTROL_ENABLED: rename/delete/move/mkdir in the built-in
      //     file manager (off upstream by default).
      //   - CHECK_FOR_UPDATES off: StartOS manages package updates.
      //   - AUTH_*: credentials generated on install (see init/watchAuth.ts).
      // Note: the in-app terminal (YTP_CONSOLE_ENABLED) is intentionally left
      // off — it executes commands and is a remote-exec surface.
      exec: {
        command: sdk.useEntrypoint(),
        // Launch the entrypoint as the subcontainer's PID 1. That entrypoint is
        // tini, which otherwise runs under StartOS's launcher, warns on every
        // start that it is not PID 1, and cannot reap the processes yt-dlp
        // orphans (ffmpeg and friends). The setup oneshot is unaffected: it
        // exits before this daemon starts.
        runAsInit: true,
        env: {
          YTP_BROWSER_CONTROL_ENABLED: 'true',
          YTP_CHECK_FOR_UPDATES: 'false',
          YTP_DOWNLOAD_PATH: downloadPath,
          ...(effective !== 'local' ? { YTP_TEMP_PATH: downloadPath } : {}),
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
