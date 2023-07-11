import { createTestSetup } from '@tmplr/jest'

import { RemoveRule, StepsRule, ReadRule, EvalRule, FromRule } from '../..'
import { Parser } from '../../../parser'


describe(RemoveRule, () => {
  test('properly parses remove commands.', async () => {
    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

    await expect(fs.access('target')).rejects.toThrow()
  })

  test('reads the hidden flag properly as well.', async () => {
    const { fs, scope, context, log } = createTestSetup({
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
    await cmd.run().execute()

    await expect(fs.access('.target')).rejects.toThrow()
  })
})
