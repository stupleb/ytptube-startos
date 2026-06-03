import { sdk } from '../sdk'
import { resetAdminPassword } from './resetAdminPassword'
import { downloadDestination } from './downloadDestination'

export const actions = sdk.Actions.of()
  .addAction(resetAdminPassword)
  .addAction(downloadDestination)
