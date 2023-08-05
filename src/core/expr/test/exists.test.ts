import { createTestSetup } from '@tmplr/jest'

import { ExistsRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'
import { Flow } from '@tmplr/core'


describe(ExistsRule, () => {
  test('properly parses exists commands.', async () => {
    const recipe = `
  steps:
    - read: flag
      exists: '{{ stuff.file }}'

    - read: flag2
      exists: '{{ stuff.file }}.txt'
  `

    const { fs, scope, context, log } = createTestSetup({
      files: {
        recipe,
        target: '# Hellow!',
      },
      providers: {
        stuff: {
          file: async () => 'target',
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new EvalRule, new StepsRule, new FromRule, new ExistsRule, ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(new Flow()).execute()

    await expect(scope.vars.has('_.flag')).resolves.toBe(true)
    await expect(scope.vars.get('_.flag')).resolves.toMatch(/target$/)
    await expect(scope.vars.has('_.flag2')).resolves.toBe(true)
    await expect(scope.vars.get('_.flag2')).resolves.toBe('')
  })

  test('properly parses exists commands.', async () => {
    const recipe = `
  steps:
    - read: flag
      exists: '{{ stuff.file }}'

    - read: flag2
      exists: '{{ stuff.file }}'
      include hidden: true
  `

    const { fs, scope, context, log } = createTestSetup({
      files: {
        recipe,
        '.stuff/target': '# Hellow!',
      },
      providers: {
        stuff: {
          file: async () => '**/target',
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new EvalRule, new StepsRule, new FromRule, new ExistsRule, ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(new Flow()).execute()

    await expect(scope.vars.has('_.flag')).resolves.toBe(true)
    await expect(scope.vars.get('_.flag')).resolves.toBe('')
    await expect(scope.vars.has('_.flag2')).resolves.toBe(true)
    await expect(scope.vars.get('_.flag2')).resolves.toMatch(/\.stuff\/target$/)
  })


  test('throws an error if exists field is of wrong type.', async () => {
    const recipe = `
    exists: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new ExistsRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/exists.*string/)
  })

  test('throws an error if include hidden field is of wrong type.', async () => {
    const recipe = `
    exists: '*'
    include hidden: yes
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new ExistsRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hidden.*boolean/)
  })

  test('throws an error if exists field has a typo.', async () => {
    const recipe = `
    exist: '*'
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new ExistsRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/exist.*exists/)
  })

  test('throws an error if include hidden field has a typo.', async () => {
    const recipe = `
    exists: '*'
    include hiden: true
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new ExistsRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hiden.*include hidden/)
  })
})
