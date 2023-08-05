import { Exists } from '@tmplr/core'
import {
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateBoolean, validateField, validateOptionalField, validateStringOrObject } from '../../validation'


export type ExistsNode = MappedObjectWithSchema<{
  exists: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class ExistsRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'exists')
  }

  override validate(node: MappedNode) {
    validateField(node, 'exists', validateStringOrObject)
    validateOptionalField(node, 'include hidden', validateBoolean)
  }

  resolve(node: ExistsNode, context: ParsingContext): Exists {
    const target = context.parseNode(node.object.exists)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Exists(target, context.filesystem, { hidden })
  }
}
