# Updating the upstream version

This package wraps the upstream [YTPTube](https://github.com/arabcoders/ytptube) project, published as the container image `ghcr.io/arabcoders/ytptube`.

## Determining the upstream version

Fetch the latest release tag:

```sh
gh release view -R arabcoders/ytptube --json tagName -q .tagName
```

The current pin lives in `startos/manifest/index.ts` at `images.ytptube.source.dockerTag` (the tag after the `:` in `ghcr.io/arabcoders/ytptube:<tag>`).

> [!NOTE]
> Upstream image tags keep the leading `v` (e.g. `v2.5.3`), and the multi-arch
> tag covers `linux/amd64` and `linux/arm64`. Confirm a new tag exists for both
> architectures before pinning it.

## Applying the bump

1. Set `dockerTag` in `startos/manifest/index.ts` to `ghcr.io/arabcoders/ytptube:<new tag>`.
2. Bump the version in `startos/versions/current.ts`, which always holds the latest version and
   exports `current`. With no migration, edit it in place — update `version` (`<upstream>:0`) and
   `releaseNotes`; `startos/versions/index.ts` needs no change. A *separate* version file (added to
   `other`) is only needed when the bump carries an `up`/`down` migration; a version having merely
   been released is not a reason to declare one, since `VersionGraph` synthesizes a range vertex
   beneath `current` so any lower installed version migrates up in one hop. See the packaging
   guide's Versions page.
3. Confirm the new image tag is published for both `linux/amd64` and `linux/arm64`, then `make`.
4. Review `README.md` and `instructions.md` for anything that changed.
