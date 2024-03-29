import { MappedNode, MappedObjectWithSchema, MappedPrimitive } from 'mapped-yaml'
import { Read } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateString } from '../../validation'


export type ReadNode = MappedObjectWithSchema<{
  read: MappedPrimitive<string>
  [key: string]: MappedNode
}>


export class ReadRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'read')
  }

  override validate(node: MappedNode) {
    validateField(node, 'read', validateString)
  }

  resolve(node: ReadNode, context: ParsingContext): Read {
    const key = node.object.read.object
    const rest: {[key: string]: MappedNode} = { ...node.object }
    delete rest['read']

    const expr = context.parseNode({
      object: rest,
      location: node.location
    })

    return new Read(key, expr, context.scope)
  }
}
