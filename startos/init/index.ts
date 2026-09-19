import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { watchAuth } from './watchAuth'
import { watchDestination } from './watchDestination'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  watchAuth,
  watchDestination,
)

export const uninit = sdk.setupUninit(versionGraph)
