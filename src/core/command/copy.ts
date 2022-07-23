import { Copy } from '@tmplr/core'
import {
  isObjectNode, isStringNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type CopyNode = MappedObjectWithSchema<{
  copy: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
}>


export class CopyRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['copy'] &&
      (isObjectNode(node.object['copy']) || isStringNode(node.object['copy']))
      && !!node.object['to'] &&
      (isObjectNode(node.object['to']) || isStringNode(node.object['to']))
  }

  resolve(node: CopyNode, context: ParsingContext): Copy {
    const copy = context.parseNode(node.object.copy)
    const to = context.parseNode(node.object.to)

    return new Copy(copy, to, context.filesystem, context.extEvalContext, context.changelog)
  }
}
