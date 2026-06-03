import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_2_5_3_0 = VersionInfo.of({
  version: '2.5.3:0',
  releaseNotes: {
    en_US: 'Initial release of YTPTube for StartOS.',
    es_ES: 'Versión inicial de YTPTube para StartOS.',
    de_DE: 'Erste Veröffentlichung von YTPTube für StartOS.',
    pl_PL: 'Pierwsze wydanie YTPTube dla StartOS.',
    fr_FR: 'Première version de YTPTube pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
