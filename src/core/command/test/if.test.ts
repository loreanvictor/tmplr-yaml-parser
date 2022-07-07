import { IfRule, EvalRule, ReadRule, StepsRule } from '../..'
import { Parser } from '../../../parser'
import { testSetup } from '../../../test/util'


describe(IfRule, () => {
  test('runs if condition is true.', async () => {
    const file = `
steps:
  - if: stuff.thing
    read: x
    eval: halo!
  - if: stuff.other_thing
    read: y
    eval: hello!
  - if: stuff.empty
    read: z
    eval: world!
`
    const { scope, context, log, fs } = testSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hey',
          empty: async () => '',
        }
      }
    })

    const parser = new Parser([ new StepsRule, new IfRule, new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
    await expect(scope.vars.has('_.y')).resolves.toBe(false)
    await expect(scope.vars.has('_.z')).resolves.toBe(false)
  })

  test('runs else if condition is false.', async () => {
    const file = `
steps:
  - if: stuff.thing
    read: x
    eval: halo!
    else:
      read: y
      eval: hello!
  - if: stuff.empty
    read: z
    eval: world!
    else:
      read: w
      eval: world!!
`

    const { scope, context, log, fs } = testSetup({
      files: { file },
      providers: {
        stuff: {
          empty: async () => '',
        }
      }
    })

    const parser = new Parser([ new StepsRule, new IfRule, new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(false)
    await expect(scope.vars.has('_.y')).resolves.toBe(true)
    await expect(scope.vars.get('_.y')).resolves.toBe('hello!')
    await expect(scope.vars.has('_.z')).resolves.toBe(false)
    await expect(scope.vars.has('_.w')).resolves.toBe(true)
    await expect(scope.vars.get('_.w')).resolves.toBe('world!!')
  })

  test('can handle expressions as condition.', async () => {
    const file = `
steps:
  - if:
      eval: '{{ stuff.thing }}'
    read: x
    eval: halo!
  - if: stuff.other_thing
    read: y
    eval: hello!
  - if:
      eval: '{{ stuff.empty }} - yo'
    read: z
    eval: '{{ stuff.empty }} - world!'
`
    const { scope, context, log, fs } = testSetup({
      files: { file },
      providers: {
        stuff: {
          thing: async () => 'hey',
          empty: async () => '',
        }
      }
    })

    const parser = new Parser([ new StepsRule, new IfRule, new ReadRule, new EvalRule ], scope, context, fs, log)
    const res = await parser.parse('file')

    await res.run().execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('halo!')
    await expect(scope.vars.has('_.y')).resolves.toBe(false)
    await expect(scope.vars.has('_.z')).resolves.toBe(true)
    await expect(scope.vars.get('_.z')).resolves.toBe(' - world!')
  })
})
