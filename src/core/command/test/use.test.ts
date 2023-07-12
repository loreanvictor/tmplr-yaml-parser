import { createTestSetup } from '@tmplr/jest'

import { UseRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'
import { LocatedError } from '../../../location'


describe(UseRule, () => {
  test('parses a use command.', async () => {
    const { scope, context, log, fs } = createTestSetup({
      files: {
        main: 'use: remote\nread:\n  x: x',
      },
      remotes: {
        remote: {
          recipe: 'read: x\neval: halo!'
        }
      }
    })

    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)
    const cmd = await parser.parse('main')

    await cmd.run().execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('halo!')
  })

  test('also parses input arguments properly.', async () => {
    const { scope, context, log, fs } = createTestSetup({
      files: {
        main: 'use: remote\nrecipe: main\nread:\n  x: x\nwith:\n  greet: "{{ stuff.thing | CONSTANT_CASE }}"',
      },
      remotes: {
        remote: {
          main: 'read: x\neval: "{{ args.greet }} my man!"'
        }
      },
      providers: {
        stuff: {
          thing: async () => 'yo yo'
        }
      }
    })

    const parser = new Parser([new UseRule('--'), new ReadRule, new EvalRule], scope, context, fs, log)
    const cmd = await parser.parse('main')

    await cmd.run().execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('YO_YO my man!')
  })

  test('parser throws error if wrong with arguments are provided.', async () => {
    const { scope, context, log, fs } = createTestSetup({
      files: {
        main: 'use: remote\nread:\n  x:\n    eval: x\nwith:\n  greet: "{{ stuff.thing | CONSTANT_CASE }}"',
      },
      remotes: {
        remote: {
          recipe: 'read: x\neval: "{{ args.greet }} my man!"'
        }
      },
      providers: {
        stuff: {
          thing: async () => 'yo yo'
        }
      }
    })

    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)
    await expect(() => parser.parse('main')).rejects.toThrow(LocatedError)
  })

  test('throws error if use field is of wrong type.', async () => {
    const recipe = `
    use: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/use.*string/)
  })

  test('throws error if recipe field is of wrong type.', async () => {
    const recipe = `
    use: stuff
    recipe: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/recipe.*string/)
  })

  test('throws error if with field is of wrong type.', async () => {
    const recipe = `
    use: stuff
    with: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/with.*object/)
  })

  test('throws error if read field is of wrong type.', async () => {
    const recipe = `
    use: stuff
    read: 123
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/read.*object/)
  })

  test('throws error if use field has typo.', async () => {
    const recipe = `
    us: stuff
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/us.*use/)
  })

  test('throws error if recipe field has typo.', async () => {
    const recipe = `
    use: stuff
    recip: stuff
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/recip.*recipe/)
  })

  test('throws error if with field has typo.', async () => {
    const recipe = `
    use: stuff
    wit:
      x: x
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/wit.*with/)
  })

  test('throws error if read field has typo.', async () => {
    const recipe = `
    use: stuff
    rea:
      x: x
    `

    const { scope, context, log, fs } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new UseRule('recipe'), new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/rea.*read/)
  })
})
