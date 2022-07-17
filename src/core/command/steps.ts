import { Steps } from '@tmplr/core'
import { isArrayNode, isObjectNode, MappedArrayWithSchema, MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'


export type StepsNode = MappedObjectWithSchema<{
  steps: MappedArrayWithSchema<MappedNode>
}>


export class StepsRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) && !!node.object['steps'] && isArrayNode(node.object['steps'])
  }

  resolve(node: StepsNode, context: ParsingContext): Steps {
    const steps = node.object.steps.object.map(step => context.parseNode(step))

    return new Steps(steps)
  }
}
