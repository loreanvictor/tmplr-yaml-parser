import { From, If } from '@tmplr/core'
import { MappedNode, MappedObject, isStringNode, MappedPrimitive, MappedObjectWithSchema } from 'mapped-yaml'
import { LocatedRunnable } from '../../location'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateObject, validateOptionalField, validateStringOrObject } from '../../validation'


export type IfNode = MappedObjectWithSchema<{
  if: MappedPrimitive<string> | MappedObject
  else?: MappedObject
}>


export class IfRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'if')
  }

  override validate(node: MappedNode) {
    validateField(node, 'if', validateStringOrObject)
    validateOptionalField(node, 'else', validateObject)
  }

  resolve(node: IfNode, context: ParsingContext): If {
    const condition = isStringNode(node.object.if!) ?
      new LocatedRunnable(new From(node.object.if.object, context.scope), node.object.if.location) :
      context.parseNode(node.object.if)

    const thn: {[key: string]: MappedNode} = { ...node.object }
    delete thn['if']
    delete thn['else']

    const then = context.parseNode({ object: thn, location: node.location })
    const _else = node.object.else ? context.parseNode(node.object.else) : undefined

    return new If(condition, then, {
      else: _else
    })
  }
}
