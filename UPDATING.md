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
2. Bump the version file under `startos/versions/`. Each version has its own file named
   `v<version>_<revision>.ts` (e.g. `v2.5.6_0.ts`) exporting `v_<version>_<revision>`. With no
   migration, rename the existing file to the new version, update `version` (`<upstream>:0`) and
   `releaseNotes`, and update the import in `startos/versions/index.ts`. A *new* file (added to
   `other`) is only needed for an `up`/`down` migration — see the packaging guide's Versions page.
3. Confirm the new image tag is published for both `linux/amd64` and `linux/arm64`, then `make`.
4. Review `README.md` and `instructions.md` for anything that changed.
