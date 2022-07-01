import { From } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export class FromRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return typeof node.object['from']?.object === 'string'
  }

  resolve(node: MappedNode, context: ParsingContext): From {
    const key: string = node.object['from'].object
    if ('fallback' in node.object) {
      const fallback = context.parse(node.object['fallback'])

      return new From(key, context.scope, fallback)
    } else {
      return new From(key, context.scope)
    }
  }
}
