import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.5:0',
  releaseNotes: {
    en_US:
      'Updated YTPTube to 2.7.5, with a reworked video player and downloads of DRM-protected media through your own Widevine key server. [Full release notes](https://github.com/arabcoders/ytptube/releases/tag/v2.7.5)',
    es_ES:
      'YTPTube actualizado a 2.7.5, con un reproductor de vídeo renovado y descargas de contenido protegido con DRM a través de tu propio servidor de claves Widevine. [Notas completas de la versión](https://github.com/arabcoders/ytptube/releases/tag/v2.7.5)',
    de_DE:
      'YTPTube auf 2.7.5 aktualisiert, mit überarbeitetem Videoplayer und Downloads DRM-geschützter Medien über deinen eigenen Widevine-Schlüsselserver. [Vollständige Versionshinweise](https://github.com/arabcoders/ytptube/releases/tag/v2.7.5)',
    pl_PL:
      'Zaktualizowano YTPTube do 2.7.5: odnowiony odtwarzacz wideo oraz pobieranie multimediów chronionych DRM przez własny serwer kluczy Widevine. [Pełne informacje o wydaniu](https://github.com/arabcoders/ytptube/releases/tag/v2.7.5)',
    fr_FR:
      'YTPTube mis à jour vers 2.7.5, avec un lecteur vidéo repensé et le téléchargement de médias protégés par DRM via votre propre serveur de clés Widevine. [Notes de version complètes](https://github.com/arabcoders/ytptube/releases/tag/v2.7.5)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
