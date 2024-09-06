import { createTestSetup } from '@tmplr/jest'

import { WriteRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(WriteRule, () => {
  test('properly parses copy commands.', async () => {
    const recipe = `
steps:
  - read: x
    from: stuff.var
  - write: '{{ x | UPPERCASE }} mate!'
    to: '{{ stuff.newfile }}'
`

    const { fs, scope, context, log, flow } = createTestSetup({
      files: { recipe },
      providers: {
        stuff: {
          newfile: async () => 'target',
          var: async () => 'Yo yo',
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new WriteRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )
    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.read('target')).resolves.toBe('YO YO mate!')
  })

  test('throws an error if copy field is of wrong type.', async () => {
    const recipe = `
    write: 123
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new WriteRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/write.*string/)
  })

  test('throws an error if to field is of wrong type.', async () => {
    const recipe = `
    write: '*'
    to: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new WriteRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/to.*string/)
  })

  test('throws an error if write field has a typo.', async () => {
    const recipe = `
    writt: '*'
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new WriteRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/writt.*write/)
  })

  test('throws an error if to field has a typo.', async () => {
    const recipe = `
    write: '*'
    too: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new WriteRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/too.*to/)
  })
})
