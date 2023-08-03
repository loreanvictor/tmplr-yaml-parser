import { Eval, Steps } from '@tmplr/core'
import {
  isObjectNode,
  isStringNode, MappedArrayWithSchema,
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingRule, ParsingContext } from '../../rule'
import { hasField, validateArray, validateField, validateOptionalField, validateString, validateStringOrObject } from '../../validation'


export type EvalNode = MappedPrimitive<string> | MappedObjectWithSchema<{
  eval: MappedPrimitive<string>
  steps?: MappedArrayWithSchema<MappedObject>
}>


export class EvalRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isStringNode(node) || hasField(node, 'eval')
  }

  override validate(node: MappedNode) {
    validateStringOrObject(node)

    if (isObjectNode(node)) {
      validateField(node, 'eval', validateString)
      validateOptionalField(node, 'steps', validateArray)
    }
  }

  resolve(node: EvalNode, context: ParsingContext): Eval {
    if (isStringNode(node)) {
      return new Eval(node.object, context.evaluationContext)
    } else if (node.object.steps) {
      const steps = node.object.steps.object.map(step => context.parseNode(step))

      return new Eval(node.object.eval.object, context.evaluationContext, {
        steps: new Steps(steps)
      })
    } else {
      return new Eval(node.object.eval.object, context.evaluationContext)
    }
  }
}
