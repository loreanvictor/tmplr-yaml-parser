import { From, If } from '@tmplr/core'
import { MappedNode, MappedObject, isObjectNode, isStringNode, MappedPrimitive, MappedObjectWithSchema } from 'mapped-yaml'
import { LocatedRunnable } from '../../location'

import { ParsingContext, ParsingRule } from '../../rule'


export type IfNode = MappedObjectWithSchema<{
  if: MappedPrimitive<string> | MappedObject
  else?: MappedObject
}>


export class IfRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['if'] &&
      (isObjectNode(node.object['if']) || isStringNode(node.object['if']))
      && (!node.object['else'] || isObjectNode(node.object['else']))
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

    return new If(condition, then, _else)
  }
}
