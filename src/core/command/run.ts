import {
  MappedNode, MappedObject, isObjectNode, isStringNode, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'
import { Run } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'
import { LocatedError } from '../../location'


export type RunNode = MappedObjectWithSchema<{
  run: MappedPrimitive<string> | MappedObject
  with?: MappedObject
  read?: MappedObject
}>


export class RunRule extends ParsingRule {
  applies(node: MappedNode): boolean {
    return isObjectNode(node)
      && !!node.object['run']
      && (isObjectNode(node.object['run']) || isStringNode(node.object['run']))
      && (!node.object['with'] || isObjectNode(node.object['with']))
      && (!node.object['read'] || isObjectNode(node.object['read']))
  }

  resolve(node: RunNode, context: ParsingContext): Run {
    const inputs = {}
    const outputs = {}

    const target = context.parseNode(node.object.run)

    if (node.object.with) {
      Object.entries(node.object.with.object).forEach(([key, value]) => {
        inputs[key] = context.parseNode(value)
      })
    }

    if (node.object.read) {
      Object.entries(node.object.read.object).forEach(([key, value]) => {
        if (!isStringNode(value)) {
          throw new LocatedError('read value must be a string', value.location)
        }

        outputs[key] = value.object
      })
    }

    return new Run(
      target,
      inputs,
      outputs,
      context.parseFile,
      context.filesystem,
      context.scope,
      context.evaluationContext,
      context.changelog,
    )
  }
}
