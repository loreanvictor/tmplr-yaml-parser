import { createTestSetup } from '@tmplr/jest'

import { CopyRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(CopyRule, () => {
  test('properly parses copy commands.', async () => {
    const recipe = `
steps:
  - read: x
    from: stuff.var
  - copy: source
    to: '{{ stuff.newfile }}'
`

    const { fs, scope, context, log, flow } = createTestSetup({
      files: {
        recipe,
        source: '# Hellow {{ _.x | UPPERCASE }}'
      },
      providers: {
        stuff: {
          newfile: async () => 'target',
          var: async () => 'Yo yo',
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new CopyRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )
    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.read('target')).resolves.toBe('# Hellow YO YO')
    await expect(fs.read('source')).resolves.toBe('# Hellow {{ _.x | UPPERCASE }}')
  })

  test('properly handles hidden flag as well.', async () => {
    const recipe = `
steps:
  - read: x
    from: stuff.var
  - copy: '*'
    to: '{{ stuff.newfile }}'
    include hidden: true
`

    const { fs, scope, context, log, flow } = createTestSetup({
      files: {
        recipe,
        '.source': '# Hellow {{ _.x | UPPERCASE }}'
      },
      providers: {
        stuff: {
          newfile: async () => 'target',
          var: async () => 'Yo yo',
        }
      }
    })

    const parser = new Parser(
      [ new ReadRule, new CopyRule, new EvalRule, new StepsRule, new FromRule ],
      scope, context, fs, log
    )
    const cmd = await parser.parse('recipe')
    await cmd.run(flow).execute()

    await expect(fs.read('target/.source')).resolves.toBe('# Hellow YO YO')
    await expect(fs.read('.source')).resolves.toBe('# Hellow {{ _.x | UPPERCASE }}')
  })

  test('throws an error if copy field is of wrong type.', async () => {
    const recipe = `
    copy: 123
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/copy.*string/)
  })

  test('throws an error if to field is of wrong type.', async () => {
    const recipe = `
    copy: '*'
    to: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/to.*string/)
  })

  test('throws an error if include hidden field is of wrong type.', async () => {
    const recipe = `
    copy: '*'
    to: here
    include hidden: yes
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hidden.*boolean/)
  })

  test('throws an error if copy field has a typo.', async () => {
    const recipe = `
    copi: '*'
    to: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/copi.*copy/)
  })

  test('throws an error if to field has a typo.', async () => {
    const recipe = `
    copy: '*'
    too: here
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/too.*to/)
  })

  test('throws an error if include hidden field has a typo.', async () => {
    const recipe = `
    copy: '*'
    to: here
    include hiddn: true
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new CopyRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/include hiddn.*include hidden/)
  })
})
