import { resetAdminPassword } from '../actions/resetAdminPassword'
import { store } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export const watchAuth = sdk.setupOnInit(async (effects) => {
  if (!(await store.read((s) => s.adminPassword).const(effects)))
    await sdk.action.createOwnTask(effects, resetAdminPassword, 'critical', {
      reason: i18n('Set your YTPTube admin password'),
    })
})
