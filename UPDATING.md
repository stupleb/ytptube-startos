# Updating the upstream version

This package wraps the upstream [YTPTube](https://github.com/arabcoders/ytptube) project, published as the container image `ghcr.io/arabcoders/ytptube`.

## Determining the upstream version

Fetch the latest release tag:

```sh
gh release view -R arabcoders/ytptube --json tagName -q .tagName
```

The current pin lives in `startos/manifest/index.ts` at `images.ytptube.source.dockerTag` (the tag after the `:` in `ghcr.io/arabcoders/ytptube:<tag>`). Upstream image tags keep the leading `v`.

Confirm the new tag is published for both architectures before pinning it:

```sh
docker buildx imagetools inspect ghcr.io/arabcoders/ytptube:<tag> | grep Platform
```

It must list `linux/amd64` and `linux/arm64`; ignore `unknown/unknown`, which is an attestation. The command reads only the manifest and downloads no layers.

## Checking what changed upstream

List the files that changed between the pinned tag and the new one:

```sh
gh api repos/arabcoders/ytptube/compare/<pinned tag>...<new tag> --jq '.files[].filename'
```

Read the diff of any of these, because this package depends on them:

- `Dockerfile` — the `app` user must stay uid 1000, the uid File Browser and NextExplorer also use, and the entrypoint must still be `tini` running `/entrypoint.sh`.
- `container/entrypoint.sh`, `container/start-services.sh` — the writability checks, the yt-dlp upgrader call, and the two processes the daemon supervises.
- `app/library/config.py` — the `YTP_*` names and defaults that `startos/main.ts` and the settings actions pass.
- `app/upgrader.py`, `app/library/PackageInstaller.py` — how the yt-dlp Settings choice is installed; the action relies on the user site's `.version` stamp.
- `app/scripts/reset_password.py`, the `users` table, and `GET /api/auth/status` in `app/routes/api/auth.py` — Reset Admin Password, and the readiness check, which needs that endpoint to stay public.
- `app/migrations/` — database migrations run on the first start after the update, and Clear History writes the `history` and `tasks` tables directly.
- `pyproject.toml`, `uv.lock` — the bundled yt-dlp and PO-token provider versions.

## Applying the bump

1. Set `dockerTag` in `startos/manifest/index.ts` to `ghcr.io/arabcoders/ytptube:<new tag>`.
2. Bump the version in `startos/versions/current.ts`, which always holds the latest version and
   exports `current`. With no migration, edit it in place — update `version` (`<upstream>:0`) and
   `releaseNotes` in every locale; `startos/versions/index.ts` needs no change. A *separate* version
   file (added to `other`) is only needed when the bump carries an `up`/`down` migration; a version
   having merely been released is not a reason to declare one, since `VersionGraph` synthesizes a
   range vertex beneath `current` so any lower installed version migrates up in one hop. See the
   packaging guide's Versions page.
3. Review `README.md` and `instructions.md` for anything that changed.
4. Open a pull request to `master`; its Build job packs both architectures. Merging it releases the
   bump: CI tags `v<version>_<revision>`, builds and signs both architectures, publishes the GitHub
   release, and lists it on the registry.
