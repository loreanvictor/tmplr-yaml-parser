import { MappedNode } from 'mapped-yaml'
import { Read } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'


export class ReadRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return typeof node.object['read']?.object === 'string'
  }

  resolve(node: MappedNode, context: ParsingContext): Read {
    const key = node.object['read'].object
    const copy = { ...node.object }
    delete copy['read']

    const expr = context.parse({
      object: copy,
      location: node.location
    })

    return new Read(key, expr, context.scope)
  }
}
