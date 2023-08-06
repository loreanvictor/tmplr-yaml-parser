import { Write } from '@tmplr/core'
import {
  MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateStringOrObject } from '../../validation'


export type WriteNode = MappedObjectWithSchema<{
  write: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
}>


export class WriteRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'write')
  }

  override validate(node: MappedNode) {
    validateField(node, 'write', validateStringOrObject)
    validateField(node, 'to', validateStringOrObject)
  }

  resolve(node: WriteNode, context: ParsingContext): Write {
    const copy = context.parseNode(node.object.write)
    const to = context.parseNode(node.object.to)

    return new Write(copy, to, context.filesystem, context.extEvalContext, {
      log: context.changelog
    })
  }
}
