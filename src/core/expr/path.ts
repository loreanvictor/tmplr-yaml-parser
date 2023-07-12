import { Path } from '@tmplr/core'
import { MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateStringOrObject } from '../../validation'


export type PathNode = MappedObjectWithSchema<{
  path: MappedNode
}>

export class PathRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return hasField(node, 'path')
  }

  override validate(node: MappedNode) {
    validateField(node, 'path', validateStringOrObject)
  }

  protected resolve(node: PathNode, context: ParsingContext): Path {
    return new Path(context.parseNode(node.object.path), context.filesystem)
  }
}
