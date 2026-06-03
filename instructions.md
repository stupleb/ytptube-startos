# YTPTube

YTPTube is a self-hosted web interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp). Use it to download video and audio from YouTube and many other sites, with queued and concurrent downloads, scheduling, presets, and notifications.

## Documentation

- [YTPTube upstream docs](https://github.com/arabcoders/ytptube/blob/master/README.md) — the README for the application this package runs.

## What you get on StartOS

- **A running YTPTube web app** at the **Web UI** interface.
- **Two data locations**: settings and the download database live in the `main` volume (`/config`); finished downloads live in the `downloads` volume (`/downloads`).

## Signing in

This package turns on YTPTube's login (which upstream leaves off). On install, a random **admin** password is generated for you.

1. Run the **Reset Admin Password** action (a task on the service page also links to it). It generates a fresh password and shows it, with the username (`admin`).
2. Use them to sign in to the Web UI.

Run **Reset Admin Password** again any time to roll a new one — the service restarts with the new password.

## Getting set up

1. Open YTPTube's **Dashboard** tab.
2. Click the **Web UI** interface and sign in.
3. Paste a video or playlist URL to start downloading. Configure presets, schedules, and output options from within YTPTube's own settings.

## Saving downloads to File Browser

By default, downloads are saved inside YTPTube. If you'd rather have them land in [File Browser](https://github.com/Start9Labs/filebrowser-startos) (so you can browse, share, and manage them there):

1. Install **File Browser** from the Marketplace and start it at least once.
2. In YTPTube, run the **Select Download Destination** action and choose **File Browser**.
3. YTPTube restarts; from then on all downloads go into a `ytptube-downloads` folder inside File Browser.

This is an either/or choice — while File Browser is selected it's the *only* place downloads are saved, not an extra folder alongside local downloads. Switch back any time by choosing **Local Storage** again (files already saved in File Browser stay there).

## Backups

- StartOS backups include your YTPTube **settings and database** (the `/config` volume).
- **Downloaded media is not backed up.** If you need to preserve downloads, copy them off the server yourself.

## Limitations

- YTPTube settings are managed entirely through YTPTube's own web UI, not through StartOS.
