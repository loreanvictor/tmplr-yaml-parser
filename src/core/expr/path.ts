import { Path } from '@tmplr/core'
import { isObjectNode, MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type PathNode = MappedObjectWithSchema<{
  path: MappedNode
}>

export class PathRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) && !!node.object['path']
  }

  protected resolve(node: PathNode, context: ParsingContext): Path {
    return new Path(context.parseNode(node.object.path), context.filesystem)
  }
}
