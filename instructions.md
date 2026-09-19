# YTPTube

## Documentation

- [YTPTube README](https://github.com/arabcoders/ytptube/blob/master/README.md) — the upstream README for the application this package runs.

## What you get on StartOS

- **YTPTube's web app** at the **Web UI** interface, with its login switched on — upstream leaves it off.
- **Downloads kept on your server**, inside YTPTube or, if you choose, in File Browser or NextExplorer, where you can browse, share, and manage them.

## Signing in

A random password is generated for YTPTube's **admin** account when you install it.

1. Run the **Reset Admin Password** action (a prompt on the service page links to it). It generates a fresh password and shows it with the username, `admin`.
2. Use them on YTPTube's sign-in page.

Run **Reset Admin Password** again any time to roll a new password. It works immediately, and everyone who is signed in is signed out.

## Managing your account

Once you're signed in, YTPTube looks after the account itself: from its settings you can change your username and password, see which devices are signed in and sign them out one by one, and create API keys for other tools.

If you change your password inside YTPTube, the one StartOS last showed you stops working. If you lose it, **Reset Admin Password** always gets you back in.

## Getting set up

1. Open YTPTube's **Dashboard** tab.
2. Click the **Web UI** interface and sign in.
3. Paste a video or playlist URL to start downloading. Presets, schedules, and output options live in YTPTube's own settings.

## Saving downloads to a file manager

By default, downloads are saved inside YTPTube. You can have them land in File Browser or NextExplorer instead, where you can browse, share, and manage them.

### File Browser

1. Install **FileBrowser Quantum** from the Marketplace.
2. In YTPTube, run the **Select Download Destination** action and choose **File Browser**.
3. YTPTube restarts, and from then on every download goes into a `ytptube-downloads` folder in File Browser.

If you already run the older File Browser, it works too, but it is no longer maintained. Switching it to FileBrowser Quantum keeps your files, and YTPTube keeps saving to the same folder.

### NextExplorer

1. Install **NextExplorer** from the Marketplace.
2. In YTPTube, run the **Select Download Destination** action and choose **NextExplorer**.
3. YTPTube restarts, and from then on every download goes into a drive called **YTPTube** in NextExplorer.

NextExplorer's admin account sees the YTPTube drive straight away. To let another NextExplorer account see it, go to **Settings → Admin → Users** in NextExplorer, open that account's **Volumes** tab, and add the drive.

**Moving from File Browser to NextExplorer?** NextExplorer's **Import Files from File Browser** action copies your existing downloads into its FileBrowser drive. Then choose **NextExplorer** here, so new downloads go to the YTPTube drive, before you uninstall File Browser.

### Either way

This is an either/or choice: while a file manager is selected, it is the *only* place downloads go. Switch back any time by choosing **Local Storage** — files already saved stay where they are.

If the file manager you chose is uninstalled, YTPTube saves downloads inside itself instead and shows a prompt on its service page until you reinstall it or choose another destination.

## Backups

StartOS backups include your YTPTube settings, history, and account. **Downloaded media is not.** Downloads saved in File Browser or NextExplorer are covered by that service's own backup; copy local downloads off the server yourself if you need to keep them.
