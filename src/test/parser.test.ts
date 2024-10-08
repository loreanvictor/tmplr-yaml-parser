import { createTestSetup } from '@tmplr/jest'

import { Parser } from '../parser'
import { EvalRule, ReadRule, StepsRule, FromRule } from '../core'


describe(Parser, () => {
  test('properly parses given file.', async () => {
    const file = `
steps:
  - read: x
    from: stuff.thing

  - read: y
    eval: 'hellow {{ stuff.other_thing | UPPERCASE }}'
`

    const { scope, fs, log, context, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hello',
          other_thing: async () => 'world',
        }
      }
    })

    const parser = new Parser([
      new ReadRule,
      new StepsRule,
      new FromRule,
      new EvalRule,
    ], scope, context, fs, log)

    const result = await parser.parse('file')
    await result.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('hello')
    await expect(scope.vars.has('_.y')).resolves.toBe(true)
    await expect(scope.vars.get('_.y')).resolves.toBe('hellow WORLD')
  })

  test('can parse strings directly.', async () => {
    const file = `
steps:
  - read: x
    from: stuff.thing

  - read: y
    eval: 'hellow {{ stuff.other_thing | UPPERCASE }}'
`

    const { scope, fs, log, context, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hello',
          other_thing: async () => 'world',
        }
      }
    })

    const parser = new Parser([
      new ReadRule,
      new StepsRule,
      new FromRule,
      new EvalRule,
    ], scope, context, fs, log)

    const result = await parser.parseString(file)
    await result.run(flow).execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('hello')
    await expect(scope.vars.has('_.y')).resolves.toBe(true)
    await expect(scope.vars.get('_.y')).resolves.toBe('hellow WORLD')

    expect(result.location.file.name).toBe('<runtime>')
  })

  test('throws error when expected rule does not exist.', async () => {
    const file = `
steps:
  - read: x
    from: stuff.thing

  - read: y
    eval: 'hellow {{ stuff.other_thing | UPPERCASE }}'
`

    const { scope, fs, log, context } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hello',
          other_thing: async () => 'world',
        }
      }
    })

    const parser = new Parser([
      new ReadRule,
      new StepsRule,
      new EvalRule,
    ], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow()
  })
})
