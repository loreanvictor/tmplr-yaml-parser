import { Prompt } from '@tmplr/core'
import { isObjectNode, MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type PromptNode = MappedObjectWithSchema<{
  prompt: MappedNode
  default?: MappedNode
}>


export class PromptRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) && !!node.object['prompt']
  }

  protected resolve(node: PromptNode, context: ParsingContext): Prompt {
    const _default = node.object.default ? context.parseNode(node.object.default) : undefined
    const prompt = context.parseNode(node.object.prompt)

    return new Prompt(prompt, _default)
  }
}
