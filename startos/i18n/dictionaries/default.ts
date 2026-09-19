export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting YTPTube!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of YTPTube': 5,

  // actions/downloadDestination.ts
  'Download Destination': 6,
  'Where YTPTube saves downloads. "File Browser" or "NextExplorer" sends every download into that service (it becomes the only download location while selected); "Local Storage" keeps them in YTPTube.': 7,
  'Local Storage': 8,
  'File Browser': 9,
  'Select Download Destination': 10,
  'Where YTPTube saves downloads': 11,

  // actions/resetAdminPassword.ts + init/watchAuth.ts
  'Reset Admin Password': 12,
  'Generate a new random admin password and display it': 13,
  'YTPTube Login Credentials': 14,
  'Your new admin password. Any signed-in browser is now signed out.': 15,
  Username: 16,
  Password: 17,
  'Set your YTPTube admin password': 18,

  // actions/downloadDestination.ts + init/watchDestination.ts + main.ts
  NextExplorer: 19,
  'File Browser is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.': 20,
  'NextExplorer is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.': 21,
  'The download destination is not ready yet, so downloads are going to Local Storage for now. YTPTube switches over by itself once it is.': 22,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
