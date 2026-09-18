import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

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
})

export const store = FileHelper.json(
  {
    base: sdk.volumes.startos,
    subpath: '/store.json',
  },
  shape,
)

export type StoreType = z.infer<typeof shape>
