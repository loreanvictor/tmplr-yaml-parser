import { createTestSetup } from '@tmplr/jest'

import { WhereRule, EvalRule, ReadRule, StepsRule } from '../..'
import { Parser } from '../../../parser'


describe(WhereRule, () => {
  test('calculates where condition is true.', async () => {
    const file = `
steps:
  - read: x
    where: stuff.thing
    eval: halo!
  - read: y
    where: stuff.other_thing
    eval: hello!
  - read: z
    where: stuff.empty
    eval: world!
    else:
      eval: world!!
  - read: w
    where: stuff.whatevs
    eval: jack
    else:
      eval: jill
`
    const { scope, context, log, fs, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hey',
          empty: async () => '',
        }
      }
    })

    const parser = new Parser([ new StepsRule, new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
    await expect(scope.vars.has('_.y')).resolves.toBe(true)
    await expect(scope.vars.get('_.y')).resolves.toBe('')
    await expect(scope.vars.has('_.z')).resolves.toBe(true)
    await expect(scope.vars.get('_.z')).resolves.toBe('world!!')
    await expect(scope.vars.has('_.w')).resolves.toBe(true)
    await expect(scope.vars.get('_.w')).resolves.toBe('jill')
  })

  test('can handle expressions as condition.', async () => {
    const file = `
steps:
  - read: x
    where:
      eval: '{{ stuff.thing }}'
    eval: halo!
  - read: y
    where: stuff.other_thing
    eval: hello!
    else:
      eval: hello!!
  - read: z
    where:
      eval: '{{ stuff.empty }} - yo'
    eval: '{{ stuff.empty }} - world!'
`
    const { scope, context, log, fs, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hey',
          empty: async () => '',
        }
      }
    })

    const parser = new Parser([ new StepsRule, new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
    await expect(scope.vars.has('_.y')).resolves.toBe(true)
    await expect(scope.vars.get('_.y')).resolves.toBe('hello!!')
    await expect(scope.vars.has('_.z')).resolves.toBe(true)
    await expect(scope.vars.get('_.z')).resolves.toBe(' - world!')
  })

  test('throws an error if type of if field is wrong.', async () => {
    const file = `
    read: x
    where: 123
    eval: halo!
    `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })
    const parser = new Parser([ new StepsRule, new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)

    await expect(parser.parse('file')).rejects.toThrow(/where.*string/)
  })

  test('throws an error if type of else field is wrong.', async () => {
    const file = `
    read: x
    where: stuff.thing
    eval: halo!
    else: world
    `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })
    const parser = new Parser([ new StepsRule,  new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)

    await expect(parser.parse('file')).rejects.toThrow(/else.*object/)
  })

  test('throws error if there is a typo in the if field.', async () => {
    const file = `
    read: x
    Where: stuff.thing
    eval: halo!
    `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })
    const parser = new Parser([ new StepsRule, new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)

    await expect(parser.parse('file')).rejects.toThrow(/Where.*where/)
  })

  test('throws error if there is a typo in the else field.', async () => {
    const file = `
    read: x
    where: stuff.thing
    eval: halo!
    Else:
      read: y
      eval: hello!
    `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })
    const parser = new Parser([ new StepsRule, new ReadRule, new WhereRule, new EvalRule ], scope, context, fs, log)

    await expect(parser.parse('file')).rejects.toThrow(/Else.*else/)
  })
})
