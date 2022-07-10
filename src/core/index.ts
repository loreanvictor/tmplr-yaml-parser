import { ReadRule, IfRule, StepsRule } from './command'
import { EvalRule, FromRule, PromptRule, ChoicesRule, PathRule } from './expr'


export const DEFAULT_RULE_SET = [
  new IfRule(),
  new ReadRule(),
  new EvalRule(),
  new StepsRule(),
  new FromRule(),
  new ChoicesRule(),
  new PromptRule(),
  new PathRule(),
  // new ValueRule(),
]


export { IfRule, ReadRule, FromRule, EvalRule, StepsRule, ChoicesRule, PathRule, PromptRule }
