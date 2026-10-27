import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v2_7_5_1 } from './v2.7.5_1'
import { v2_7_5_2 } from './v2.7.5_2'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2_7_5_2, v2_7_5_1],
})
