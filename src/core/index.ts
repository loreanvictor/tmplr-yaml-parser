import { ReadRule, StepsRule, RunRule, UseRule, CopyRule, UpdateRule, RemoveRule, DegitRule, SkipRule } from './command'
import { EvalRule, FromRule, PromptRule, ChoicesRule, PathRule, IfRule } from './expr'


export const STANDARD_RULE_SET = [
  new IfRule(),
  new RunRule(),
  new UseRule('.tmplr.yml'), // TODO: this should be parameterized
  new DegitRule(),
  new CopyRule(),
  new UpdateRule(),
  new RemoveRule(),
  new SkipRule(),

  new ReadRule(),
  // new WhereRule(),
  new EvalRule(),
  new StepsRule(),

  new FromRule(),
  new ChoicesRule(),
  new PromptRule(),
  new PathRule(),
]


export * from './command'
export * from './expr'
