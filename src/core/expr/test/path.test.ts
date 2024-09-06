import { createTestSetup } from '@tmplr/jest'

import { PathRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'


describe(PathRule, () => {
  test('properly parses a path expression.', async () => {
    const file = `
read: x
path: './whatever/{{ stuff.thing }}/xyz.yml'
`

    const { scope, log, fs, context, flow } = createTestSetup({
      files: { file },
      providers: { stuff: { thing: async () => 'blabla' } },
      root: '/home/stuff'
    })

    const parser = new Parser([new ReadRule, new PathRule, new EvalRule], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('/home/stuff/whatever/blabla/xyz.yml')
  })

  test('throws an error when there is a typo in the path field.', async () => {
    const file = `
    read: x
    paht: './whatever/xyz.yml'
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new PathRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/paht.*path/)
  })

  test('throws an error when path field is of wrong type.', async () => {
    const file = `
    read: x
    path: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new PathRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/path.*string/)
  })
})
