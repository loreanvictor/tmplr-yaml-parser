import {
  MappedNode, MappedObject, isObjectNode, isStringNode, MappedObjectWithSchema, MappedPrimitive
} from 'mapped-yaml'
import { Use, Value } from '@tmplr/core'

import { ParsingContext, ParsingRule } from '../../rule'
import { LocatedError } from '../../location'


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

  applies(node: MappedNode): boolean {
    return isObjectNode(node)
      && !!node.object['use']
      && (isObjectNode(node.object['use']) || isStringNode(node.object['use']))
      && (!node.object['recipe'] || isObjectNode(node.object['recipe']) || isStringNode(node.object['recipe']))
      && (!node.object['with'] || isObjectNode(node.object['with']))
      && (!node.object['read'] || isObjectNode(node.object['read']))
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
        if (!isStringNode(value)) {
          throw new LocatedError('read value must be a string', value.location)
        }

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
