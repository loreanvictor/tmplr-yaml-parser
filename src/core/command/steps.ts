import { Steps } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'


export class StepsRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return Array.isArray(node.object['steps']?.object)
  }

  resolve(node: MappedNode, context: ParsingContext): Steps {
    const steps = node.object['steps'].object.map(step => context.parse(step))

    return new Steps(steps)
  }
}
