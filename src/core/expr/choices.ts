import { Choice, Choices } from '@tmplr/core'
import {
  isStringNode, MappedArrayWithSchema,
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { LocatedError } from '../../location'
import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateArray, validateField, validateStringOrObject } from '../../validation'


export type ChoicesNode = MappedObjectWithSchema<{
  prompt: MappedNode
  choices: MappedArrayWithSchema<MappedPrimitive<string> | MappedObjectWithSchema<{
    label: MappedNode
    value: MappedNode
  }> | MappedObject>
}>


export class ChoicesRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return hasField(node, 'choices')
  }

  override validate(node: ChoicesNode) {
    validateField(node, 'prompt', validateStringOrObject)
    validateField(node, 'choices', validateArray)

    node.object.choices.object.forEach(n => {
      validateStringOrObject(n)

      if (!isStringNode(n)) {
        if (hasField(n, 'label')) {
          validateField(n, 'label', validateStringOrObject)
          validateField(n, 'value', validateStringOrObject)
        } else if (Object.entries(n.object).length !== 1){
          throw new LocatedError(new Error('Choice must have a singular label'), n.location)
        }
      }
    })
  }

  protected resolve(node: ChoicesNode, context: ParsingContext): Choices {
    const prompt = context.parseNode(node.object.prompt)
    const choices: Choice[] = node.object.choices.object.map(n => {
      if (isStringNode(n)) {
        const val = context.parseNode(n)

        return { label: val, value: val }
      } else if (n.object.label) {
        return {
          label: context.parseNode(n.object.label),
          value: context.parseNode(n.object.value)
        }
      } else {
        const entry = Object.entries(n.object)[0]

        return {
          label: context.parseNode({
            object: entry![0],
            location: n.location,
          }),
          value: context.parseNode(entry![1] as MappedNode)
        }
      }
    })

    return new Choices(prompt, choices)
  }
}
