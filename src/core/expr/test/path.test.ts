import { PathRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'
import { testSetup } from '../../../test/util'


describe(PathRule, () => {
  test('properly parses a path expression.', async () => {
    const file = `
read: x
path: './whatever/{{ stuff.thing }}/xyz.yml'
`

    const { scope, log, fs, context } = testSetup({
      files: { file },
      providers: { stuff: { thing: async () => 'blabla' } },
      root: '/home/stuff'
    })

    const parser = new Parser([new ReadRule, new PathRule, new EvalRule], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('/home/stuff/whatever/blabla/xyz.yml')
  })
})
