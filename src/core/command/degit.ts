import { Degit } from '@tmplr/core'
import {
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateStringOrObject } from '../../validation'


export type DegitNode = MappedObjectWithSchema<{
  degit: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
}>


export class DegitRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'degit')
  }

  override validate(node: MappedNode) {
    validateField(node, 'degit', validateStringOrObject)
    validateField(node, 'to', validateStringOrObject)
  }

  resolve(node: DegitNode, context: ParsingContext): Degit {
    const copy = context.parseNode(node.object.degit)
    const to = context.parseNode(node.object.to)

    return new Degit(copy, to, context.filesystem, {
      log: context.changelog
    })
  }
}
