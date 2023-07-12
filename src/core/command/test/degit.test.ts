import { createTestSetup } from '@tmplr/jest'

import { DegitRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(DegitRule, () => {
  test('properly parses copy commands.', async () => {

    const { fs, scope, context, log } = createTestSetup({
      files: {
        recipe: 'degit: source\nto: target',
      },
      remotes: {
        source: {
          file: 'Hola!'
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new DegitRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )
    const cmd = await parser.parse('recipe')
    await cmd.run().execute()

    await expect(fs.read('target/file')).resolves.toBe('Hola!')
  })

  test('throws an error if degit field is of wrong type.', async () => {
    const recipe = `
    degit: 123
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new DegitRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/degit.*string/)
  })

  test('throws an error if to field is of wrong type.', async () => {
    const recipe = `
    degit: '*'
    to: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new DegitRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/to.*string/)
  })

  test('throws an error if degit field has a typo.', async () => {
    const recipe = `
    degti: '*'
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new DegitRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/degti.*degit/)
  })

  test('throws an error if to field has a typo.', async () => {
    const recipe = `
    degit: '*'
    too: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new DegitRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/too.*to/)
  })
})
