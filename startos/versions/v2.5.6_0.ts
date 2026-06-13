import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_2_5_6_0 = VersionInfo.of({
  version: '2.5.6:0',
  releaseNotes: {
    en_US:
      'Updates YTPTube to v2.5.6 — restores yt-dlp compatibility (upstream CVE/breaking-change fix), fixes an iOS progress-bar bug, and adds a diagnostics page and share button.',
    es_ES:
      'Actualiza YTPTube a v2.5.6: restaura la compatibilidad con yt-dlp (corrección de CVE/cambio incompatible), corrige un error de la barra de progreso en iOS y añade una página de diagnósticos y un botón de compartir.',
    de_DE:
      'Aktualisiert YTPTube auf v2.5.6 — stellt die yt-dlp-Kompatibilität wieder her (Upstream-CVE-/Breaking-Change-Fix), behebt einen Fehler der Fortschrittsanzeige unter iOS und ergänzt eine Diagnoseseite sowie eine Teilen-Schaltfläche.',
    pl_PL:
      'Aktualizuje YTPTube do v2.5.6 — przywraca zgodność z yt-dlp (poprawka CVE/zmiany łamiącej), naprawia błąd paska postępu na iOS oraz dodaje stronę diagnostyki i przycisk udostępniania.',
    fr_FR:
      'Met à jour YTPTube vers v2.5.6 — rétablit la compatibilité avec yt-dlp (correctif CVE/changement cassant en amont), corrige un bug de la barre de progression sur iOS et ajoute une page de diagnostics et un bouton de partage.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
