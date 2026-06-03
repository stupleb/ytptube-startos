import { resetAdminPassword, newPassword } from '../actions/resetAdminPassword'
import { store } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

// Secure by default: generate an admin password the first time the service is
// initialized (so YTPTube boots with auth already enabled — no open window),
// then surface a task pointing the user at the Reset Admin Password action to
// get a known one. Idempotent: once a password is stored, nothing happens on
// later inits.
export const watchAuth = sdk.setupOnInit(async (effects) => {
  // `.once()` not `.const()` — a const read establishes a reactive dependency
  // that forbids writing the same file later in this init pass (the merge below).
  const adminPassword = await store.read((s) => s.adminPassword).once()

  if (!adminPassword) {
    await store.merge(effects, { adminPassword: newPassword() })
    await sdk.action.createOwnTask(effects, resetAdminPassword, 'important', {
      reason: i18n('Set your YTPTube admin password'),
    })
  }
})
