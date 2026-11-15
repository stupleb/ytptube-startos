import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.7:1',
  releaseNotes: {
    en_US: 'Requires StartOS 0.4.2 or later.',
    es_ES: 'Requiere StartOS 0.4.2 o posterior.',
    de_DE: 'Erfordert StartOS 0.4.2 oder neuer.',
    pl_PL: 'Wymaga StartOS 0.4.2 lub nowszego.',
    fr_FR: 'Nécessite StartOS 0.4.2 ou une version ultérieure.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
