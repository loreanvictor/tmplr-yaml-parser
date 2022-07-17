import { From } from '@tmplr/core'
import { isObjectNode, isStringNode, MappedNode, MappedObjectWithSchema, MappedPrimitive } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type FromNode = MappedObjectWithSchema<{
  from: MappedPrimitive<string>
  fallback?: MappedNode
}>


export class FromRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['from'] && isStringNode(node.object['from'])
  }

  resolve(node: FromNode, context: ParsingContext): From {
    const key = node.object.from.object
    if (node.object.fallback) {
      const fallback = context.parseNode(node.object.fallback)

      return new From(key, context.scope, fallback)
    } else {
      return new From(key, context.scope)
    }
  }
}
