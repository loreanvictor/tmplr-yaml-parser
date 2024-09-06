import { createTestSetup } from '@tmplr/jest'

import { UpdateRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(UpdateRule, () => {
  test('properly parses update commands.', async () => {
    const recipe = `
steps:
  - read: x
    from: stuff.var
  - update: "{{ stuff.file }}"
`

    const { fs, scope, context, log, flow} = createTestSetup({
      files: {
        recipe,
        target: '# Hellow {{ _.x | UPPERCASE }}'
      },
      providers: {
        stuff: {
          file: async () => 'target',
          var: async () => 'Yo yo',
        }
      }
    })

    await expect(fs.read('target')).resolves.toBe('# Hellow {{ _.x | UPPERCASE }}')

    const parser = new Parser(
      [ new ReadRule, new UpdateRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.read('target')).resolves.toBe('# Hellow YO YO')
  })

  test('reads the hidden flag properly as well.', async () => {
    const recipe = `
steps:
  - read: x
    from: stuff.var
  - update: '*'
    include hidden: true
`

    const { fs, scope, context, log, flow } = createTestSetup({
      files: {
        recipe,
        '.target': '# Hellow {{ _.x | UPPERCASE }}'
      },
      providers: {
        stuff: {
          var: async () => 'Yo yo',
        }
      }
    })

    await expect(fs.read('.target')).resolves.toBe('# Hellow {{ _.x | UPPERCASE }}')

    const parser = new Parser(
      [ new ReadRule, new UpdateRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )

    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.read('.target')).resolves.toBe('# Hellow YO YO')
  })

  test('throws an error if update field is of wrong type.', async () => {
    const recipe = `
    update: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UpdateRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/update.*string/)
  })

  test('throws an error if there is a typo in the update field.', async () => {
    const recipe = `
    updat: '*'
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UpdateRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/updat.*update/)
  })

  test('throws an error if there is a typo in the include hidden field.', async () => {
    const recipe = `
    update: '*'
    include hiddn: true
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UpdateRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/hiddn.*hidden/)
  })

  test('throws an error if include hidden field is of wrong type.', async () => {
    const recipe = `
    update: '*'
    include hidden: yes
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UpdateRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/hidden.*boolean/)
  })
})
