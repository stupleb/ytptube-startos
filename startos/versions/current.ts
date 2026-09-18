import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.3:0',
  releaseNotes: {
    en_US:
      'Updates YTPTube to v2.7.3. YouTube downloads are more reliable: the token provider YouTube now requires for many videos is bundled and runs alongside YTPTube, adding about 160 MB of memory use. Tasks can now ignore their conditions, the browser extension works in Firefox for Android, and an iOS Shortcut can send links straight to YTPTube.',
    es_ES:
      'Actualiza YTPTube a v2.7.3. Las descargas de YouTube son más fiables: el proveedor de tokens que YouTube exige ahora para muchos vídeos viene incluido y se ejecuta junto a YTPTube, lo que añade unos 160 MB de uso de memoria. Las tareas ya pueden ignorar sus condiciones, la extensión del navegador funciona en Firefox para Android y un atajo de iOS puede enviar enlaces directamente a YTPTube.',
    de_DE:
      'Aktualisiert YTPTube auf v2.7.3. YouTube-Downloads sind zuverlässiger: Der Token-Anbieter, den YouTube inzwischen für viele Videos verlangt, ist mitgeliefert und läuft neben YTPTube, was etwa 160 MB zusätzlichen Arbeitsspeicher belegt. Aufgaben können ihre Bedingungen jetzt ignorieren, die Browser-Erweiterung funktioniert in Firefox für Android, und ein iOS-Kurzbefehl kann Links direkt an YTPTube senden.',
    pl_PL:
      'Aktualizuje YTPTube do v2.7.3. Pobieranie z YouTube jest bardziej niezawodne: dostawca tokenów, którego YouTube wymaga teraz dla wielu filmów, jest dołączony i działa obok YTPTube, co zwiększa zużycie pamięci o około 160 MB. Zadania mogą teraz ignorować swoje warunki, rozszerzenie przeglądarki działa w Firefoksie na Androida, a skrót iOS może wysyłać linki bezpośrednio do YTPTube.',
    fr_FR:
      'Met à jour YTPTube vers la v2.7.3. Les téléchargements YouTube sont plus fiables : le fournisseur de jetons que YouTube exige désormais pour de nombreuses vidéos est inclus et fonctionne aux côtés de YTPTube, ce qui ajoute environ 160 Mo d’utilisation mémoire. Les tâches peuvent désormais ignorer leurs conditions, l’extension de navigateur fonctionne dans Firefox pour Android, et un raccourci iOS peut envoyer des liens directement à YTPTube.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
