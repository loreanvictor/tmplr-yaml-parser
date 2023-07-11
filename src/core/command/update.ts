import { Update } from '@tmplr/core'
import {
  isObjectNode, isStringNode, isBooleanNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type UpdateNode = MappedObjectWithSchema<{
  update: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class UpdateRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['update'] &&
      (isObjectNode(node.object['update']) || isStringNode(node.object['update']))
      && (!node.object['include hidden'] || isBooleanNode(node.object['include hidden']))
  }

  resolve(node: UpdateNode, context: ParsingContext): Update {
    const update = context.parseNode(node.object.update)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Update(update, hidden, context.filesystem, context.extEvalContext, context.changelog)
  }
}
