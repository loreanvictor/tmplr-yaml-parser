import { Value } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'


export class ValueRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return typeof node.object === 'string' || typeof node.object === 'boolean' || typeof node.object === 'number'
  }

  resolve(node: MappedNode, _: ParsingContext): Value {
    return new Value(`${node.object}`)
  }
}
