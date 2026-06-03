# Contributing

This repo packages [YTPTube](https://github.com/arabcoders/ytptube) — a self-hosted web GUI for yt-dlp — for StartOS.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces, actions, dependencies). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the service.
- **`UPDATING.md`** — how to bump the upstream version.
- **`CONTRIBUTING.md`** — this file.
- **`AGENTS.md` / `CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build both .s9pk packages (x86_64 + aarch64)
```

The `make` step invokes `start-cli s9pk pack`, which pulls the prebuilt upstream image (`ghcr.io/arabcoders/ytptube`, pinned in `startos/manifest/index.ts`) — there is no project `Dockerfile`. Sideload the resulting `.s9pk` onto a StartOS box to test.

## Updating versions

The upstream version is pinned in two places — see [`UPDATING.md`](UPDATING.md) for the full procedure:

1. `startos/manifest/index.ts` → `images.ytptube.source.dockerTag` (the image tag, e.g. `ghcr.io/arabcoders/ytptube:v2.5.3` — note upstream keeps the leading `v`, and only `linux/amd64` + `linux/arm64` are published).
2. `startos/versions/current.ts` → `version` (`<upstream>:<revision>`) and `releaseNotes`. A *new* file under `startos/versions/` is only needed when the bump carries an `up`/`down` migration, or to preserve old release notes in git history — see [Versions](https://docs.start9.com/packaging/versions.html).

The `filebrowser-startos` dev dependency in `package.json` is pinned to a commit SHA for reproducible builds (its manifest is imported for the typed File Browser volume mount). Bump it deliberately, not to a moving branch.

## Package-specific notes

- **Runs as `app` (uid 1000).** A setup oneshot (`startos/main.ts`) `chown`s the config/download volumes so the unprivileged user can write.
- **Authentication is on by default.** Upstream ships with none; this package generates a random admin password on install (`startos/init/watchAuth.ts`), injects `YTP_AUTH_USERNAME`/`YTP_AUTH_PASSWORD`, and exposes a `Reset Admin Password` action. The password lives in `store.json` on the `startos` volume.
- **Managed env defaults** (`startos/main.ts`): `YTP_BROWSER_CONTROL_ENABLED=true` (file-manager controls) and `YTP_CHECK_FOR_UPDATES=false` (StartOS owns updates). The in-app terminal (`YTP_CONSOLE_ENABLED`) is left off — it's a remote-exec surface.
- **File Browser download destination.** The `Select Download Destination` action can point downloads into [File Browser](https://github.com/Start9Labs/filebrowser-startos) instead of local storage. It mounts File Browser's `data` volume at `/mnt/filebrowser`, `mkdir`s + `chmod 777`s a `ytptube-downloads` subfolder (the cross-package, idmapped write needs world-writable perms), and points `YTP_DOWNLOAD_PATH` there. It's an either/or replace — File Browser can't be a sub-folder alongside local downloads, because YTPTube's `calc_download_path` confines downloads to a single base path.

## How to contribute

1. Fork the repository and create a branch from `master`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `master`.
