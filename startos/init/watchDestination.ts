import { downloadDestination } from '../actions/downloadDestination'
import { destinations, PackageInstalled } from '../destinations'
import { store } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const destinationMissingTask = 'destination-missing'

// While the chosen download destination's service is not installed, main saves
// downloads to local storage instead (writing into the folder would leave them
// in a volume no installed service shows). Tell the user, and point them at the
// action that picks another destination; clear the prompt once the service is
// back or the choice changes. Re-runs only when the choice or the chosen
// service's installed state changes.
export const watchDestination = sdk.setupOnInit(async (effects) => {
  const destination =
    (await store.read((s) => s.downloadDestination).const(effects)) ?? 'local'

  const installed =
    destination === 'local' ||
    (await new PackageInstalled(
      effects,
      destinations[destination].packageId,
    ).const())

  if (installed) {
    await sdk.action.clearTask(effects, destinationMissingTask)
    return
  }

  await sdk.action.createOwnTask(effects, downloadDestination, 'important', {
    replayId: destinationMissingTask,
    // Running an action clears its task outright, so re-submitting the same
    // missing service would dismiss the prompt with nothing fixed — and the
    // choice would not change, so nothing would raise it again. With this
    // condition it stays until another destination is chosen; the service
    // coming back clears it above. The form opens with Local Storage selected.
    when: { condition: 'input-not-matches', once: false },
    input: {
      kind: 'partial',
      accept: (['local', 'filebrowser', 'nextexplorer'] as const)
        .filter((d) => d !== destination)
        .map((d) => ({ downloadDestination: d })),
      set: { downloadDestination: 'local' },
    },
    reason:
      destination === 'filebrowser'
        ? i18n(
            'File Browser is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.',
          )
        : i18n(
            'NextExplorer is not installed, so downloads are going to Local Storage. Reinstall it, or choose another destination.',
          ),
  })
})
