import { testSetup } from '../../../test/util'
import { RunRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'
import { LocatedError } from '../../../location'


describe(RunRule, () => {
  test('parses a run command.', async () => {
    const { scope, context, log, fs } = testSetup({
      files: {
        main: 'run: side\nread:\n  x: x',
        side: 'read: x\neval: halo!'
      }
    })

    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)
    const cmd = await parser.parse('main')

    await cmd.run().execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('halo!')
  })

  test('also parses input arguments properly.', async () => {
    const { scope, context, log, fs } = testSetup({
      files: {
        main: 'run: side\nread:\n  x: x\nwith:\n  greet: "{{ stuff.thing | CONSTANT_CASE }}"',
        side: 'read: x\neval: "{{ args.greet }} my man!"'
      },
      providers: {
        stuff: {
          thing: async () => 'yo yo'
        }
      }
    })

    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)
    const cmd = await parser.parse('main')

    await cmd.run().execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('YO_YO my man!')
  })

  test('parser throws error if wrong with arguments are provided.', async () => {
    const { scope, context, log, fs } = testSetup({
      files: {
        main: 'run: side\nread:\n  x:\n    eval: x\nwith:\n  greet: "{{ stuff.thing | CONSTANT_CASE }}"',
        side: 'read: x\neval: "{{ args.greet }} my man!"'
      },
      providers: {
        stuff: {
          thing: async () => 'yo yo'
        }
      }
    })

    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)
    await expect(() => parser.parse('main')).rejects.toThrow(LocatedError)
  })
})
