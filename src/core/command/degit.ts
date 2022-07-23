import { Degit } from '@tmplr/core'
import {
  isObjectNode, isStringNode, MappedNode,
  MappedObject, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'

import { ParsingContext, ParsingRule } from '../../rule'


export type DegitNode = MappedObjectWithSchema<{
  degit: MappedObject | MappedPrimitive<string>
  to: MappedObject | MappedPrimitive<string>
}>


export class DegitRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node) &&
      !!node.object['degit'] &&
      (isObjectNode(node.object['degit']) || isStringNode(node.object['degit']))
      && !!node.object['to'] &&
      (isObjectNode(node.object['to']) || isStringNode(node.object['to']))
  }

  resolve(node: DegitNode, context: ParsingContext): Degit {
    const copy = context.parseNode(node.object.degit)
    const to = context.parseNode(node.object.to)

    return new Degit(copy, to, context.filesystem, context.changelog)
  }
}
