import { From, If } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export class IfRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return typeof node.object['if'] !== 'undefined'
  }

  resolve(node: MappedNode, context: ParsingContext): If {
    const condition = typeof node.object['if'].object === 'string' ?
      new From(node.object['if'].object, context.scope) :
      context.parse(node.object['if'])

    const thn = { ...node.object }
    delete thn['if']
    delete thn['else']

    const then = context.parse({ object: thn, location: node.location })

    const els = node.object['else']
    const _else = els ? context.parse(els) : undefined

    return new If(condition, then, _else)
  }
}
