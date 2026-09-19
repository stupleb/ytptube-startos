import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.3:1',
  releaseNotes: {
    en_US:
      'YTPTube can now save downloads to NextExplorer as well as File Browser; choose it with the Select Download Destination action, and downloads land in a drive called YTPTube. If the file manager you chose is uninstalled, downloads now go to YTPTube’s own storage and a prompt appears on the service page, instead of disappearing into a folder no service shows. File Browser is no longer maintained; its successor, FileBrowser Quantum, works in its place. Updating from earlier than 2.7.3? That release bundled YouTube’s token provider, which uses about 160 MB more memory.',
    es_ES:
      'YTPTube ya puede guardar las descargas en NextExplorer, además de en File Browser; elígelo con la acción Seleccionar destino de descarga y las descargas llegarán a una unidad llamada YTPTube. Si se desinstala el gestor de archivos que elegiste, las descargas pasan al almacenamiento propio de YTPTube y aparece un aviso en la página del servicio, en lugar de perderse en una carpeta que ningún servicio muestra. File Browser ya no recibe mantenimiento; su sucesor, FileBrowser Quantum, funciona en su lugar. ¿Actualizas desde una versión anterior a 2.7.3? Esa versión incluyó el proveedor de tokens de YouTube, que usa unos 160 MB más de memoria.',
    de_DE:
      'YTPTube kann Downloads jetzt auch in NextExplorer statt nur in File Browser speichern; wähle es mit der Aktion „Download-Ziel auswählen“, dann landen Downloads in einem Laufwerk namens YTPTube. Wird der gewählte Dateimanager deinstalliert, landen Downloads jetzt im eigenen Speicher von YTPTube und auf der Dienstseite erscheint ein Hinweis, statt dass sie in einem Ordner verschwinden, den kein Dienst anzeigt. File Browser wird nicht mehr gepflegt; sein Nachfolger FileBrowser Quantum funktioniert an seiner Stelle. Aktualisierst du von einer Version vor 2.7.3? Diese Version brachte den Token-Anbieter von YouTube mit, der etwa 160 MB mehr Arbeitsspeicher belegt.',
    pl_PL:
      'YTPTube może teraz zapisywać pobrania w NextExplorer, a nie tylko w File Browser; wybierz go akcją Wybierz miejsce docelowe pobierania, a pobrania trafią na dysk o nazwie YTPTube. Jeśli wybrany menedżer plików zostanie odinstalowany, pobrania trafiają teraz do własnej pamięci YTPTube, a na stronie usługi pojawia się komunikat — zamiast znikać w folderze, którego nie pokazuje żadna usługa. File Browser nie jest już rozwijany; jego następca, FileBrowser Quantum, działa w jego miejsce. Aktualizujesz z wersji starszej niż 2.7.3? Ta wersja dołączyła dostawcę tokenów YouTube, który zużywa około 160 MB więcej pamięci.',
    fr_FR:
      'YTPTube peut désormais enregistrer les téléchargements dans NextExplorer en plus de File Browser ; choisissez-le avec l’action Sélectionner la destination de téléchargement, et les téléchargements arrivent dans un lecteur nommé YTPTube. Si le gestionnaire de fichiers choisi est désinstallé, les téléchargements vont désormais dans le stockage propre à YTPTube et une invite apparaît sur la page du service, au lieu de disparaître dans un dossier qu’aucun service n’affiche. File Browser n’est plus maintenu ; son successeur, FileBrowser Quantum, fonctionne à sa place. Vous mettez à jour depuis une version antérieure à 2.7.3 ? Cette version a intégré le fournisseur de jetons de YouTube, qui utilise environ 160 Mo de mémoire en plus.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
