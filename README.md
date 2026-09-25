<p align="center">
  <img src="icon.png" alt="YTPTube Logo" width="21%">
</p>

# YTPTube on StartOS

> Everything not listed in this document should behave the same as upstream
> YTPTube. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[YTPTube](https://github.com/arabcoders/ytptube) is a self-hosted web interface for yt-dlp: queued and concurrent downloads of video and audio from YouTube and many other sites, with scheduling, presets, and notifications. This package runs the upstream image unmodified, turns on its login, and can save downloads into File Browser or NextExplorer.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs upstream's published image as-is, in one subcontainer that hosts two cooperating processes.

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Image         | `ghcr.io/arabcoders/ytptube` (upstream, unmodified) |
| Architectures | x86_64, aarch64                                    |
| Entrypoint    | Image default                                      |

The image's entrypoint is `tini`, which runs a script that checks `/config` and the download path are writable, then starts **two processes side by side**: YTPTube itself (Python) and the bundled bgutil **YouTube PO-token server** (Deno, listening on port 4416 inside the container). yt-dlp asks that server for the proof-of-origin tokens YouTube requires for many videos. If either process exits, the script stops the other and exits, and StartOS restarts the daemon — so a crashed token server shows up as a brief restart, not as YouTube downloads quietly failing. The token server costs memory: measured at roughly 160 MB resident, somewhat more than YTPTube itself.

The daemon is launched with `runAsInit`, which makes `tini` the subcontainer's PID 1. Without it, `tini` runs under StartOS's own launcher, warns on every start that it is not PID 1, and cannot reap the processes yt-dlp leaves orphaned (ffmpeg and friends).

Subcontainers:

- **`ytptube-sub`** — everything that runs: a `setup` oneshot as root, then the `primary` daemon as the image's `app` user (uid 1000). Attach with `start-cli package attach ytptube -n ytptube-sub -- <cmd>`.
- **`reset-password`** — a temporary subcontainer the Reset Admin Password action creates to run upstream's reset script against the database, then discards.

---

## Volume and Data Layout

Settings and history live in an embedded SQLite database on the `main` volume; downloads land on the `downloads` volume or, optionally, in File Browser or NextExplorer.

| Volume      | Mount point   | Contents                                                                                         |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `startos`   | not mounted   | `store.json` — see [File Models](#file-models)                                                   |
| `main`      | `/config`     | `ytptube.db` (settings, history, the account and its sessions and API keys), presets, logs, and the packages yt-dlp self-updates into |
| `downloads` | `/downloads`  | Finished downloads, while the destination is Local Storage                                       |

In-progress files and yt-dlp's scratch data go to the container's ephemeral `/tmp`, as does the token server's state. With another service as the destination, only one folder of its `data` volume is mounted, read-write; YTPTube's download and temp paths both point there, the local `downloads` volume sits idle, and YTPTube cannot see the rest of that service's files:

| Destination  | Folder in its `data` volume | Mounted in YTPTube at                  |
| ------------ | --------------------------- | -------------------------------------- |
| File Browser | `ytptube-downloads`         | `/mnt/filebrowser/ytptube-downloads`   |
| NextExplorer | `YTPTube`                   | `/mnt/nextexplorer/YTPTube`            |

NextExplorer shows each top-level folder of its volume as a drive, so the NextExplorer folder appears there as a drive named YTPTube.

While the chosen service is **not installed**, YTPTube saves to the local `downloads` volume instead and raises a prompt (see [Tasks](#tasks)). It never writes into the folder then, because an uninstalled service's volume is shown by nothing. The stored choice is kept, so reinstalling the service switches YTPTube back to it automatically. Starting or stopping that service does not restart YTPTube; only installing or uninstalling it does.

A service counts as installed as soon as its install or restore begins, before its volume exists. If YTPTube finds the volume missing then, it saves locally too and tries the mount again after 30 seconds, doubling the wait each time up to five minutes, until the volume appears. Each attempt restarts YTPTube, and the logs say "not ready yet" while it waits.

Files are shared between the services without an idmap: StartOS mounts every volume in one shared id space, and YTPTube's `app`, File Browser's user and NextExplorer's server all run as uid 1000, so each natively owns what the other writes. The `setup` oneshot runs before the daemon on every start and chowns `/config` to `app` recursively, along with either `/downloads` (recursively) or the destination folder itself, which it also sets to mode `755`. The host creates that folder root-owned on first mount; the oneshot is what hands it to `app`, and a root-owned folder would be listed by the other service but unwritable there.

---

## File Models

The package keeps one file of its own and configures YTPTube through environment variables; YTPTube's own settings are edited in its UI and stored in its database, which the package never writes.

**`store.json`** (JSON, `startos` volume):

- `adminPassword` — generated at install; rewritten only by Reset Admin Password. It is passed to YTPTube as `YTP_AUTH_PASSWORD`, which YTPTube reads **only while it has no account yet** (see below). After the first boot the database owns the password, so this copy goes stale if the user changes the password inside YTPTube. Reset Admin Password brings the two back into step.
- `downloadDestination` — `local`, `filebrowser` or `nextexplorer`, written by Select Download Destination; read on every start to pick the mounts and the dependency. It is the user's choice and is never rewritten by the fallback described under [Volume and Data Layout](#volume-and-data-layout).
- `maxWorkers`, `maxWorkersPerExtractor`, `retry`, `autoClearHistoryDays`, `removeFiles` — written by Download Settings. `ytdlpVersion` (`stable`, `nightly`, or a release number) and `ytdlpDebug` — written by yt-dlp Settings. All are absent until their action is first saved, and while absent YTPTube's own defaults apply. They belong to the user; the package only reads them, on every start.

**Environment variables**, re-asserted on every start:

| Variable                      | Value                                   | Why |
| ----------------------------- | --------------------------------------- | --- |
| `YTP_BROWSER_CONTROL_ENABLED` | `true`                                  | Enables rename, delete, move, and new-folder in YTPTube's file manager (off upstream). |
| `YTP_CHECK_FOR_UPDATES`       | `false`                                 | StartOS manages updates, so the in-app update check and banner are off. |
| `YTP_DOWNLOAD_PATH`           | `/downloads` or the destination folder  | Follows the destination actually in use. |
| `YTP_TEMP_PATH`               | the destination folder                  | File Browser or NextExplorer destination only, so large in-progress files don't fill the ephemeral root filesystem. |

**Set only once the user has chosen a value** (see [Actions](#actions)):

| Variable                                                                                                                         | Value                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `YTP_MAX_WORKERS`, `YTP_MAX_WORKERS_PER_EXTRACTOR`, `YTP_RETRY`, `YTP_AUTO_CLEAR_HISTORY_DAYS`, `YTP_REMOVE_FILES`               | from Download Settings                               |
| `YTP_YTDLP_VERSION`                                                                                                              | `nightly` or a release number; not set for stable    |
| `YTP_YTDLP_DEBUG`                                                                                                                | from yt-dlp Settings                                 |
| `YTP_LOG_LEVEL`                                                                                                                  | `debug` while verbose yt-dlp logging is on           |

Verbose logging needs both of the last two. `YTP_YTDLP_DEBUG` puts yt-dlp in verbose mode, but YTPTube logs those lines at DEBUG level with their `[debug]` prefix stripped, and its default `info` level drops them. With both set, the service logs show yt-dlp's version, its PO-token providers, and every media request, including the googlevideo URLs, which embed the server's public IP.

`YTP_AUTH_USERNAME` (`admin`) and `YTP_AUTH_PASSWORD` are also passed every start, but YTPTube consumes them **only on a launch that finds its users table empty**, to create the one account it allows. From then on they are ignored: changing them does not change the login, and anything that rotates the password has to act on the database — which is why Reset Admin Password runs upstream's reset script rather than rewriting the variable.

The in-app terminal (`YTP_CONSOLE_ENABLED`) is left off because it executes commands. yt-dlp's self-update stays at the upstream default (on), which is why the service makes an outbound call on each start; yt-dlp Settings chooses what it updates to. Settings that would open a remote-execution surface or remove the login — `YTP_DISABLE_AUTH`, `YTP_CONSOLE_ENABLED`, `YTP_DEBUG`, `YTP_PIP_PACKAGES` — are deliberately not exposed by any action.

---

## Dependencies

YTPTube depends on nothing unless File Browser or NextExplorer is chosen as the download destination, and then only on that one.

| Dependency   | Required                          | Health checks required                   | Mount |
| ------------ | --------------------------------- | ---------------------------------------- | ----- |
| File Browser | Only while it is the destination  | None — it must be installed, not running | `ytptube-downloads` from its `data` volume at `/mnt/filebrowser/ytptube-downloads`, read-write |
| NextExplorer | Only while it is the destination  | None — it must be installed, not running | `YTPTube` from its `data` volume at `/mnt/nextexplorer/YTPTube`, read-write |

Each is needed only as a place to put files, so it can be stopped while YTPTube runs. Either package that ships under the `filebrowser` id satisfies the File Browser dependency — the original File Browser or its successor, FileBrowser Quantum. All three expose a `data` volume and run as uid 1000, which the shared-ownership scheme above relies on.

---

## Network Access and Interfaces

The service exposes one interface: YTPTube's web UI and API.

| Interface | ID   | Type | Port | Protocol | Purpose                   |
| --------- | ---- | ---- | ---- | -------- | ------------------------- |
| Web UI    | `ui` | ui   | 8081 | HTTP     | YTPTube's web app and API |

The token server's port 4416 is used only inside the container and is not an interface.

---

## Installation and First-Run Flow

Upstream ships with no login; this package turns it on before the first boot, so there is no window in which the UI is open.

At install, the init step generates a random password into `store.json` and raises the task described under [Tasks](#tasks). On first start the `setup` oneshot fixes ownership, and YTPTube creates its single account from the injected credentials — username `admin` — so its first-run setup screen never appears. The user gets a password they can read by running Reset Admin Password; the generated one is never shown.

---

## Actions

One action recovers access to the account and one chooses where downloads go; two tune YTPTube, and one erases everything it has downloaded.

**Reset Admin Password** — run it to get a password on first install, or to recover access at any time, including after the password or username was changed inside YTPTube.

- *Changes:* resets the password of YTPTube's single account in `ytptube.db`, finding the account by its current name, which the user may have changed; revokes every active session, so all signed-in browsers are signed out; stores the new password in `store.json`. API keys are left alone. If the database doesn't exist yet (the service has never started), only `store.json` changes, and the account is created with that password on first boot.
- *Cost:* a few seconds; the change to `store.json` restarts the daemon, interrupting downloads in progress.
- *Repeat safety:* safe; each run issues a new password and signs everyone out again.
- *Outputs:* the account's username and the new password.

**Select Download Destination** — choose Local Storage, File Browser, or NextExplorer. Also the target of the prompt raised while the chosen service is not installed.

- *Changes:* `downloadDestination` in `store.json`, which changes the mounts and which service, if any, is declared as a dependency. Existing downloads are not moved, and downloads still queued keep the path they were queued with, so they fail once it is no longer mounted.
- *Cost:* the daemon restarts to apply it.
- *Repeat safety:* idempotent.

**Download Settings** — run it to limit how many downloads run at once (a server short of memory, or YouTube slowing downloads), to retry downloads that fail on a temporary error, to keep the history list short, or to have YTPTube delete files along with their history entries.

- *Changes:* the five Download Settings keys in `store.json`, passed as the variables listed under [File Models](#file-models). Until first saved, the form shows YTPTube's defaults: 2 per site, 20 in total, no retries, history kept forever, files kept. Forgetting finished downloads after N days removes history records only; YTPTube's automatic clean-up never deletes files, whatever the delete-files setting says. With delete-files on, every deletion in YTPTube's UI also removes the file and its same-named sidecars (`<name>.*`), including clearing the whole finished list. See [Limitations](#limitations-and-differences) for how that behaves after a change of destination.
- *Cost:* the daemon restarts to apply it, interrupting downloads in progress.
- *Repeat safety:* idempotent.

**yt-dlp Settings** — run it when YouTube downloads start failing and the fix is only in yt-dlp's nightly builds, to stay on one yt-dlp release, or to capture yt-dlp's detailed output for troubleshooting.

- *Changes:* `ytdlpVersion` and `ytdlpDebug` in `store.json`. YTPTube's upgrader installs the chosen yt-dlp into a user site under `/config` (`python<version>-packages`) on each start: Stable takes the newest release, Nightly follows the newest nightly on every start, and a specific version stays put. When the release choice changes, the action also removes that folder's `.version` stamp, so on the next start the upgrader clears everything it installed and installs the new choice from scratch. Without that, going from a specific version back to Stable keeps the old version, because upstream's check reads the image's bundled copy rather than the installed one. Specific versions must be release numbers (`2026.08.19`); the handler checks this as well as the form, since a text field's pattern is enforced by the form only.
- *Cost:* the daemon restarts. A start that installs a different yt-dlp takes longer while it downloads from PyPI.
- *Repeat safety:* idempotent. Saving the same release again resets nothing.
- *Outputs:* none. With verbose logging on, the service logs carry googlevideo URLs, which embed the server's public IP.

**Clear History** — an emergency wipe of everything YTPTube has downloaded and every record of it, to free the space in one step or to remove all traces. Run it with the service stopped.

- *Changes:* deletes everything inside `/downloads`, and inside YTPTube's folder in File Browser's and NextExplorer's `data` volumes, for each of those services that is installed and has the folder. Presence is checked through a read-only mount of the whole volume first, because mounting the folder read-write would create it; only the folder itself is then mounted read-write, so nothing outside it can be touched. Deletes every row of the `history` table and runs `VACUUM`. Deletes `/config/archive.log` (every built-in preset records each download there, which is what skips repeats) and everything in `/config/logs`. Switches off every scheduled task (`tasks.enabled = 0`) rather than deleting it: with the archive gone, a task left on would download everything it covers again on its next run. Kept: the account, sessions, API keys, presets, conditions, notifications, task definitions, the yt-dlp user site, and StartOS backups.
- *Cost:* seconds for a typical library. The service stays stopped afterwards.
- *Repeat safety:* safe; a second run finds nothing to delete.
- *Outputs:* the number of history entries and files deleted, the space freed, the places cleared, and the number of scheduled tasks switched off.

---

## Tasks

The package raises at most two tasks, and neither blocks the service from starting.

| Task | Raised when | Severity | Cleared by |
| ---- | ----------- | -------- | ---------- |
| Set your YTPTube admin password | Install — no password has been stored yet | important | Running Reset Admin Password |
| *File Browser / NextExplorer is not installed, so downloads are going to Local Storage* | The chosen destination's service is not installed | important | That service being installed again, or choosing another destination with Select Download Destination |

The password task does not return once cleared, because a password stays stored from then on. The destination task comes back whenever the chosen service is uninstalled.

---

## Health Checks

One check gates readiness: whether YTPTube's database is up.

**Web Interface** — `GET /api/auth/status` on port 8081, with no credentials; 5-second timeout, 60-second grace period.

The endpoint is public and counts rows in the `users` table, so success means the web server is up **and** the database is queryable. A port check is not enough: YTPTube opens its port before its SQLite connection finishes initializing, and a UI opened in that window reports "Failed to load configuration". The probe sends no credentials on purpose — the user can change the account's username and password inside YTPTube, and a credentialed probe would then fail against a healthy service.

Not ready during the first minute is normal: startup includes yt-dlp's online self-update check, and after a change of yt-dlp release the start also downloads and installs it. A brief drop back to starting after that means the daemon restarted — one of its two processes exited (see [Image and Container Runtime](#image-and-container-runtime)); the logs show which. Staying not ready past the grace period points at the web server or the database; check the service logs.

---

## Backups and Restore

Backups copy the `startos` and `main` volumes wholesale; downloaded media is not included.

Because the password lives in both `store.json` (`startos`) and the account database (`main`), restoring brings them back together, along with all settings, history, presets, and API keys. The `downloads` volume is deliberately excluded to keep backups small. Downloads saved to File Browser or NextExplorer live in that service's own volume and are covered by its backup instead.

A restored instance needs nothing further before use. If its destination service is not installed yet, YTPTube saves locally and raises its prompt until that service is back.

---

## Limitations and Differences

1. **The download destination is either/or.** While File Browser or NextExplorer is selected, it is the only place downloads go; it is not an extra folder alongside local downloads, because YTPTube confines downloads to one base path. Switching leaves already-saved files where they are.
2. **In NextExplorer, only the admin account sees the YTPTube drive automatically.** Other NextExplorer accounts see it only once it is granted to them in NextExplorer's user settings.
3. **Local downloads are not backed up** — see [Backups and Restore](#backups-and-restore).
4. **One account.** YTPTube allows exactly one; it can be renamed and its password changed from inside the app, but no second account can be created.
5. **A password changed inside YTPTube is not known to StartOS.** Reset Admin Password always restores access.
6. **Upstream's single sign-on options are unavailable.** OIDC and trusted-proxy (`Remote-User`) sign-in are configured in a `config.toml` inside the `main` volume, which StartOS provides no way to edit.
7. **Most upstream settings that are only read from environment variables can't be changed** — for example filename trimming. The exceptions are the ones in Download Settings and yt-dlp Settings; all the package sets are listed under [File Models](#file-models).
8. **The in-app terminal is disabled**, because it executes commands on the server.
9. **Deleting files with their history entries only works in the current destination.** YTPTube finds a download's file by its name under the *current* download folder, not the folder it was saved to. After a change of destination, deleting an earlier download leaves its file where it is, and deletes a different file of the same name in the new destination if one exists. Clear History does not have this problem: it empties every destination.

---

## Quick Reference for AI Consumers

```yaml
package_id: ytptube
image: ghcr.io/arabcoders/ytptube
architectures: [x86_64, aarch64]
subcontainers: [ytptube-sub, reset-password, ytdlp-reset, clear-history-probe, clear-history]
volumes:
  startos: (not mounted)
  main: /config
  downloads: /downloads
  filebrowser:data/ytptube-downloads: /mnt/filebrowser/ytptube-downloads # when the destination is File Browser and it is installed; also by Clear History when the folder exists
  nextexplorer:data/YTPTube: /mnt/nextexplorer/YTPTube # when the destination is NextExplorer and it is installed; also by Clear History when the folder exists
file_models:
  - store.json
startos_managed_env_vars:
  - YTP_BROWSER_CONTROL_ENABLED
  - YTP_CHECK_FOR_UPDATES
  - YTP_DOWNLOAD_PATH
  - YTP_TEMP_PATH
  - YTP_AUTH_USERNAME
  - YTP_AUTH_PASSWORD
user_settings_env_vars: # only once set by an action
  - YTP_MAX_WORKERS
  - YTP_MAX_WORKERS_PER_EXTRACTOR
  - YTP_RETRY
  - YTP_AUTO_CLEAR_HISTORY_DAYS
  - YTP_REMOVE_FILES
  - YTP_YTDLP_VERSION
  - YTP_YTDLP_DEBUG
  - YTP_LOG_LEVEL # debug, with YTP_YTDLP_DEBUG
dependencies: [filebrowser, nextexplorer] # optional; only the chosen destination's
interfaces:
  ui: { type: ui, port: 8081 }
actions:
  - reset-admin-password
  - download-destination
  - download-settings
  - ytdlp-settings
  - clear-history # only while stopped
tasks:
  - { action: reset-admin-password, severity: important }
  - { action: download-destination, severity: important } # while the chosen destination is not installed
health_checks:
  - primary
```
