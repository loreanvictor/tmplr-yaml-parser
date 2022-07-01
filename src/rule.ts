import { Scope, EvaluationContext, FileSystem, ChangeLog, Runnable } from '@tmplr/core'
import { MappedNode } from 'mapped-yaml'

import { LocatedRunnable } from './location'


export interface ParsingContext {
  scope: Scope
  evaluationContext: EvaluationContext
  filesystem: FileSystem
  changelog: ChangeLog
  parse: (node: MappedNode) => LocatedRunnable<any>
}


export abstract class ParsingRule {
  protected abstract resolve(node: MappedNode, context: ParsingContext): Runnable<any>
  abstract applies(node: MappedNode): boolean

  parse(node: MappedNode, context: ParsingContext): LocatedRunnable<any> {
    return new LocatedRunnable(this.resolve(node, context), node.location)
  }
}
