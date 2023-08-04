import { MappedNode, MappedObjectWithSchema, MappedPrimitive } from 'mapped-yaml'
import { Skip } from '@tmplr/core'

import { ParsingRule } from '../../rule'
import { hasField, validateEnum, validateField } from '../../validation'


export type SkipNode = MappedObjectWithSchema<{
  skip: MappedPrimitive<string>
}>


export class SkipRule extends ParsingRule {
  applies(node: MappedNode) {
    return hasField(node, 'skip')
  }

  override validate(node: MappedNode) {
    validateField(node, 'skip', validateEnum('steps', 'recipe'))
  }

  resolve(node: SkipNode): Skip {
    const cascade = node.object.skip.object

    return new Skip({ cascade: cascade === 'recipe' })
  }
}
