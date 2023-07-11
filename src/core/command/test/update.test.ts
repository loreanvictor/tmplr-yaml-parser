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

    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

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

    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

    await expect(fs.read('.target')).resolves.toBe('# Hellow YO YO')
  })
})
