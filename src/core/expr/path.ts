import { Path } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export class PathRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return node.object['path']?.object !== undefined
  }

  protected resolve(node: MappedNode, context: ParsingContext): Path {
    return new Path(context.parse(node.object['path']), context.filesystem)
  }
}
