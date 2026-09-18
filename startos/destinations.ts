import { T, utils } from '@start9labs/start-sdk'

// Where downloads can go besides the local `downloads` volume: a folder in
// another service's `data` volume, mounted into YTPTube.
export const destinations = {
  filebrowser: {
    packageId: 'filebrowser',
    // A folder at the top of File Browser's `data` volume.
    subpath: 'ytptube-downloads',
    // The container path this destination has always used. YTPTube stores
    // absolute paths for queued downloads, so it must not move.
    mountpoint: '/mnt/filebrowser/ytptube-downloads',
  },
  nextexplorer: {
    packageId: 'nextexplorer',
    // NextExplorer shows each top-level folder of its `data` volume as a drive,
    // so this appears there as a drive named YTPTube.
    subpath: 'YTPTube',
    mountpoint: '/mnt/nextexplorer/YTPTube',
  },
} as const

export type RemoteDestination = keyof typeof destinations
export type Destination = 'local' | RemoteDestination

// Watches only whether a package is installed. `sdk.getStatus()` re-runs its
// context on every status change — start, stop, a health result — so reading
// it with `.const()` in main would restart YTPTube each time File Browser
// merely started or stopped. Mapping the status to a boolean lets Watchable's
// dedup ignore everything but install and uninstall. The OS returns no status
// only for a package that is not installed; an update keeps the entry.
export class PackageInstalled extends utils.Watchable<
  T.StatusInfo | null,
  boolean
> {
  protected readonly label = 'PackageInstalled'

  constructor(
    effects: T.Effects,
    readonly packageId: T.PackageId,
  ) {
    super(effects, { map: (status) => status !== null })
  }

  protected fetch(callback?: () => void) {
    return this.effects.getStatus({ packageId: this.packageId, callback })
  }
}

// Re-runs the context that reads it, once, `ms` after it is first read. For a
// condition nothing else signals: a service counts as installed from the
// moment its install or restore begins, before its volume exists, and no
// status change marks the moment the volume appears.
export class RetryAfter extends utils.Watchable<number> {
  protected readonly label = 'RetryAfter'
  private fetches = 0

  constructor(
    effects: T.Effects,
    readonly ms: number,
  ) {
    super(effects)
  }

  protected async fetch(callback?: () => void) {
    if (callback) setTimeout(callback, this.ms)
    return this.fetches++
  }
}
