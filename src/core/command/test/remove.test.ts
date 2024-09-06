import { createTestSetup } from '@tmplr/jest'

import { RemoveRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(RemoveRule, () => {
  test('properly parses remove commands.', async () => {
    const { fs, scope, context, log, flow } = createTestSetup({
      files: {
        recipe: 'remove: "{{ stuff.file }}"',
        target: '# Hellow!'
      },
      providers: {
        stuff: {
          file: async () => 'target',
        }
      }
    })

    await expect(fs.access('target')).resolves.not.toThrow()

    const parser = new Parser(
      [ new ReadRule, new RemoveRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.access('target')).rejects.toThrow()
  })

  test('reads the hidden flag properly as well.', async () => {
    const { fs, scope, context, log, flow } = createTestSetup({
      files: {
        recipe: 'remove: "*"\ninclude hidden: true',
        '.target': '# Hellow!'
      }
    })

    await expect(fs.access('.target')).resolves.not.toThrow()

    const parser = new Parser(
      [ new ReadRule, new RemoveRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.access('.target')).rejects.toThrow()
  })

  test('throws an error if remove field is of wrong type.', async () => {
    const recipe = `
    remove: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RemoveRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/remove.*string/)
  })

  test('throws an error if include hidden field is of wrong type.', async () => {
    const recipe = `
    remove: '*'
    include hidden: yes
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RemoveRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hidden.*boolean/)
  })

  test('throws an error if remove field has a typo.', async () => {
    const recipe = `
    remov: '*'
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RemoveRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/remov.*remove/)
  })

  test('throws an error if include hidden field has a typo.', async () => {
    const recipe = `
    remove: '*'
    include hiden: true
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RemoveRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hiden.*include hidden/)
  })
})
