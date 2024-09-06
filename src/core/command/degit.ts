import { Degit } from '@tmplr/core'
import {
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateBoolean, validateField, validateOptionalField, validateStringOrObject } from '../../validation'


export type DegitNode = MappedObjectWithSchema<{
  degit: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
  subgroup?: MappedPrimitive<boolean>
}>


export class DegitRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'degit')
  }

  override validate(node: MappedNode) {
    validateField(node, 'degit', validateStringOrObject)
    validateField(node, 'to', validateStringOrObject)
    validateOptionalField(node, 'subgroup', validateBoolean)
  }

  resolve(node: DegitNode, context: ParsingContext): Degit {
    const copy = context.parseNode(node.object.degit)
    const to = context.parseNode(node.object.to)
    const subgroup = node.object['subgroup'] ? node.object['subgroup'].object : false

    return new Degit(copy, to, context.filesystem, {
      log: context.changelog,
      subgroup,
    })
  }
}
