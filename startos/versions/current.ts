import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.4:0',
  releaseNotes: {
    en_US: `Updated YTPTube to 2.7.4.

- The playlist picker accepts yt-dlp search queries
- Improved file search
- History items link to the task that queued them

[Full release notes](https://github.com/arabcoders/ytptube/releases/tag/v2.7.4)`,
    es_ES: `YTPTube actualizado a 2.7.4.

- El selector de listas de reproducción acepta búsquedas de yt-dlp
- Búsqueda de archivos mejorada
- Los elementos del historial enlazan con la tarea que los añadió

[Notas completas de la versión](https://github.com/arabcoders/ytptube/releases/tag/v2.7.4)`,
    de_DE: `YTPTube auf 2.7.4 aktualisiert.

- Die Playlist-Auswahl akzeptiert yt-dlp-Suchanfragen
- Verbesserte Dateisuche
- Einträge im Verlauf verlinken auf die Aufgabe, die sie eingereiht hat

[Vollständige Versionshinweise](https://github.com/arabcoders/ytptube/releases/tag/v2.7.4)`,
    pl_PL: `Zaktualizowano YTPTube do wersji 2.7.4.

- Wybór playlisty obsługuje zapytania wyszukiwania yt-dlp
- Ulepszone wyszukiwanie plików
- Elementy historii prowadzą do zadania, które je dodało

[Pełne informacje o wydaniu](https://github.com/arabcoders/ytptube/releases/tag/v2.7.4)`,
    fr_FR: `YTPTube mis à jour vers 2.7.4.

- Le sélecteur de playlist accepte les requêtes de recherche yt-dlp
- Recherche de fichiers améliorée
- Les éléments de l’historique renvoient à la tâche qui les a ajoutés

[Notes de version complètes](https://github.com/arabcoders/ytptube/releases/tag/v2.7.4)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
