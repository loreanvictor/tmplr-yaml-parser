import { Eval, Steps } from '@tmplr/core'
import {
  isArrayNode, isObjectNode, isStringNode, MappedArrayWithSchema,
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'


export type EvalNode = MappedPrimitive<string> | MappedObjectWithSchema<{
  eval: MappedPrimitive<string>
  steps?: MappedArrayWithSchema<MappedObject>
}>


export class EvalRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isStringNode(node) || (
      isObjectNode(node) &&
      !!node.object['eval'] &&
      isStringNode(node.object['eval']) && (
        !node.object['steps'] || isArrayNode(node.object['steps'])
      )
    )
  }

  resolve(node: EvalNode, context: ParsingContext): Eval {
    if (isStringNode(node)) {
      return new Eval(node.object, context.evaluationContext)
    } else if (node.object.steps) {
      const steps = node.object.steps.object.map(step => context.parseNode(step))

      return new Eval(node.object.eval.object, context.evaluationContext, new Steps(steps))
    } else {
      return new Eval(node.object.eval.object, context.evaluationContext)
    }
  }
}
