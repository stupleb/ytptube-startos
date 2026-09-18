<p align="center">
  <img src="icon.png" alt="YTPTube Logo" width="21%">
</p>

# YTPTube on StartOS

> Everything not listed in this document should behave the same as upstream
> YTPTube. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[YTPTube](https://github.com/arabcoders/ytptube) is a self-hosted web interface for yt-dlp: queued and concurrent downloads of video and audio from YouTube and many other sites, with scheduling, presets, and notifications. This package runs the upstream image unmodified, turns on its login, and can save downloads into File Browser.

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

StartOS's own launcher is the subcontainer's PID 1, not `tini`, so the package sets `TINI_SUBREAPER` to have `tini` reap the processes yt-dlp leaves orphaned (ffmpeg and friends).

Subcontainers:

- **`ytptube-sub`** — everything that runs: a `setup` oneshot as root, then the `primary` daemon as the image's `app` user (uid 1000). Attach with `start-cli package attach ytptube -n ytptube-sub -- <cmd>`.
- **`reset-password`** — a temporary subcontainer the Reset Admin Password action creates to run upstream's reset script against the database, then discards.

---

## Volume and Data Layout

Settings and history live in an embedded SQLite database on the `main` volume; downloads land on the `downloads` volume or, optionally, in File Browser.

| Volume      | Mount point   | Contents                                                                                         |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `startos`   | not mounted   | `store.json` — see [File Models](#file-models)                                                   |
| `main`      | `/config`     | `ytptube.db` (settings, history, the account and its sessions and API keys), presets, logs, and the packages yt-dlp self-updates into |
| `downloads` | `/downloads`  | Finished downloads, while the destination is Local Storage                                       |

In-progress files and yt-dlp's scratch data go to the container's ephemeral `/tmp`, as does the token server's state. With **File Browser** as the destination, only the `ytptube-downloads` folder at the top level of File Browser's `data` volume is mounted, read-write, at `/mnt/filebrowser/ytptube-downloads`; YTPTube's download and temp paths both point there, the local `downloads` volume sits idle, and YTPTube cannot see the rest of File Browser's files.

Files are shared between the two services without an idmap: StartOS mounts every volume in one shared id space, and YTPTube's `app` and File Browser's user are both uid 1000, so each natively owns what the other writes. The `setup` oneshot runs before the daemon on every start and chowns `/config` to `app` recursively, along with either `/downloads` (recursively) or the File Browser folder itself, which it also sets to mode `755`. The host creates that folder root-owned on first mount; the oneshot is what hands it to `app`.

---

## File Models

The package keeps one file of its own and configures YTPTube through environment variables; YTPTube's own settings are edited in its UI and stored in its database, which the package never writes.

**`store.json`** (JSON, `startos` volume):

- `adminPassword` — generated at install; rewritten only by Reset Admin Password. It is passed to YTPTube as `YTP_AUTH_PASSWORD`, which YTPTube reads **only while it has no account yet** (see below). After the first boot the database owns the password, so this copy goes stale if the user changes the password inside YTPTube. Reset Admin Password brings the two back into step.
- `downloadDestination` — `local` or `filebrowser`, written by Select Download Destination; read on every start to pick the mounts and the dependency.

**Environment variables**, re-asserted on every start:

| Variable                      | Value                                   | Why |
| ----------------------------- | --------------------------------------- | --- |
| `YTP_BROWSER_CONTROL_ENABLED` | `true`                                  | Enables rename, delete, move, and new-folder in YTPTube's file manager (off upstream). |
| `YTP_CHECK_FOR_UPDATES`       | `false`                                 | StartOS manages updates, so the in-app update check and banner are off. |
| `YTP_DOWNLOAD_PATH`           | `/downloads` or the File Browser folder | Follows the chosen destination. |
| `YTP_TEMP_PATH`               | the File Browser folder                 | File Browser destination only, so large in-progress files don't fill the ephemeral root filesystem. |
| `TINI_SUBREAPER`              | `1`                                     | See [Image and Container Runtime](#image-and-container-runtime). |

`YTP_AUTH_USERNAME` (`admin`) and `YTP_AUTH_PASSWORD` are also passed every start, but YTPTube consumes them **only on a launch that finds its users table empty**, to create the one account it allows. From then on they are ignored: changing them does not change the login, and anything that rotates the password has to act on the database — which is why Reset Admin Password runs upstream's reset script rather than rewriting the variable.

The in-app terminal (`YTP_CONSOLE_ENABLED`) is left off because it executes commands. yt-dlp's self-update stays at the upstream default (on), which is why the service makes an outbound call on each start.

---

## Dependencies

YTPTube depends on nothing unless File Browser is chosen as the download destination.

| Dependency   | Required                    | Health checks required | Mount |
| ------------ | --------------------------- | ---------------------- | ----- |
| File Browser | Only while it is the destination | None — it must be installed, not running | `ytptube-downloads` from its `data` volume at `/mnt/filebrowser/ytptube-downloads`, read-write |

It is needed only as a place to put files, so it can be stopped while YTPTube runs. Either package that ships under the `filebrowser` id satisfies the dependency — the original File Browser or its successor, FileBrowser Quantum — since both expose the `data` volume this package mounts and both run as uid 1000, which the shared-ownership scheme above relies on.

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

One action recovers access to the account; the other chooses where downloads go.

**Reset Admin Password** — run it to get a password on first install, or to recover access at any time, including after the password or username was changed inside YTPTube.

- *Changes:* resets the password of YTPTube's single account in `ytptube.db`, finding the account by its current name, which the user may have changed; revokes every active session, so all signed-in browsers are signed out; stores the new password in `store.json`. API keys are left alone. If the database doesn't exist yet (the service has never started), only `store.json` changes, and the account is created with that password on first boot.
- *Cost:* a few seconds; the change to `store.json` restarts the daemon, interrupting downloads in progress.
- *Repeat safety:* safe; each run issues a new password and signs everyone out again.
- *Outputs:* the account's username and the new password.

**Select Download Destination** — choose Local Storage or File Browser.

- *Changes:* `downloadDestination` in `store.json`, which changes the mounts and whether File Browser is declared as a dependency. Existing downloads are not moved.
- *Cost:* the daemon restarts to apply it.
- *Repeat safety:* idempotent.

---

## Tasks

The package raises one task, and it never blocks the service from starting.

| Task                              | Raised when                           | Severity  | Cleared by |
| --------------------------------- | ------------------------------------- | --------- | ---------- |
| Set your YTPTube admin password   | Install — no password has been stored yet | important | Running Reset Admin Password |

It does not return once cleared, because a password stays stored from then on.

---

## Health Checks

One check gates readiness: whether YTPTube's database is up.

**Web Interface** — `GET /api/auth/status` on port 8081, with no credentials; 5-second timeout, 60-second grace period.

The endpoint is public and counts rows in the `users` table, so success means the web server is up **and** the database is queryable. A port check is not enough: YTPTube opens its port before its SQLite connection finishes initializing, and a UI opened in that window reports "Failed to load configuration". The probe sends no credentials on purpose — the user can change the account's username and password inside YTPTube, and a credentialed probe would then fail against a healthy service.

Not ready during the first minute is normal: startup includes yt-dlp's online self-update check. A brief drop back to starting after that means the daemon restarted — one of its two processes exited (see [Image and Container Runtime](#image-and-container-runtime)); the logs show which. Staying not ready past the grace period points at the web server or the database; check the service logs.

---

## Backups and Restore

Backups copy the `startos` and `main` volumes wholesale; downloaded media is not included.

Because the password lives in both `store.json` (`startos`) and the account database (`main`), restoring brings them back together, along with all settings, history, presets, and API keys. The `downloads` volume is deliberately excluded to keep backups small. Downloads saved to File Browser live in File Browser's own volume and are covered by its backup instead.

A restored instance needs nothing further before use — except that if File Browser was the destination, File Browser must be installed again, or YTPTube keeps writing into a folder no installed service shows until the destination is switched back to Local Storage.

---

## Limitations and Differences

1. **File Browser is an either/or destination.** While selected, it is the only place downloads go; it is not an extra folder alongside local downloads, because YTPTube confines downloads to one base path. Switching back leaves already-saved files in File Browser.
2. **Local downloads are not backed up** — see [Backups and Restore](#backups-and-restore).
3. **One account.** YTPTube allows exactly one; it can be renamed and its password changed from inside the app, but no second account can be created.
4. **A password changed inside YTPTube is not known to StartOS.** Reset Admin Password always restores access.
5. **Upstream's single sign-on options are unavailable.** OIDC and trusted-proxy (`Remote-User`) sign-in are configured in a `config.toml` inside the `main` volume, which StartOS provides no way to edit.
6. **Upstream settings that are only read from environment variables can't be changed** — for example filename trimming. The ones the package sets are listed under [File Models](#file-models).
7. **The in-app terminal is disabled**, because it executes commands on the server.

---

## Quick Reference for AI Consumers

```yaml
package_id: ytptube
image: ghcr.io/arabcoders/ytptube
architectures: [x86_64, aarch64]
subcontainers: [ytptube-sub, reset-password]
volumes:
  startos: (not mounted)
  main: /config
  downloads: /downloads
  filebrowser:data/ytptube-downloads: /mnt/filebrowser/ytptube-downloads # only when the destination is File Browser
file_models:
  - store.json
startos_managed_env_vars:
  - YTP_BROWSER_CONTROL_ENABLED
  - YTP_CHECK_FOR_UPDATES
  - YTP_DOWNLOAD_PATH
  - YTP_TEMP_PATH
  - YTP_AUTH_USERNAME
  - YTP_AUTH_PASSWORD
  - TINI_SUBREAPER
dependencies: [filebrowser] # optional; only when the destination is File Browser
interfaces:
  ui: { type: ui, port: 8081 }
actions:
  - reset-admin-password
  - download-destination
tasks:
  - { action: reset-admin-password, severity: important }
health_checks:
  - primary
```
