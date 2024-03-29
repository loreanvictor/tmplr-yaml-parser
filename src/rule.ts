import { Scope, EvaluationContext, FileSystem, ChangeLog, Runnable, ParseFn } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { LocatedRunnable } from './location'


export interface ParsingContext {
  scope: Scope
  evaluationContext: EvaluationContext
  extEvalContext: EvaluationContext,
  filesystem: FileSystem
  changelog?: ChangeLog
  parseNode: (node: MappedNode) => LocatedRunnable<any>
  parseFile: ParseFn,
}


export abstract class ParsingRule {
  protected abstract resolve(node: MappedNode, context: ParsingContext): Runnable<any>
  abstract applies(node: MappedNode): boolean

  validate(_: MappedNode) {
    // Nothing particular, maybe children will override this
  }

  parse(node: MappedNode, context: ParsingContext): LocatedRunnable<any> {
    this.validate(node)

    return new LocatedRunnable(this.resolve(node, context), node.location)
  }
}
