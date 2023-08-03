import {
  MappedNode, MappedObject, isStringNode, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'
import { Run } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'
import { LocatedError } from '../../location'
import { hasField, validateField, validateObject, validateOptionalField, validateStringOrObject } from '../../validation'


export type RunNode = MappedObjectWithSchema<{
  run: MappedPrimitive<string> | MappedObject
  with?: MappedObject
  read?: MappedObject
}>


export class RunRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'run')
  }

  override validate(node: RunNode) {
    validateField(node, 'run', validateStringOrObject)
    validateOptionalField(node, 'with', validateObject)
    validateOptionalField(node, 'read', validateObject)


    if (node.object['read']) {
      Object.entries(node.object.read.object).forEach(([_, value]) => {
        if (!isStringNode(value)) {
          throw new LocatedError('read values must be string', value.location)
        }
      })
    }
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
        outputs[key] = value.object
      })
    }

    return new Run(
      target,
      context.parseFile,
      context.filesystem,
      context.scope,
      context.evaluationContext,
      {
        inputs,
        outputs,
        log: context.changelog,
      }
    )
  }
}
