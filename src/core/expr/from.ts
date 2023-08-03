import { From } from '@tmplr/core'
import { isObjectNode, MappedNode, MappedObjectWithSchema, MappedPrimitive } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField } from '../../validation'


export type FromNode = MappedObjectWithSchema<{
  from: MappedPrimitive<string>
  fallback?: MappedNode
}>


export class FromRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) && hasField(node, 'from')
  }

  resolve(node: FromNode, context: ParsingContext): From {
    const key = node.object.from.object
    if (node.object.fallback) {
      const fallback = context.parseNode(node.object.fallback)

      return new From(key, context.scope, { fallback })
    } else {
      return new From(key, context.scope)
    }
  }
}
