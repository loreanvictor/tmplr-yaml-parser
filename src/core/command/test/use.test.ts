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
})
