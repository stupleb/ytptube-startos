import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { manifest as nextexplorerManifest } from 'nextexplorer-startos/startos/manifest'
import { destinations, RemoteDestination } from '../destinations'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { dbFile } from '../utils'

const remotes = ['filebrowser', 'nextexplorer'] as const

const locationName = (d: 'local' | RemoteDestination) =>
  d === 'local'
    ? i18n('Local Storage')
    : d === 'filebrowser'
      ? i18n('File Browser')
      : i18n('NextExplorer')

const formatSize = (bytes: number) =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
    : bytes >= 1024 ** 2
      ? `${Math.round(bytes / 1024 ** 2)} MB`
      : `${Math.round(bytes / 1024)} KB`

// Emergency wipe: every file YTPTube has downloaded, wherever it went, plus
// everything that records what was downloaded: the history, the download
// archive (every built-in preset passes --download-archive, so it lists each
// video) and the logs. Scheduled tasks are switched off rather than deleted:
// with the archive gone, a task left on would download everything it covers
// again on its next run. The account, presets, conditions and notifications
// are kept.
//
// It runs with YTPTube stopped, so nothing holds the database or writes new
// files while they are removed. It clears every destination, not only the
// current one: YTPTube itself only ever looks for files under the current
// download path, so after a switch of destination the files it saved earlier
// are out of its reach.
export const clearHistory = sdk.Action.withoutInput(
  // id
  'clear-history',

  // metadata
  async ({ effects }) => ({
    name: i18n('Clear History'),
    description: i18n(
      'Erase the download history and every file YTPTube has downloaded',
    ),
    warning: i18n(
      'This permanently deletes every file YTPTube has downloaded, in its own storage and in its folders in File Browser and NextExplorer, along with the download history, the download archive and the logs. Scheduled tasks are switched off, not deleted. Your account, presets and settings are kept, and existing StartOS backups are not touched. This cannot be undone.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),

  // execution
  async ({ effects }) => {
    // Only file managers that are installed. Never mount a volume that is not
    // there: StartOS 0.4.0.1 creates a missing one on mount.
    const installed = new Set(await effects.getInstalledPackages())
    const candidates = remotes.filter((d) =>
      installed.has(destinations[d].packageId),
    )

    // Which of them hold YTPTube's folder. Look with the whole volume mounted
    // read-only: mounting the folder itself read-write creates it where it is
    // missing, which in NextExplorer would add an empty YTPTube drive.
    let probeMounts = sdk.Mounts.of()
    if (candidates.includes('filebrowser'))
      probeMounts = probeMounts.mountDependency<typeof filebrowserManifest>({
        dependencyId: 'filebrowser',
        volumeId: 'data',
        subpath: null,
        mountpoint: '/probe/filebrowser',
        readonly: true,
      })
    if (candidates.includes('nextexplorer'))
      probeMounts = probeMounts.mountDependency<typeof nextexplorerManifest>({
        dependencyId: 'nextexplorer',
        volumeId: 'data',
        subpath: null,
        mountpoint: '/probe/nextexplorer',
        readonly: true,
      })
    const present: RemoteDestination[] = !candidates.length
      ? []
      : await sdk.SubContainer.withTemp(
          effects,
          { imageId: 'ytptube' },
          probeMounts,
          'clear-history-probe',
          async (sub) => {
            const found: RemoteDestination[] = []
            for (const d of candidates) {
              const dir = `/probe/${d}/${destinations[d].subpath}`
              if ((await sub.exec(['test', '-d', dir])).exitCode === 0)
                found.push(d)
            }
            return found
          },
        )

    // YTPTube's own volumes, plus only its folder in each file manager that
    // has one, so the deletions below cannot reach anything else.
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
    if (present.includes('filebrowser'))
      mounts = mounts.mountDependency<typeof filebrowserManifest>({
        dependencyId: 'filebrowser',
        volumeId: 'data',
        subpath: destinations.filebrowser.subpath,
        mountpoint: destinations.filebrowser.mountpoint,
        readonly: false,
      })
    if (present.includes('nextexplorer'))
      mounts = mounts.mountDependency<typeof nextexplorerManifest>({
        dependencyId: 'nextexplorer',
        volumeId: 'data',
        subpath: destinations.nextexplorer.subpath,
        mountpoint: destinations.nextexplorer.mountpoint,
        readonly: false,
      })
    const folders: { name: 'local' | RemoteDestination; path: string }[] = [
      { name: 'local', path: '/downloads' },
      ...present.map((d) => ({ name: d, path: destinations[d].mountpoint })),
    ]

    const summary = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'ytptube' },
      mounts,
      'clear-history',
      async (sub) => {
        let files = 0
        let bytes = 0
        for (const { path } of folders) {
          const sizes = await sub.execFail([
            'find',
            path,
            '-type',
            'f',
            '-printf',
            '%s\\n',
          ])
          for (const line of String(sizes.stdout).split('\n')) {
            if (!line.trim()) continue
            files += 1
            bytes += Number(line) || 0
          }
          // Everything inside the folder; the folder itself stays.
          await sub.execFail(['find', path, '-mindepth', '1', '-delete'])
        }

        let entries = 0
        let tasks = 0
        if ((await sub.exec(['test', '-f', dbFile])).exitCode === 0) {
          const sqlite = (sql: string) =>
            // As the image's own user, so the database's side files stay
            // owned by the account the daemon runs as.
            sub.execFail(['sqlite3', '-bail', dbFile, sql], { user: 'app' })
          const counts = await sqlite(
            'select count(*) from history; select count(*) from tasks where enabled = 1;',
          )
          ;[entries, tasks] = String(counts.stdout)
            .trim()
            .split('\n')
            .map((n) => Number(n) || 0)
          // VACUUM rewrites the file, so the deleted rows do not linger in
          // free pages.
          await sqlite(
            'delete from history; update tasks set enabled = 0 where enabled = 1; vacuum;',
          )
        }

        await sub.execFail(['rm', '-f', '/config/archive.log'])
        if ((await sub.exec(['test', '-d', '/config/logs'])).exitCode === 0)
          await sub.execFail([
            'find',
            '/config/logs',
            '-mindepth',
            '1',
            '-delete',
          ])

        return { files, bytes, entries, tasks }
      },
    )

    const message = [
      i18n(
        'History entries deleted: ${entries}. Files deleted: ${files} (${size}), from ${locations}. The download archive and logs were erased.',
        {
          entries: summary.entries,
          files: summary.files,
          size: formatSize(summary.bytes),
          locations: folders.map((f) => locationName(f.name)).join(', '),
        },
      ),
      ...(summary.tasks
        ? [
            i18n(
              'Scheduled tasks switched off: ${tasks}. Turn them back on in YTPTube when you want them to run again.',
              { tasks: summary.tasks },
            ),
          ]
        : []),
    ].join(' ')

    return {
      version: '1',
      title: i18n('History Cleared'),
      message,
      result: null,
    }
  },
)
