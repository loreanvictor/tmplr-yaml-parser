import {
  LocatedError, LocatedExecution, LocatedRunnable,
  ParsingContext, ParsingRule, Parser,
  IfNode, IfRule, CopyNode, CopyRule, DegitNode, DegitRule, ReadNode, ReadRule, RemoveNode, RemoveRule, RunNode, RunRule, StepsNode, StepsRule, UpdateNode, UpdateRule, UseNode, UseRule, EvalNode, EvalRule, FromNode, FromRule, PromptNode, PromptRule, ChoicesNode, ChoicesRule, PathNode, PathRule,
} from '../index'


test('everything is properly exported.', () => {
  expect(LocatedError).toBeDefined()
  expect(LocatedExecution).toBeDefined()
  expect(LocatedRunnable).toBeDefined()
  expect(<ParsingContext>{}).toBeDefined()
  expect(ParsingRule).toBeDefined()
  expect(Parser).toBeDefined()
  expect(<IfNode>{}).toBeDefined()
  expect(IfRule).toBeDefined()
  expect(<CopyNode>{}).toBeDefined()
  expect(CopyRule).toBeDefined()
  expect(<DegitNode>{}).toBeDefined()
  expect(DegitRule).toBeDefined()
  expect(<ReadNode>{}).toBeDefined()
  expect(ReadRule).toBeDefined()
  expect(<RemoveNode>{}).toBeDefined()
  expect(RemoveRule).toBeDefined()
  expect(<RunNode>{}).toBeDefined()
  expect(RunRule).toBeDefined()
  expect(<StepsNode>{}).toBeDefined()
  expect(StepsRule).toBeDefined()
  expect(<UpdateNode>{}).toBeDefined()
  expect(UpdateRule).toBeDefined()
  expect(<UseNode>{}).toBeDefined()
  expect(UseRule).toBeDefined()
  expect(<EvalNode>{}).toBeDefined()
  expect(EvalRule).toBeDefined()
  expect(<FromNode>{}).toBeDefined()
  expect(FromRule).toBeDefined()
  expect(<PromptNode>{}).toBeDefined()
  expect(PromptRule).toBeDefined()
  expect(<ChoicesNode>{}).toBeDefined()
  expect(ChoicesRule).toBeDefined()
  expect(<PathNode>{}).toBeDefined()
  expect(PathRule).toBeDefined()
})