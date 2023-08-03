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
    readonly changelog?: ChangeLog,
  ) { }

  async parse(address: string) {
    const content = await this.filesystem.read(address)

    return this.parseString(content, address)
  }

  parseString(content: string, filename = '<runtime>') {
    const node = parse(content, filename)
    const extEvalContext = new EvaluationContext(this.scope.vars, this.evaluationContext.pipes)

    const context: ParsingContext = {
      scope: this.scope,
      evaluationContext: this.evaluationContext,
      extEvalContext,
      filesystem: this.filesystem,
      changelog: this.changelog,
      parseNode: (child: MappedNode) => this.parseNode(child, context),
      parseFile: (
        _content: string,
        _filename: string,
        scope: Scope,
        _context: EvaluationContext,
        filesystem: FileSystem,
        changelog?: ChangeLog,
      ) => {
        return new Parser(this.rules, scope, _context, filesystem, changelog).parseString(_content, _filename)
      }
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
