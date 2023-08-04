import { From, If } from '@tmplr/core'
import { MappedNode, MappedObject, isStringNode, MappedPrimitive, MappedObjectWithSchema } from 'mapped-yaml'
import { LocatedRunnable } from '../../location'

import { ParsingContext, ParsingRule } from '../../rule'
import { hasField, validateField, validateObject, validateOptionalField, validateStringOrObject } from '../../validation'


export type WhereNode = MappedObjectWithSchema<{
  where: MappedPrimitive<string> | MappedObject
  else?: MappedObject
}>


export class WhereRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'where')
  }

  override validate(node: MappedNode) {
    validateField(node, 'where', validateStringOrObject)
    validateOptionalField(node, 'else', validateObject)
  }

  resolve(node: WhereNode, context: ParsingContext): If {
    const condition = isStringNode(node.object.where!) ?
      new LocatedRunnable(new From(node.object.where.object, context.scope), node.object.where.location) :
      context.parseNode(node.object.where)

    const thn: {[key: string]: MappedNode} = { ...node.object }
    delete thn['where']
    delete thn['else']

    const then = context.parseNode({ object: thn, location: node.location })
    const _else = node.object.else ? context.parseNode(node.object.else) : undefined

    return new If(condition, then, {
      else: _else
    })
  }
}
