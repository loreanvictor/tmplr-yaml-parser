import { FromFile } from '@tmplr/core'
import { MappedNode, MappedObjectWithSchema } from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateStringOrObject } from '../../validation'


export type FromFileNode = MappedObjectWithSchema<{
  'from file': MappedNode
}>

export class FromFileRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return hasField(node, 'from file')
  }

  override validate(node: MappedNode) {
    validateField(node, 'from file', validateStringOrObject)
  }

  protected resolve(node: FromFileNode, context: ParsingContext): FromFile {
    return new FromFile(context.parseNode(node.object['from file']), context.filesystem)
  }
}
