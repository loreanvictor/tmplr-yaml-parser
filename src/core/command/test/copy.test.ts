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

    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

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

    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

    await expect(fs.read('target/.source')).resolves.toBe('# Hellow YO YO')
    await expect(fs.read('.source')).resolves.toBe('# Hellow {{ _.x | UPPERCASE }}')
  })
})
