import { sdk } from '../sdk'
import { clearHistory } from './clearHistory'
import { downloadDestination } from './downloadDestination'
import { downloadSettings } from './downloadSettings'
import { resetAdminPassword } from './resetAdminPassword'
import { ytdlpSettings } from './ytdlpSettings'

export const actions = sdk.Actions.of()
  .addAction(resetAdminPassword)
  .addAction(downloadDestination)
  .addAction(downloadSettings)
  .addAction(ytdlpSettings)
  .addAction(clearHistory)
