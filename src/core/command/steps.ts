import { Steps } from '@tmplr/core'
import { MappedArrayWithSchema, MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'
import { hasField, validateArray, validateField } from '../../validation'


export type StepsNode = MappedObjectWithSchema<{
  steps: MappedArrayWithSchema<MappedNode>
}>


export class StepsRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'steps')
  }

  override validate(node: MappedNode) {
    validateField(node, 'steps', validateArray)
  }

  resolve(node: StepsNode, context: ParsingContext): Steps {
    const steps = node.object.steps.object.map(step => context.parseNode(step))

    return new Steps(steps)
  }
}
