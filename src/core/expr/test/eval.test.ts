import { createTestSetup } from '@tmplr/jest'

import { EvalRule, ReadRule, StepsRule } from '../..'
import { Parser } from '../../../parser'


describe(EvalRule, () => {
  test('evaluates given value.', async () => {
    const file = `
read: x
eval: halo!
`
    const { scope, context, log, fs, flow } = createTestSetup({
      files: { file },
    })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
  })

  test('accesses proper scope.', async () => {
    const file = `
read: x
eval: 'halo {{ stuff.thing }}!'
`
    const { scope, context, log, fs, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'welt'
        }
      }
    })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo welt!')
  })

  test('executed given steps before hand.', async () => {
    const file = `
    read: x
    eval: '{{ greet }} {{ stuff.thing }}!'
    steps:
      - read: greet
        eval: halo
    `
    const { scope, context, log, fs, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'welt'
        }
      }
    })

    const parser = new Parser([ new ReadRule, new EvalRule, new StepsRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo welt!')
  })

  test('throws an error when steps field is of wrong type.', async () => {
    const file = `
    read: x
    eval: 'halo!'
    steps: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    await expect(() => parser.parse('file')).rejects.toThrow(/steps.*array/)
  })

  test('throws an error when steps field has a typo.', async () => {
    const file = `
    read: x
    eval: '{{greet}}!'
    step:
      - read: greet
        eval: halo
  `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    await expect(() => parser.parse('file')).rejects.toThrow(/step.*steps/)
  })

  test('throws an error when eval field has a typo.', async () => {
    const file = `
    read: x
    evl: '{{greet}}!'
    step:
      - read: greet
        eval: halo
  `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    await expect(() => parser.parse('file')).rejects.toThrow(/evl.*eval/)
  })

  test('throws an error when eval field is of wrong type.', async () => {
    const file = `
    read: x
    eval: 123
    step:
      - read: greet
        eval: halo
  `

    const { scope, context, log, fs } = createTestSetup({ files: { file } })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    await expect(() => parser.parse('file')).rejects.toThrow(/eval.*string/)
  })
})
