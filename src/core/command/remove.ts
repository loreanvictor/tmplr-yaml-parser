import { Remove } from '@tmplr/core'
import {
  isObjectNode, isStringNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type RemoveNode = MappedObjectWithSchema<{
  remove: MappedObject | MappedPrimitive<string>
}>


export class RemoveRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['remove'] &&
      (isObjectNode(node.object['remove']) || isStringNode(node.object['remove']))
  }

  resolve(node: RemoveNode, context: ParsingContext): Remove {
    const remove = context.parseNode(node.object.remove)

    return new Remove(remove, context.filesystem, context.changelog)
  }
}
