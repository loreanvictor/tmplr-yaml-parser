import { From, If, Noop } from '@tmplr/core'
import { MappedNode, MappedObject, isStringNode, MappedPrimitive, MappedObjectWithSchema } from 'mapped-yaml'
import { LocatedRunnable } from '../../location'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateExclusiveFields, validateField, validateObject, validateOptionalField, validateStringOrObject } from '../../validation'


export type IfNode = MappedObjectWithSchema<{
  if: MappedPrimitive<string> | MappedObject
  else?: MappedObject
}>


export class IfRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'if') || hasField(node, 'if not')
  }

  override validate(node: MappedNode) {
    if (hasField(node, 'if')) {
      validateField(node, 'if', validateStringOrObject)
    } else if (hasField(node, 'if not')) {
      validateField(node, 'if not', validateStringOrObject)
    }

    validateExclusiveFields(node, 'if', 'if not')
    validateOptionalField(node, 'else', validateObject)
  }

  resolve(node: IfNode, context: ParsingContext): If {
    const condfield = hasField(node, 'if') ? 'if' : 'if not'
    const condnode = node.object[condfield]
    const condition = isStringNode(condnode!) ?
      new LocatedRunnable(new From(condnode.object, context.scope), condnode.location) :
      context.parseNode(condnode!)

    const thn: {[key: string]: MappedNode} = { ...node.object }
    delete thn[condfield]
    delete thn['else']

    const then = context.parseNode({ object: thn, location: node.location })
    const _else = node.object.else ? context.parseNode(node.object.else) : undefined

    if (condfield === 'if') {
      return new If(condition, then, {
        else: _else
      })
    } else {
      return new If(condition, _else || new Noop(), {
        else: then
      })
    }
  }
}
