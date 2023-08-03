import { Remove } from '@tmplr/core'
import {
  MappedNode, MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateBoolean, validateField, validateOptionalField, validateStringOrObject } from '../../validation'


export type RemoveNode = MappedObjectWithSchema<{
  remove: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class RemoveRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'remove')
  }

  override validate(node: MappedNode) {
    validateField(node, 'remove', validateStringOrObject)
    validateOptionalField(node, 'include hidden', validateBoolean)
  }

  resolve(node: RemoveNode, context: ParsingContext): Remove {
    const remove = context.parseNode(node.object.remove)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Remove(remove, context.filesystem, {
      hidden,
      log: context.changelog
    })
  }
}
