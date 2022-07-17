import { Choice, Choices } from '@tmplr/core'
import {
  isArrayNode, isObjectNode, isStringNode, MappedArrayWithSchema,
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { LocatedError } from '../../location'
import { ParsingContext, ParsingRule } from '../../rule'


export type ChoicesNode = MappedObjectWithSchema<{
  prompt: MappedNode
  choices: MappedArrayWithSchema<MappedPrimitive<string> | MappedObjectWithSchema<{
    label: MappedNode
    value: MappedNode
  }> | MappedObject>
}>

// TODO: use a standard ParserError class
export class ChoicesRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node)
      && !!node.object['prompt']
      && !!node.object['choices'] && isArrayNode(node.object['choices'])
  }

  protected resolve(node: ChoicesNode, context: ParsingContext): Choices {
    const prompt = context.parseNode(node.object.prompt)
    const choices: Choice[] = node.object.choices.object.map(n => {
      if (isStringNode(n)) {
        const val = context.parseNode(n)

        return { label: val, value: val }
      } else if (n.object.label) {
        if (n.object.value === undefined) {
          throw new LocatedError(new Error('Choice must have a value'), n.location)
        }

        return {
          label: context.parseNode(n.object.label),
          value: context.parseNode(n.object.value)
        }
      } else {
        if (Object.entries(n.object).length !== 1){
          throw new LocatedError(new Error('Choice must have a singular label'), n.location)
        }

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
