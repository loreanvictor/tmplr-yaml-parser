import { Remove } from '@tmplr/core'
import {
  isObjectNode, isStringNode, isBooleanNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type RemoveNode = MappedObjectWithSchema<{
  remove: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class RemoveRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['remove'] &&
      (isObjectNode(node.object['remove']) || isStringNode(node.object['remove']))
      && (!node.object['include hidden'] || isBooleanNode(node.object['include hidden']))
  }

  resolve(node: RemoveNode, context: ParsingContext): Remove {
    const remove = context.parseNode(node.object.remove)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Remove(remove, hidden, context.filesystem, context.changelog)
  }
}
