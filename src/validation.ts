import { distance, closest } from 'fastest-levenshtein'
import { MappedNode, isObjectNode, isArrayNode, isBooleanNode, isStringNode } from 'mapped-yaml'
import { LocatedError } from './location'


const isTypo = (actual: string, expected: string) => distance(actual, expected) <= Math.min(2, expected.length - 1)


export function hasField(node: MappedNode, field: string, strict = false): boolean {
  if (strict) {
    return isObjectNode(node) && !!node.object[field]
  } else {
    if (!isObjectNode(node)) {
      return false
    }

    if (node.object[field]) {
      return true
    }

    return Object.keys(node.object).some(key => isTypo(key, field))
  }
}


export function validateBoolean(node: MappedNode) {
  if (!isBooleanNode(node)) {
    throw new LocatedError('should be a boolean', node.location)
  }
}


export function validateString(node: MappedNode) {
  if (!isStringNode(node)) {
    throw new LocatedError('should be a string', node.location)
  }
}


export function validateArray(node: MappedNode) {
  if (!isArrayNode(node)) {
    throw new LocatedError('should be an array', node.location)
  }
}


export function validateObject(node: MappedNode) {
  if (!isObjectNode(node)) {
    throw new LocatedError('should be an object', node.location)
  }
}


export function validateStringOrObject(node: MappedNode) {
  if (!isStringNode(node) && !isObjectNode(node)) {
    throw new LocatedError('should be a string or an object', node.location)
  }
}


export function validateFieldSpelling(node: MappedNode, field: string) {
  if (!hasField(node, field, true)) {
    const candidate = closest(field, Object.keys(node.object))

    throw new LocatedError(`"${candidate}" seems to be a mistake, did you mean "${field}"?`, node.location)
  }
}


function _validateField(
  node: MappedNode,
  field: string,
  validate: (child: MappedNode) => void,
) {
  validateFieldSpelling(node, field)

  try {
    validate(node.object[field])
  } catch (error) {
    throw new LocatedError(`"${field}" is invalid: ` + (error as Error).message, node.location)
  }
}


export function validateField(
  node: MappedNode,
  field: string,
  validate: (child: MappedNode) => void
) {
  if (!hasField(node, field)) {
    throw new LocatedError(`"${field}" is required`, node.location)
  }

  _validateField(node, field, validate)
}


export function validateOptionalField(
  node: MappedNode,
  field: string,
  validate: (child: MappedNode) => void
) {
  if (hasField(node, field)) {
    _validateField(node, field, validate)
  }
}
