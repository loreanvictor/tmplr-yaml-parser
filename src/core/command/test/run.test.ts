import { createTestSetup } from '@tmplr/jest'

import { RunRule, ReadRule, EvalRule } from '../../'
import { Parser } from '../../../parser'
import { LocatedError } from '../../../location'
import { Flow } from '@tmplr/core'


describe(RunRule, () => {
  test('parses a run command.', async () => {
    const { scope, context, log, fs } = createTestSetup({
      files: {
        main: 'run: side\nread:\n  x: x',
        side: 'read: x\neval: halo!'
      }
    })

    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)
    const cmd = await parser.parse('main')

    await cmd.run(new Flow()).execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('halo!')
  })

  test('also parses input arguments properly.', async () => {
    const { scope, context, log, fs } = createTestSetup({
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

    await cmd.run(new Flow()).execute()

    expect(scope.vars.has('_.x')).resolves.toBe(true)
    expect(scope.vars.get('_.x')).resolves.toBe('YO_YO my man!')
  })

  test('parser throws error if wrong with arguments are provided.', async () => {
    const { scope, context, log, fs } = createTestSetup({
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

  test('throws error if run field is of wrong type.', async () => {
    const recipe = `
    run: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/run.*string/)
  })

  test('throws error if there is a typo in the run field.', async () => {
    const recipe = `
    runn: side
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/runn.*run/)
  })

  test('throws error if there is a typo in the with field.', async () => {
    const recipe = `
    run: side
    withh:
      greet: "{{ stuff.thing | CONSTANT_CASE }}"
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/withh.*with/)
  })

  test('throws error if there is a typo in the read field.', async () => {
    const recipe = `
    run: side
    readd:
      x: x
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/readd.*read/)
  })

  test('throws error if the with field is of the wrong type.', async () => {
    const recipe = `
    run: side
    with: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/with.*object/)
  })

  test('throws error if the read field is of the wrong type.', async () => {
    const recipe = `
    run: side
    read: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { recipe } })
    const parser = new Parser([new RunRule, new ReadRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('recipe')).rejects.toThrow(/read.*object/)
  })
})
