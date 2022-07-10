import { Choice, Choices } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'
import { LocatedError } from '../../location'

import { ParsingContext, ParsingRule } from '../../rule'


// TODO: use a standard ParserError class
export class ChoicesRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return Array.isArray(node.object['choices']?.object) && node.object['prompt']?.object !== undefined
  }

  protected resolve(node: MappedNode, context: ParsingContext): Choices {
    const prompt = context.parse(node.object['prompt'])
    const choices: Choice[] = node.object['choices'].object.map((n: MappedNode) => {
      if (typeof n.object === 'string') {
        const val = context.parse(n)

        return { label: val, value: val }
      } else if (n.object['label'] !== undefined) {
        if (n.object['value'] === undefined) {
          throw new LocatedError(new Error('Choice must have a value'), n.location)
        }

        return {
          label: context.parse(n.object['label']),
          value: context.parse(n.object['value'])
        }
      } else {
        if (Object.entries(n.object).length !== 1){
          throw new LocatedError(new Error('Choice must have a singular label'), n.location)
        }

        const entry = Object.entries(n.object)[0]

        return {
          label: context.parse({
            object: entry![0],
            location: n.location,
          }),
          value: context.parse(entry![1] as MappedNode)
        }
      }
    })

    return new Choices(prompt, choices)
  }
}
