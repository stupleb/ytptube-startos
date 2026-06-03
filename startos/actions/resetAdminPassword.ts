import { utils } from '@start9labs/start-sdk'
import { store } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { authUsername } from '../utils'

export const newPassword = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })

// One click: generate a fresh admin password, store it, and show the new
// credentials. (main.ts reads the password reactively, so the service restarts
// to apply it.) Same action covers first-set and rotation.
export const resetAdminPassword = sdk.Action.withoutInput(
  // id
  'reset-admin-password',

  // metadata
  async ({ effects }) => ({
    name: i18n('Reset Admin Password'),
    description: i18n('Generate a new random admin password and display it'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // execution
  async ({ effects }) => {
    const adminPassword = newPassword()
    await store.merge(effects, { adminPassword })

    return {
      version: '1',
      title: i18n('YTPTube Login Credentials'),
      message: i18n('Your new admin password. The service restarts to apply it.'),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: authUsername,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: adminPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
