import { Prompt } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export class PromptRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return node.object['prompt']?.object !== undefined
  }

  protected resolve(node: MappedNode, context: ParsingContext): Prompt {
    const _default = node.object['default'] ? context.parse(node.object['default']) : undefined
    const prompt = context.parse(node.object['prompt'])

    return new Prompt(prompt, _default)
  }
}
