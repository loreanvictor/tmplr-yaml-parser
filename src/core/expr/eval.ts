import { Eval } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'


export class EvalRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return typeof node.object['eval']?.object === 'string'
  }

  resolve(node: MappedNode, context: ParsingContext): Eval {
    if (node.object['steps']) {
      const stps = { ...node.object }
      delete stps['eval']

      const steps = context.parse({ object: stps, location: node.location })

      return new Eval(node.object['eval'].object, context.evaluationContext, steps)
    } else {
      return new Eval(node.object['eval'].object, context.evaluationContext)
    }
  }
}
