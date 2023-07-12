import {
  MappedNode, MappedObject, isStringNode, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'
import { Use, Value } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'
import { LocatedError } from '../../location'
import { hasField, validateField, validateObject, validateOptionalField, validateStringOrObject } from '../../validation'


export type UseNode = MappedObjectWithSchema<{
  use: MappedPrimitive<string> | MappedObject
  recipe?: MappedPrimitive<string> | MappedObject
  with?: MappedObject
  read?: MappedObject
}>


export class UseRule extends ParsingRule {
  constructor(
    readonly defaultRecipe: string,
  ) { super() }

  applies(node: MappedNode) {
    return hasField(node, 'use')
  }

  override validate(node: UseNode) {
    validateField(node, 'use', validateStringOrObject)
    validateOptionalField(node, 'recipe', validateStringOrObject)
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

  resolve(node: UseNode, context: ParsingContext): Use {
    const inputs = {}
    const outputs = {}

    const target = context.parseNode(node.object.use)
    const recipe = node.object.recipe ? context.parseNode(node.object.recipe) : new Value(this.defaultRecipe)

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

    return new Use(
      target,
      recipe,
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
