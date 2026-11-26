import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.2:0',
  releaseNotes: {
    en_US:
      'Updated YTPTube to 2.8.2, which adds custom tools to the Toolbox and lets you requeue a download in progress. The list of past Toolbox jobs is cleared by the update.',
    es_ES:
      'YTPTube actualizado a 2.8.2, que añade herramientas personalizadas a la Caja de herramientas y permite volver a poner en cola una descarga en curso. La actualización borra la lista de tareas anteriores de la Caja de herramientas.',
    de_DE:
      'YTPTube auf 2.8.2 aktualisiert, mit eigenen Werkzeugen in der Toolbox und der Möglichkeit, einen laufenden Download erneut einzureihen. Das Update leert die Liste früherer Toolbox-Aufträge.',
    pl_PL:
      'Zaktualizowano YTPTube do 2.8.2, który dodaje własne narzędzia do Przybornika i pozwala ponownie dodać do kolejki trwające pobieranie. Aktualizacja czyści listę wcześniejszych zadań Przybornika.',
    fr_FR:
      "YTPTube mis à jour vers 2.8.2, qui ajoute des outils personnalisés à la Boîte à outils et permet de remettre en file d'attente un téléchargement en cours. La mise à jour efface la liste des tâches précédentes de la Boîte à outils.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
