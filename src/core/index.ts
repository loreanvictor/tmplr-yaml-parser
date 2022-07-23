import { ReadRule, IfRule, StepsRule, RunRule, UseRule, CopyRule, UpdateRule, RemoveRule, DegitRule } from './command'
import { EvalRule, FromRule, PromptRule, ChoicesRule, PathRule } from './expr'


export const STANDARD_RULE_SET = [
  new IfRule(),
  new RunRule(),
  new UseRule('.tmplr.yml'),
  new DegitRule(),
  new CopyRule(),
  new UpdateRule(),
  new RemoveRule(),

  new ReadRule(),
  new EvalRule(),
  new StepsRule(),

  new FromRule(),
  new ChoicesRule(),
  new PromptRule(),
  new PathRule(),
]


export * from './command'
export * from './expr'
