import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.7:0',
  releaseNotes: {
    en_US:
      'Updated YTPTube to 2.7.7, which adds a Toolbox for converting downloads to MP4; Clear History also erases its jobs. Requires StartOS 0.4.1 or later.',
    es_ES:
      'YTPTube actualizado a 2.7.7, que añade una Caja de herramientas para convertir descargas a MP4; Borrar historial también borra sus tareas. Requiere StartOS 0.4.1 o posterior.',
    de_DE:
      'YTPTube auf 2.7.7 aktualisiert, mit einer Toolbox zum Umwandeln von Downloads in MP4; Verlauf löschen löscht auch deren Aufträge. Erfordert StartOS 0.4.1 oder neuer.',
    pl_PL:
      'Zaktualizowano YTPTube do 2.7.7, który dodaje Przybornik do konwersji pobranych plików do MP4; Wyczyść historię usuwa też jego zadania. Wymaga StartOS 0.4.1 lub nowszego.',
    fr_FR:
      'YTPTube mis à jour vers 2.7.7, qui ajoute une Boîte à outils pour convertir les téléchargements en MP4 ; Effacer l’historique efface aussi ses tâches. Nécessite StartOS 0.4.1 ou une version ultérieure.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
