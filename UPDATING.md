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
2. Update `version` in `startos/versions/current.ts` to `<upstream version>:0` (e.g. `2.5.4:0`) and rewrite `releaseNotes`. See the packaging guide's Versions page for when a new version file is required.
3. Review `README.md` and `instructions.md` for anything that changed.
