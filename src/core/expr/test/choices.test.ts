import { ChoicesExecution } from '@tmplr/core'
import { createTestSetup } from '@tmplr/jest'
import { pipe, tap, observe } from 'streamlets'

import { ReadRule, ChoicesRule, EvalRule } from '../..'
import { LocatedError } from '../../../location'
import { Parser } from '../../../parser'


describe(ChoicesRule, () => {
  test('parses choices properly.', async () => {
    const file = `
read: msg
prompt: What's the message?
choices:
  - hi: 'hi {{ stuff.name }}'
  - 'hellow {{ stuff.name }}'
  - label: hola
    value: 'hola {{ stuff.name }}'
`

    const { scope, log, fs, context, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          name: async () => 'world'
        }
      }
    })

    const parser = new Parser([
      new ReadRule, new ChoicesRule, new EvalRule,
    ], scope, context, fs, log)

    const res = await parser.parse('file')
    const exec = res.run(flow)

    const setMessage = jest.fn()
    const setChoices = jest.fn()

    pipe(
      exec.tracker,
      tap(trace => {
        const current = trace.peek()

        if (current instanceof ChoicesExecution) {
          current.plug(() => ({
            setMessage,
            setChoices,
            unplug: () => {},
            pick: () => new Promise(resolve => {
              setTimeout(() => resolve(1), 10)
            })
          }))
        }
      }),
      observe
    )

    await exec.execute()

    expect(setMessage).toHaveBeenCalledWith('What\'s the message?')
    expect(setChoices).toHaveBeenCalledWith(['hi', 'hellow world', 'hola'])

    await expect(scope.vars.has('_.msg')).resolves.toBe(true)
    await expect(scope.vars.get('_.msg')).resolves.toBe('hellow world')
  })

  test('throws error when choices are not described properly.', async () => {
    const file1 = `
read: msg
prompt: What's the message?
choices:
  - hi: 'hi {{ stuff.name }}'
  - 'hellow {{ stuff.name }}'
  - label: hola
    value: 'hola {{ stuff.name }}'
`

    const file2 = `
read: msg
prompt: What's the message?
choices:
  - hi: 'hi {{ stuff.name }}'
  - 'hellow {{ stuff.name }}'
  - label: hola
    val: 'hola {{ stuff.name }}'
`

    const file3 = `
read: msg
prompt: What's the message?
choices:
  - hi: 'hi {{ stuff.name }}'
    bye: some other stuff
  - 'hellow {{ stuff.name }}'
  - label: hola
    value: 'hola {{ stuff.name }}'
`

    const { scope, log, fs, context } = createTestSetup({files: { file1, file2, file3 }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(parser.parse('file1')).resolves.toEqual(expect.anything())
    await expect(() => parser.parse('file2')).rejects.toThrow(LocatedError)
    await expect(() => parser.parse('file3')).rejects.toThrow(LocatedError)
  })

  test('throws error when there is no prompt field.', async () => {
    const file = `
read: msg
choices:
  - hi
  - hellow
`

    const { scope, log, fs, context } = createTestSetup({files: { file }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/prompt/)
  })

  test('throws error when the prompt field is mistyped.', async () => {
    const file = `
    read: msg
    prompt: 123
    choices:
      - hi
      - hellow
`

    const { scope, log, fs, context } = createTestSetup({files: { file }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/prompt.*string/)
  })

  test('throws error when prompt field has a typo in it.', async () => {
    const file = `
    read: msg
    propmt: 'What's the message?'
    choices:
      - hi
      - hellow
  `

    const { scope, log, fs, context } = createTestSetup({files: { file }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/propmt.*prompt/)
  })

  test('throws error when choices field is not an array.', async () => {
    const file = `
    read: msg
    prompt: 'What's the message?'
    choices: 123
  `

    const { scope, log, fs, context } = createTestSetup({files: { file }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/choices.*array/)
  })

  test('throws error when choices field has typo.', async () => {
    const file = `
    read: msg
    prompt: 'What's the message?'
    choises:
      - hi
      - hellow
  `

    const { scope, log, fs, context } = createTestSetup({files: { file }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/choises.*choices/)
  })
})
