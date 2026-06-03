<p align="center">
  <img src="icon.png" alt="YTPTube Logo" width="21%">
</p>

# YTPTube on StartOS

> **Upstream repo:** <https://github.com/arabcoders/ytptube>
>
> Everything not listed in this document should behave the same as upstream
> YTPTube. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

YTPTube is a self-hosted web interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp). It downloads video and audio from YouTube and many other sites, with queued and concurrent downloads, scheduling, presets, and notifications. This package wraps the upstream container image and runs it on StartOS.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Image         | `ghcr.io/arabcoders/ytptube` (upstream, unmodified)          |
| Architectures | x86_64, aarch64                                              |
| Entrypoint    | Default image entrypoint → `python /app/app/main.py --ytp-process` |

---

## Volume and Data Layout

| Volume      | Mount Point  | Purpose                                                 |
| ----------- | ------------ | ------------------------------------------------------- |
| `startos`   | (not mounted) | StartOS-managed `store.json` (holds the generated admin password) |
| `main`      | `/config`    | Settings, database, presets, logs (`YTP_CONFIG_PATH`)   |
| `downloads` | `/downloads` | Completed downloads, when the destination is Local (`YTP_DOWNLOAD_PATH`) |

Temporary/in-progress files use the container's `/tmp` (`YTP_TEMP_PATH`), which is ephemeral.

When the download destination is **File Browser** (see [Configuration](#configuration-management)), File Browser's `data` volume is mounted read-write at `/mnt/filebrowser`, `YTP_DOWNLOAD_PATH` (and `YTP_TEMP_PATH`) point at `/mnt/filebrowser/ytptube-downloads`, and the local `downloads` volume is left idle. The setup oneshot `chmod 777`s that folder so the cross-package (idmapped) write is permitted regardless of each service's user.

---

## Installation and First-Run Flow

Unlike upstream (which ships with no authentication), this package **enables auth by default**: a random admin password is generated on install and injected as `YTP_AUTH_PASSWORD`, so the web UI requires a login from first boot. An **important-priority task** points you at the `Reset Admin Password` action, which generates and shows a fresh password (username `admin`). The `/config` and `/downloads` volumes are created empty on first start.

---

## Configuration Management

Almost all configuration is done through YTPTube's own web UI and is persisted under `/config`. The image's built-in defaults are used: `YTP_CONFIG_PATH=/config`, `YTP_DOWNLOAD_PATH=/downloads`, `YTP_PORT=8081`.

This package overrides two upstream defaults via environment variables:

| Env var                        | Set to  | Why                                                                                          |
| ------------------------------ | ------- | -------------------------------------------------------------------------------------------- |
| `YTP_BROWSER_CONTROL_ENABLED`  | `true`  | Enables rename / delete / move / create-directory controls in YTPTube's built-in file manager (off upstream). |
| `YTP_CHECK_FOR_UPDATES`        | `false` | StartOS manages package updates, so the in-app update banner is suppressed (and the outbound check avoided). |

It also enables **authentication**: `YTP_AUTH_USERNAME` (`admin`) and `YTP_AUTH_PASSWORD` (generated on install, see [First-Run Flow](#installation-and-first-run-flow)) are injected from the StartOS-managed `store.json`. Roll a new password any time with the `Reset Admin Password` action.

The in-app terminal (`YTP_CONSOLE_ENABLED`) is intentionally left disabled — it executes commands and is a remote-execution surface. yt-dlp's own auto-update (`YTP_YTDLP_AUTO_UPDATE`) remains at the upstream default (on), which is why the container makes an outbound call on each start.

**Download destination** — the `Select Download Destination` action chooses where downloads are saved: **Local Storage** (default, the `downloads` volume) or **File Browser**. Selecting File Browser repoints `YTP_DOWNLOAD_PATH` at File Browser's volume, so it becomes the *sole* download location while selected (this is a single choice, not a per-download folder — YTPTube confines downloads to one base path). Changing it restarts the service.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose         |
| --------- | ---- | -------- | --------------- |
| Web UI    | 8081 | HTTP     | YTPTube web app |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

| Action                        | ID                      | Purpose                                                                 |
| ----------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| Reset Admin Password          | `reset-admin-password`  | Generates a new random admin password and displays it (username `admin`). Any status. |
| Select Download Destination   | `download-destination`  | Choose where downloads are saved: Local Storage (default) or File Browser. Single choice; any status. |

---

## Backups and Restore

**Included in backup:**

- `startos` volume — StartOS-managed `store.json` (generated admin password)
- `main` volume (`/config` — settings, database, presets)

**Not backed up:**

- `downloads` volume (`/downloads`) — downloaded media is excluded to keep backups small.

**Restore behavior:** the `startos` and `main` volumes are fully restored before the service starts.

---

## Health Checks

| Check         | Method                | Messages                                                                        |
| ------------- | --------------------- | ------------------------------------------------------------------------------- |
| Web Interface | Port listening (8081) | Success: "The web interface is ready" / Error: "The web interface is not ready" |

---

## Dependencies

| Dependency   | Required?                   | Kind     | Purpose                                                          |
| ------------ | --------------------------- | -------- | --------------------------------------------------------------- |
| File Browser | Optional (only if selected) | `exists` | When chosen as the download destination, downloads are written into its `data` volume. |

The version constraint is defined in the manifest.

If the destination is Local Storage (the default), YTPTube has **no dependencies**.

---

## Limitations and Differences

1. **File Browser is an either/or destination** — selecting it makes File Browser the *sole* download location (under `ytptube-downloads/`); it is not an additional folder alongside local downloads. YTPTube confines downloads to a single base path, so it can't be both. Switching back to Local Storage leaves the File-Browser-saved files in File Browser.
2. **Downloads are not backed up** — only the `startos` and `main` volumes are included in StartOS backups (the latter holds your config; the former holds the generated admin password).
3. **Single admin account** — auth is a single `admin` user with a generated password. YTPTube's env-based auth does not support multiple accounts.

---

## What Is Unchanged from Upstream

The container image is upstream's, unmodified. All download, preset, scheduling, and notification behavior works exactly as documented upstream.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: ytptube
architectures: [x86_64, aarch64]
volumes:
  startos: (store.json, not mounted)
  main: /config
  downloads: /downloads
  filebrowser_data: /mnt/filebrowser # only when destination=filebrowser; downloads go to ./ytptube-downloads
ports:
  ui: 8081
dependencies:
  filebrowser: optional # kind=exists, only when destination=filebrowser
startos_managed_env_vars:
  - YTP_BROWSER_CONTROL_ENABLED=true
  - YTP_CHECK_FOR_UPDATES=false
  - YTP_DOWNLOAD_PATH=/downloads (or /mnt/filebrowser/ytptube-downloads when destination=filebrowser)
  - YTP_AUTH_USERNAME=admin
  - YTP_AUTH_PASSWORD=<generated on install, stored in startos volume>
actions:
  - reset-admin-password
  - download-destination
```
