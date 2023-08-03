import { Update } from '@tmplr/core'
import {
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateBoolean, validateField, validateOptionalField, validateStringOrObject } from '../../validation'


export type UpdateNode = MappedObjectWithSchema<{
  update: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class UpdateRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'update')
  }

  override validate(node: MappedNode) {
    validateField(node, 'update', validateStringOrObject)
    validateOptionalField(node, 'include hidden', validateBoolean)
  }

  resolve(node: UpdateNode, context: ParsingContext): Update {
    const update = context.parseNode(node.object.update)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Update(update, context.filesystem, context.extEvalContext, {
      hidden,
      log: context.changelog
    })
  }
}
