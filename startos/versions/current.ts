import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.4:2',
  releaseNotes: {
    en_US:
      '**Select Download Destination** lets you choose which NextExplorer location YTPTube saves into. Saving to NextExplorer needs NextExplorer 3.1.0:2 or later.',
    es_ES:
      '**Seleccionar destino de descarga** permite elegir en qué ubicación de NextExplorer guarda YTPTube. Guardar en NextExplorer requiere NextExplorer 3.1.0:2 o posterior.',
    de_DE:
      'Unter **Download-Ziel auswählen** legst du fest, an welchem NextExplorer-Standort YTPTube speichert. Speichern in NextExplorer erfordert NextExplorer 3.1.0:2 oder neuer.',
    pl_PL:
      '**Wybierz miejsce docelowe pobierania** pozwala wybrać, w której lokalizacji NextExplorer YTPTube zapisuje pliki. Zapisywanie w NextExplorer wymaga NextExplorer 3.1.0:2 lub nowszego.',
    fr_FR:
      '**Sélectionner la destination de téléchargement** permet de choisir l’emplacement NextExplorer dans lequel YTPTube enregistre. L’enregistrement dans NextExplorer nécessite NextExplorer 3.1.0:2 ou une version ultérieure.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
