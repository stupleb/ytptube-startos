import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v2_7_5_1 } from './v2.7.5_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2_7_5_1],
})
