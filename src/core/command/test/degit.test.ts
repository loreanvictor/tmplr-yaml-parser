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
})
