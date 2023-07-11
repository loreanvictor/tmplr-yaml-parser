import { Copy } from '@tmplr/core'
import {
  isObjectNode, isStringNode, isBooleanNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type CopyNode = MappedObjectWithSchema<{
  copy: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class CopyRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['copy'] &&
      (isObjectNode(node.object['copy']) || isStringNode(node.object['copy']))
      && !!node.object['to'] &&
      (isObjectNode(node.object['to']) || isStringNode(node.object['to']))
      && (!node.object['include hidden'] || isBooleanNode(node.object['include hidden']))
  }

  resolve(node: CopyNode, context: ParsingContext): Copy {
    const copy = context.parseNode(node.object.copy)
    const to = context.parseNode(node.object.to)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Copy(copy, to, hidden, context.filesystem, context.extEvalContext, context.changelog)
  }
}
