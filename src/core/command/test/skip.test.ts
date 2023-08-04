import { createTestSetup } from '@tmplr/jest'

import { StepsRule, ReadRule, IfRule, SkipRule, EvalRule } from '../..'
// import { LocatedError } from '../../../location'
import { Parser } from '../../../parser'
import { Flow } from '@tmplr/core'


describe(SkipRule, () => {
  test('skips current steps.', async () => {
    const file = `
steps:
  - read: x
    eval: hola!

  - skip: steps

  - read: y
    eval: halo!
`

    const { scope, context, log, fs } = createTestSetup({ files: { file }})
    const parser = new Parser(
      [new IfRule, new SkipRule, new ReadRule, new EvalRule, new StepsRule],
      scope, context, fs, log
    )
    const res = await parser.parse('file')

    await res.run(new Flow()).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.has('_.y')).resolves.toBe(false)
  })

  test('skips current recipe.', async () => {
    const file = `
steps:
  - read: x
    eval: hola!

  - steps:
    - read: y1
      eval: ladida

    - skip: steps

    - read: y2
      eval: halo!

  - steps:
    - read: w1
      eval: blabla

    - skip: recipe

    - read: w2
      eval: blublu

  - read: z
    eval: halo!
`

    const { scope, context, log, fs } = createTestSetup({ files: { file }})
    const parser = new Parser(
      [new IfRule, new SkipRule, new ReadRule, new EvalRule, new StepsRule],
      scope, context, fs, log
    )
    const res = await parser.parse('file')

    await res.run(new Flow()).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.has('_.y1')).resolves.toBe(true)
    await expect(scope.vars.has('_.y2')).resolves.toBe(false)
    await expect(scope.vars.has('_.w1')).resolves.toBe(true)
    await expect(scope.vars.has('_.w2')).resolves.toBe(false)
    await expect(scope.vars.has('_.z')).resolves.toBe(false)
  })

  test('throws an error the proper value is not given.', async () => {
    const file = `
skip: self
    `

    const { scope, context, fs, log } = createTestSetup({ files: { file } })
    const parser = new Parser([new SkipRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/skip.*steps.*recipe/)
  })
})
