import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { configMounts } from '../utils'

export const v2_7_5_2 = VersionInfo.of({
  version: '2.7.5:2',
  releaseNotes: {
    en_US: 'Includes the Brotli security fix (CVE-2026-111497).',
    es_ES: 'Incluye la corrección de seguridad de Brotli (CVE-2026-111497).',
    de_DE: 'Enthält die Brotli-Sicherheitskorrektur (CVE-2026-111497).',
    pl_PL: 'Zawiera poprawkę bezpieczeństwa Brotli (CVE-2026-111497).',
    fr_FR: 'Inclut le correctif de sécurité de Brotli (CVE-2026-111497).',
  },
  migrations: {
    // yt-dlp's upgrader installs its own Brotli into /config, ahead of the image's; this makes it reinstall.
    up: async ({ effects }) => {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'ytptube' },
        configMounts,
        'ytdlp-reset',
        (sub) =>
          sub.execFail(['sh', '-c', 'rm -f /config/python*-packages/.version']),
      )
    },
    down: IMPOSSIBLE,
  },
})
