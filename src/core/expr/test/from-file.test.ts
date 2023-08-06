import { createTestSetup } from '@tmplr/jest'

import { FromFileRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'
import { Flow } from '@tmplr/core'


describe(FromFileRule, () => {
  test('properly parses a from file expression.', async () => {
    const file = `
read: x
from file: whatevs.txt
`

    const { scope, log, fs, context } = createTestSetup({
      files: {
        file,
        'whatevs.txt': 'blabla'
      }
    })

    const parser = new Parser([new ReadRule, new EvalRule, new FromFileRule], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(new Flow()).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('blabla')
  })

  test('throws an error when there is a typo in the field.', async () => {
    const file = `
    read: x
    from fil: './whatever/xyz.yml'
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new EvalRule, new FromFileRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/from\sfil.*from\sfile/)
  })

  test('throws an error when path field is of wrong type.', async () => {
    const file = `
    read: x
    from file: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new EvalRule, new FromFileRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/from\sfile.*string/)
  })
})
