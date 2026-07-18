import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.5.6:1',
  releaseNotes: {
    en_US:
      'Wait for YTPTube’s database to finish initializing before reporting the service ready, so the web UI no longer shows a "Failed to load configuration" error right after first start. Downloads sent to File Browser are now stored in a properly owned folder instead of a world-writable one, and YTPTube can no longer access File Browser files outside its own downloads folder. Rebuilt on StartOS SDK 2.0.6.',
    es_ES:
      'Espera a que la base de datos de YTPTube termine de inicializarse antes de marcar el servicio como listo, de modo que la interfaz web ya no muestre el error "Failed to load configuration" justo después del primer inicio. Las descargas enviadas a File Browser ahora se guardan en una carpeta con propietario correcto en lugar de una carpeta con escritura para todos, y YTPTube ya no puede acceder a archivos de File Browser fuera de su propia carpeta de descargas. Reconstruido con StartOS SDK 2.0.6.',
    de_DE:
      'Wartet, bis die Datenbank von YTPTube vollständig initialisiert ist, bevor der Dienst als bereit gemeldet wird, sodass die Weboberfläche direkt nach dem ersten Start keinen Fehler „Failed to load configuration“ mehr anzeigt. An File Browser gesendete Downloads werden jetzt in einem Ordner mit korrektem Eigentümer gespeichert statt in einem weltweit beschreibbaren, und YTPTube kann nicht mehr auf File-Browser-Dateien außerhalb seines eigenen Download-Ordners zugreifen. Neu erstellt mit StartOS SDK 2.0.6.',
    pl_PL:
      'Czeka na zakończenie inicjalizacji bazy danych YTPTube, zanim usługa zostanie zgłoszona jako gotowa, dzięki czemu interfejs webowy nie pokazuje już błędu „Failed to load configuration” zaraz po pierwszym uruchomieniu. Pobrania wysyłane do File Browser są teraz przechowywane w folderze z poprawnym właścicielem zamiast w folderze z prawem zapisu dla wszystkich, a YTPTube nie ma już dostępu do plików File Browser poza własnym folderem pobrań. Przebudowano na StartOS SDK 2.0.6.',
    fr_FR:
      'Attend que la base de données de YTPTube ait fini de s’initialiser avant de signaler le service comme prêt, afin que l’interface web n’affiche plus l’erreur « Failed to load configuration » juste après le premier démarrage. Les téléchargements envoyés vers File Browser sont désormais stockés dans un dossier au propriétaire correct au lieu d’un dossier accessible en écriture à tous, et YTPTube ne peut plus accéder aux fichiers de File Browser en dehors de son propre dossier de téléchargements. Reconstruit avec le SDK StartOS 2.0.6.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
