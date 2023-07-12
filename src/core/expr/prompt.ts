import { Prompt } from '@tmplr/core'
import { MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateStringOrObject } from '../../validation'


export type PromptNode = MappedObjectWithSchema<{
  prompt: MappedNode
  default?: MappedNode
}>


export class PromptRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return hasField(node, 'prompt')
  }

  override validate(node: MappedNode) {
    validateField(node, 'prompt', validateStringOrObject)
  }

  protected resolve(node: PromptNode, context: ParsingContext): Prompt {
    const _default = node.object.default ? context.parseNode(node.object.default) : undefined
    const prompt = context.parseNode(node.object.prompt)

    return new Prompt(prompt, _default)
  }
}
