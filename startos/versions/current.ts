import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { configMounts } from '../utils'

export const current = VersionInfo.of({
  version: '2.7.5:1',
  releaseNotes: {
    en_US:
      'Stops trusting certificates from a compromised certificate authority (eMudhra).',
    es_ES:
      'Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra).',
    de_DE:
      'Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr.',
    pl_PL:
      'Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra).',
    fr_FR: `Ne fait plus confiance aux certificats d'une autorité de certification compromise (eMudhra).`,
  },
  migrations: {
    // yt-dlp's upgrader installs its own certifi into /config, ahead of the image's; this makes it reinstall.
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
