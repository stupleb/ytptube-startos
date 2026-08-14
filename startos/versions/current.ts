import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.6.7:0',
  releaseNotes: {
    en_US:
      'Updates YTPTube to v2.6.7. The web interface is now available in several languages, the download queue is paginated and can be reordered (with a "force start" option), failed downloads can retry automatically, and individual videos can be picked from a playlist before downloading. Rebuilt on StartOS SDK 2.0.9.',
    es_ES:
      'Actualiza YTPTube a v2.6.7. La interfaz web ahora está disponible en varios idiomas, la cola de descargas está paginada y se puede reordenar (con una opción de "inicio forzado"), las descargas fallidas pueden reintentarse automáticamente y se pueden elegir vídeos concretos de una lista de reproducción antes de descargarla. Reconstruido con StartOS SDK 2.0.9.',
    de_DE:
      'Aktualisiert YTPTube auf v2.6.7. Die Weboberfläche ist jetzt in mehreren Sprachen verfügbar, die Download-Warteschlange ist seitenweise aufgeteilt und lässt sich umsortieren (mit einer Option zum erzwungenen Start), fehlgeschlagene Downloads können automatisch wiederholt werden, und einzelne Videos können vor dem Herunterladen aus einer Playlist ausgewählt werden. Neu erstellt mit StartOS SDK 2.0.9.',
    pl_PL:
      'Aktualizuje YTPTube do v2.6.7. Interfejs webowy jest teraz dostępny w kilku językach, kolejka pobierania jest podzielona na strony i można zmieniać jej kolejność (z opcją „wymuś start”), nieudane pobrania mogą być automatycznie ponawiane, a przed pobraniem można wybrać pojedyncze filmy z playlisty. Przebudowano na StartOS SDK 2.0.9.',
    fr_FR:
      'Met à jour YTPTube vers la v2.6.7. L’interface web est désormais disponible en plusieurs langues, la file d’attente de téléchargement est paginée et peut être réordonnée (avec une option de démarrage forcé), les téléchargements échoués peuvent être relancés automatiquement, et il est possible de sélectionner des vidéos individuelles dans une playlist avant de les télécharger. Reconstruit avec le SDK StartOS 2.0.9.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
