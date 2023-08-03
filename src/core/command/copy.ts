import { Copy } from '@tmplr/core'
import {
  MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateBoolean, validateField, validateOptionalField, validateStringOrObject } from '../../validation'


export type CopyNode = MappedObjectWithSchema<{
  copy: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
  ['include hidden']?: MappedPrimitive<boolean>
}>


export class CopyRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'copy')
  }

  override validate(node: MappedNode) {
    validateField(node, 'copy', validateStringOrObject)
    validateField(node, 'to', validateStringOrObject)
    validateOptionalField(node, 'include hidden', validateBoolean)
  }

  resolve(node: CopyNode, context: ParsingContext): Copy {
    const copy = context.parseNode(node.object.copy)
    const to = context.parseNode(node.object.to)
    const hidden = node.object['include hidden'] ? node.object['include hidden'].object : false

    return new Copy(copy, to, context.filesystem, context.extEvalContext, {
      hidden,
      log: context.changelog
    })
  }
}
