import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_2_5_6_1 = VersionInfo.of({
  version: '2.5.6:1',
  releaseNotes: {
    en_US:
      'Wait for YTPTube’s database to finish initializing before reporting the service ready, so the web UI no longer shows a "Failed to load configuration" error right after first start.',
    es_ES:
      'Espera a que la base de datos de YTPTube termine de inicializarse antes de marcar el servicio como listo, de modo que la interfaz web ya no muestre el error "Failed to load configuration" justo después del primer inicio.',
    de_DE:
      'Wartet, bis die Datenbank von YTPTube vollständig initialisiert ist, bevor der Dienst als bereit gemeldet wird, sodass die Weboberfläche direkt nach dem ersten Start keinen Fehler „Failed to load configuration“ mehr anzeigt.',
    pl_PL:
      'Czeka na zakończenie inicjalizacji bazy danych YTPTube, zanim usługa zostanie zgłoszona jako gotowa, dzięki czemu interfejs webowy nie pokazuje już błędu „Failed to load configuration” zaraz po pierwszym uruchomieniu.',
    fr_FR:
      'Attend que la base de données de YTPTube ait fini de s’initialiser avant de signaler le service comme prêt, afin que l’interface web n’affiche plus l’erreur « Failed to load configuration » juste après le premier démarrage.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
