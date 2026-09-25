import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const count = z.number().int().min(0).optional().catch(undefined)

const shape = z.looseObject({
  // Generated on install (see init/watchAuth.ts); injected as YTP_AUTH_PASSWORD.
  adminPassword: z.string().optional().catch(undefined),
  // Where downloads are saved: YTPTube's own volume, or a folder in File
  // Browser's or NextExplorer's (see destinations.ts). Undefined is treated as
  // 'local'. This is the user's choice; main falls back to local while the
  // chosen service is not installed, without changing it here.
  downloadDestination: z
    .enum(['local', 'filebrowser', 'nextexplorer'])
    .optional()
    .catch(undefined),

  // Download Settings (actions/downloadSettings.ts), each passed to YTPTube as
  // the YTP_* variable named alongside. Undefined leaves upstream's default.
  maxWorkers: count, // YTP_MAX_WORKERS
  maxWorkersPerExtractor: count, // YTP_MAX_WORKERS_PER_EXTRACTOR
  retry: count, // YTP_RETRY
  autoClearHistoryDays: count, // YTP_AUTO_CLEAR_HISTORY_DAYS
  removeFiles: z.boolean().optional().catch(undefined), // YTP_REMOVE_FILES

  // yt-dlp Settings (actions/ytdlpSettings.ts). `ytdlpVersion` is 'stable'
  // (or undefined), 'nightly', or a release version, and becomes
  // YTP_YTDLP_VERSION for anything but stable.
  ytdlpVersion: z.string().optional().catch(undefined),
  ytdlpDebug: z.boolean().optional().catch(undefined), // YTP_YTDLP_DEBUG
})

export const store = FileHelper.json(
  {
    base: sdk.volumes.startos,
    subpath: '/store.json',
  },
  shape,
)

export type StoreType = z.infer<typeof shape>
