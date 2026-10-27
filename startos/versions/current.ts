import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.6:0',
  releaseNotes: {
    en_US:
      'Updated YTPTube to 2.7.6. Includes the Brotli security fix (CVE-2026-111497) for sites that need browser impersonation.',
    es_ES:
      'YTPTube actualizado a 2.7.6. Incluye la corrección de seguridad de Brotli (CVE-2026-111497) para los sitios que requieren suplantar un navegador.',
    de_DE:
      'YTPTube auf 2.7.6 aktualisiert. Enthält die Brotli-Sicherheitskorrektur (CVE-2026-111497) für Seiten, die eine Browser-Imitation erfordern.',
    pl_PL:
      'Zaktualizowano YTPTube do 2.7.6. Zawiera poprawkę bezpieczeństwa Brotli (CVE-2026-111497) dla stron wymagających podszywania się pod przeglądarkę.',
    fr_FR:
      'YTPTube mis à jour vers 2.7.6. Inclut le correctif de sécurité de Brotli (CVE-2026-111497) pour les sites qui nécessitent l’imitation d’un navigateur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
