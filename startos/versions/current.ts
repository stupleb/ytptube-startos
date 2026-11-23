import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.0:0',
  releaseNotes: {
    en_US: 'Updated YTPTube to 2.8.0, with a redesigned web interface.',
    es_ES: 'YTPTube actualizado a 2.8.0, con una interfaz web rediseñada.',
    de_DE:
      'YTPTube auf 2.8.0 aktualisiert, mit einer neu gestalteten Weboberfläche.',
    pl_PL:
      'Zaktualizowano YTPTube do 2.8.0 z przeprojektowanym interfejsem webowym.',
    fr_FR: 'YTPTube mis à jour vers 2.8.0, avec une interface web repensée.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
