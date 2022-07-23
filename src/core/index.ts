import { ReadRule, IfRule, StepsRule, RunRule, UseRule, CopyRule, UpdateRule, RemoveRule } from './command'
import { EvalRule, FromRule, PromptRule, ChoicesRule, PathRule } from './expr'


export const STANDARD_RULE_SET = [
  new IfRule(),
  new RunRule(),
  new UseRule('.tmplr.yml'),
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


export {
  IfRule, ReadRule, FromRule, EvalRule, StepsRule,
  ChoicesRule, PathRule, PromptRule,
  RunRule, UseRule,
  CopyRule, UpdateRule, RemoveRule,
}
