import { ReadRule, IfRule } from './command'
import { FromRule, ValueRule } from './expr'


export const DEFAULT_RULE_SET = [
  new IfRule(),
  new ReadRule(),
  new FromRule(),
  new ValueRule(),
]


export { IfRule, ReadRule, FromRule, ValueRule }
