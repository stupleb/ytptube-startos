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

  // actions/downloadSettings.ts
  'Downloads at Once per Site': 23,
  'How many downloads from the same site run at the same time. Raising it for YouTube makes YouTube more likely to slow down or block your downloads.': 24,
  'Downloads at Once in Total': 25,
  'How many downloads run at the same time across all sites. Lower it on a server with little memory.': 26,
  Retries: 27,
  'Extra attempts for a download that fails with a temporary error. 0 turns retries off.': 28,
  'Forget Finished Downloads After': 29,
  'Removes finished downloads from the history list after this many days. Their files are kept. 0 keeps history forever.': 30,
  days: 31,
  'Delete Files With Their History Entries': 32,
  'When on, deleting a finished download in YTPTube, one at a time or by clearing the whole list, also deletes its file. YTPTube looks for that file in the current download destination only: after you switch destinations, files saved earlier are left behind, and a different file with the same name in the new destination would be deleted instead.': 33,
  'While this is on, clearing the list of finished downloads in YTPTube also deletes their files.': 34,
  'Download Settings': 35,
  'How many downloads run at once, retries, and what happens to finished downloads': 36,

  // actions/ytdlpSettings.ts
  'yt-dlp Release': 37,
  'Which yt-dlp YTPTube installs when it starts. Stable suits almost everyone. When YouTube changes something and downloads start failing, the fix usually reaches Nightly first. Changing this restarts YTPTube.': 38,
  'Stable (recommended)': 39,
  Nightly: 40,
  'Specific Version': 41,
  Version: 42,
  'A yt-dlp release to stay on, as shown on its releases page.': 43,
  'A release version, such as 2026.08.19': 44,
  'Verbose yt-dlp Logging': 45,
  "Writes yt-dlp's detailed output for every download to the service logs, which helps when downloads fail. That detail includes the web addresses YouTube serves videos from, which contain your public IP address, so check logs before sharing them, and turn this off when you are done.": 46,
  'yt-dlp Settings': 47,
  'Choose which yt-dlp release to use, and turn on detailed logging for troubleshooting': 48,

  // actions/clearHistory.ts
  'Clear History': 49,
  'Erase the download history and every file YTPTube has downloaded': 50,
  'This permanently deletes every file YTPTube has downloaded, in its own storage and in its folders in File Browser and NextExplorer, along with the download history, the download archive and the logs. Scheduled tasks are switched off, not deleted. Your account, presets and settings are kept, and existing StartOS backups are not touched. This cannot be undone.': 51,
  'History entries deleted: ${entries}. Files deleted: ${files} (${size}), from ${locations}. The download archive and logs were erased.': 52,
  'Scheduled tasks switched off: ${tasks}. Turn them back on in YTPTube when you want them to run again.': 53,
  'History Cleared': 54,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
