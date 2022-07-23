import { createTestSetup } from '@tmplr/jest'

import { EvalRule, ReadRule, StepsRule } from '../..'
import { Parser } from '../../../parser'


describe(EvalRule, () => {
  test('evaluates given value.', async () => {
    const file = `
read: x
eval: halo!
`
    const { scope, context, log, fs } = createTestSetup({
      files: { file },
    })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
  })

  test('accesses proper scope.', async () => {
    const file = `
read: x
eval: 'halo {{ stuff.thing }}!'
`
    const { scope, context, log, fs } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'welt'
        }
      }
    })

    const parser = new Parser([ new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

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
    const { scope, context, log, fs } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'welt'
        }
      }
    })

    const parser = new Parser([ new ReadRule, new EvalRule, new StepsRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo welt!')
  })
})
