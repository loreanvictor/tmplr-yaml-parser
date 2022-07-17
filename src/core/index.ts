import { ReadRule, IfRule, StepsRule, RunRule } from './command'
import { EvalRule, FromRule, PromptRule, ChoicesRule, PathRule } from './expr'


export const DEFAULT_RULE_SET = [
  new IfRule(),
  new RunRule(),
  new ReadRule(),
  new EvalRule(),
  new StepsRule(),
  new FromRule(),
  new ChoicesRule(),
  new PromptRule(),
  new PathRule(),
]


export { IfRule, ReadRule, FromRule, EvalRule, StepsRule, ChoicesRule, PathRule, PromptRule, RunRule }
