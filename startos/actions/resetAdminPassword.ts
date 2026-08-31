import { utils } from '@start9labs/start-sdk'
import { store } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { authUsername, configMounts, dbFile } from '../utils'

export const newPassword = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })

// One click: generate a fresh admin password, apply it, and show the new
// credentials. Same action covers first-set and rotation.
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

    // Since 2.7.0 YTPTube keeps accounts in its own database and seeds one from
    // YTP_AUTH_* only while the users table is empty, so rewriting that env var
    // no longer changes the login. Reset the stored account directly, with
    // upstream's own script — which also revokes every active session, so
    // signed-in browsers are logged out. API keys are left alone.
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'ytptube' },
      configMounts,
      'reset-password',
      async (sub) => {
        // No database yet — the service has never started, so there is no
        // account to reset and the env seeds it on first boot.
        const db = await sub.exec(['test', '-f', dbFile])
        if (db.exitCode !== 0) return

        await sub.execFail(
          [
            '/opt/python/bin/python',
            '-m',
            'app.scripts.reset_password',
            '--username',
            authUsername,
          ],
          {
            cwd: '/app',
            // As the image's own user, so the sqlite side files it touches stay
            // owned by the account the daemon runs as.
            user: 'app',
            // The script prompts for the password twice (getpass falls back to
            // stdin when there is no tty).
            input: `${adminPassword}\n${adminPassword}\n`,
          },
        )
      },
    )

    // Keep the stored copy in step: it is what gets injected as YTP_AUTH_* to
    // seed the account on a fresh install, and it is the user's record of the
    // current password.
    await store.merge(effects, { adminPassword })

    return {
      version: '1',
      title: i18n('YTPTube Login Credentials'),
      message: i18n(
        'Your new admin password. Any signed-in browser is now signed out.',
      ),
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
