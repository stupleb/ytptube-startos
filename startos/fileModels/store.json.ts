import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  // Generated on install (see init/watchAuth.ts); injected as YTP_AUTH_PASSWORD.
  adminPassword: z.string().optional().catch(undefined),
  // Where downloads are saved. 'filebrowser' points YTP_DOWNLOAD_PATH at File
  // Browser's volume (see main.ts). Undefined is treated as 'local'.
  downloadDestination: z.enum(['local', 'filebrowser']).optional().catch(undefined),
})

export const store = FileHelper.json(
  {
    base: sdk.volumes.startos,
    subpath: '/store.json',
  },
  shape,
)

export type StoreType = z.infer<typeof shape>
