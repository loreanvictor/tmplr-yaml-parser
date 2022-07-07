import { ReadRule, IfRule, StepsRule } from './command'
import { EvalRule, FromRule, ValueRule } from './expr'


export const DEFAULT_RULE_SET = [
  new IfRule(),
  new ReadRule(),
  new EvalRule(),
  new StepsRule(),
  new FromRule(),
  new ValueRule(),
]


export { IfRule, ReadRule, FromRule, ValueRule, EvalRule, StepsRule }
