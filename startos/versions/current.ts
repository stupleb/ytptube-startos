import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.2:0',
  releaseNotes: {
    en_US:
      'Updates YTPTube to v2.7.2. The browser password prompt is replaced by a proper sign-in page with account management — change your username and password in the app, review and revoke active sessions, and create API keys. Signing in to YTPTube no longer stops File Browser from playing or downloading media. Resetting the admin password now also signs out every device. Includes an upstream security fix for file renaming.',
    es_ES:
      'Actualiza YTPTube a v2.7.2. El aviso de contraseña del navegador se sustituye por una página de inicio de sesión con gestión de cuenta: cambia tu usuario y contraseña en la aplicación, revisa y revoca sesiones activas y crea claves de API. Iniciar sesión en YTPTube ya no impide que File Browser reproduzca o descargue archivos. Restablecer la contraseña de administrador ahora cierra la sesión en todos los dispositivos. Incluye una corrección de seguridad de origen para el renombrado de archivos.',
    de_DE:
      'Aktualisiert YTPTube auf v2.7.2. Die Passwortabfrage des Browsers wird durch eine richtige Anmeldeseite mit Kontoverwaltung ersetzt — Benutzername und Passwort in der App ändern, aktive Sitzungen einsehen und widerrufen sowie API-Schlüssel erstellen. Die Anmeldung bei YTPTube verhindert nicht mehr, dass File Browser Medien abspielt oder herunterlädt. Das Zurücksetzen des Admin-Passworts meldet jetzt alle Geräte ab. Enthält eine Sicherheitskorrektur des Upstream-Projekts für das Umbenennen von Dateien.',
    pl_PL:
      'Aktualizuje YTPTube do v2.7.2. Monit przeglądarki o hasło zastąpiono właściwą stroną logowania z zarządzaniem kontem — zmień nazwę użytkownika i hasło w aplikacji, przeglądaj i unieważniaj aktywne sesje oraz twórz klucze API. Zalogowanie się do YTPTube nie blokuje już odtwarzania ani pobierania plików w File Browser. Zresetowanie hasła administratora wylogowuje teraz wszystkie urządzenia. Zawiera poprawkę bezpieczeństwa z projektu źródłowego dotyczącą zmiany nazw plików.',
    fr_FR:
      'Met à jour YTPTube vers la v2.7.2. L’invite de mot de passe du navigateur est remplacée par une véritable page de connexion avec gestion de compte : modifiez vos identifiants dans l’application, consultez et révoquez les sessions actives et créez des clés d’API. Se connecter à YTPTube n’empêche plus File Browser de lire ou de télécharger des fichiers. La réinitialisation du mot de passe administrateur déconnecte désormais tous les appareils. Inclut un correctif de sécurité en amont pour le renommage de fichiers.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
