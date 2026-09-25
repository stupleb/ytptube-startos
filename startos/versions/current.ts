import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.4:1',
  releaseNotes: {
    en_US:
      'New actions: **Download Settings** (downloads at once, retries, forgetting old history, deleting files with their history entries), **yt-dlp Settings** (Stable or Nightly yt-dlp, detailed logging for troubleshooting) and **Clear History**, which erases the download history and every downloaded file. Includes YTPTube 2.7.4.',
    es_ES:
      'Nuevas acciones: **Ajustes de descarga** (descargas simultáneas, reintentos, olvidar el historial antiguo, borrar los archivos junto con su entrada del historial), **Ajustes de yt-dlp** (yt-dlp Estable o Nightly, registro detallado para diagnosticar problemas) y **Borrar historial**, que borra el historial de descargas y todos los archivos descargados. Incluye YTPTube 2.7.4.',
    de_DE:
      'Neue Aktionen: **Download-Einstellungen** (gleichzeitige Downloads, Wiederholungen, alten Verlauf vergessen, Dateien mit ihrem Verlaufseintrag löschen), **yt-dlp-Einstellungen** (yt-dlp Stabil oder Nightly, ausführliche Protokolle zur Fehlersuche) und **Verlauf löschen**, das den Download-Verlauf und jede heruntergeladene Datei löscht. Enthält YTPTube 2.7.4.',
    pl_PL:
      'Nowe akcje: **Ustawienia pobierania** (jednoczesne pobrania, ponowne próby, zapominanie starej historii, usuwanie plików razem z wpisami historii), **Ustawienia yt-dlp** (stabilne lub Nightly yt-dlp, szczegółowe logi do diagnozowania problemów) i **Wyczyść historię**, która usuwa historię pobrań i każdy pobrany plik. Zawiera YTPTube 2.7.4.',
    fr_FR:
      'Nouvelles actions : **Paramètres de téléchargement** (téléchargements simultanés, nouvelles tentatives, oubli de l’ancien historique, suppression des fichiers avec leur entrée d’historique), **Paramètres de yt-dlp** (yt-dlp Stable ou Nightly, journalisation détaillée pour le dépannage) et **Effacer l’historique**, qui efface l’historique des téléchargements et tous les fichiers téléchargés. Inclut YTPTube 2.7.4.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
