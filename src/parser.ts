import { EvaluationContext, Scope, FileSystem, ChangeLog } from '@tmplr/core'
import { MappedNode, parse } from 'mapped-yaml'
import { LocatedError } from './location'

import { ParsingContext, ParsingRule } from './rule'


export class Parser {
  constructor(
    readonly rules: ParsingRule[],
    readonly scope: Scope,
    readonly evaluationContext: EvaluationContext,
    readonly filesystem: FileSystem,
    readonly changelog: ChangeLog,
  ) { }

  async parse(address: string) {
    const content = await this.filesystem.read(address)

    return this.parseString(content, address)
  }

  parseString(content: string, filename = '<runtime>') {
    const node = parse(content, filename)

    const context: ParsingContext = {
      scope: this.scope,
      evaluationContext: this.evaluationContext,
      filesystem: this.filesystem,
      changelog: this.changelog,
      parse: (child: MappedNode) => this.parseNode(child, context),
    }

    return this.parseNode(node, context)
  }

  parseNode(node: MappedNode, context: ParsingContext) {
    for (const rule of this.rules) {
      if (rule.applies(node)) {
        return rule.parse(node, context)
      }
    }

    throw new LocatedError(new Error('No rule found for node.'), node.location)
  }
}
