import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.1:0',
  releaseNotes: {
    en_US:
      'Updated YTPTube to 2.8.1, with fixes for playlist downloads and the web interface.',
    es_ES:
      'YTPTube actualizado a 2.8.1, con correcciones para las descargas de listas de reproducción y la interfaz web.',
    de_DE:
      'YTPTube auf 2.8.1 aktualisiert, mit Korrekturen für Playlist-Downloads und die Weboberfläche.',
    pl_PL:
      'Zaktualizowano YTPTube do 2.8.1 z poprawkami pobierania playlist i interfejsu webowego.',
    fr_FR:
      "YTPTube mis à jour vers 2.8.1, avec des corrections pour les téléchargements de listes de lecture et l'interface web.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
