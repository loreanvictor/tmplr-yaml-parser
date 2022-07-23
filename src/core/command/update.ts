import { Update } from '@tmplr/core'
import {
  isObjectNode, isStringNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type UpdateNode = MappedObjectWithSchema<{
  update: MappedObject | MappedPrimitive<string>
}>


export class UpdateRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['update'] &&
      (isObjectNode(node.object['update']) || isStringNode(node.object['update']))
  }

  resolve(node: UpdateNode, context: ParsingContext): Update {
    const update = context.parseNode(node.object.update)

    return new Update(update,context.filesystem, context.extEvalContext, context.changelog)
  }
}
