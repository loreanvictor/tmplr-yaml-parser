import { PromptExecution } from '@tmplr/core'
import { createTestSetup } from '@tmplr/jest'
import { pipe, tap, observe } from 'streamlets'

import { PromptRule, EvalRule, ReadRule } from '../..'
import { Parser } from '../../../parser'


describe(PromptRule, () => {
  test('parses a prompt properly.', async () => {
    const file = `
read: x
prompt: 'Dear {{ stuff.name }}, what should X be?',
default: "{{ stuff.name }}'s stuff",
`

    const { scope, log, fs, context, flow } = createTestSetup({
      files: { file },
      providers: {
        stuff: {
          name: async () => 'Jack'
        }
      }
    })

    const parser = new Parser(
      [new ReadRule, new PromptRule, new EvalRule],
      scope, context, fs, log
    )

    const res = await parser.parse('file')
    const exec = res.run(flow)

    const setMessage = jest.fn()
    const setDefault = jest.fn()

    pipe(
      exec.tracker,
      tap(trace => {
        const current = trace.peek()

        if (current instanceof PromptExecution) {
          current.plug(() => ({
            setMessage,
            setDefault,
            unplug: () => {},
            value: () => new Promise(resolve => {
              setTimeout(() => resolve('42'), 10)
            })
          }))
        }
      }),
      observe
    )

    await exec.execute()

    expect(setMessage).toHaveBeenCalledWith('Dear Jack, what should X be?')
    expect(setDefault).toHaveBeenCalledWith("Jack's stuff")

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('42')
  })

  test('parses a prompt without default as well.', async () => {
    const file = `
read: x
prompt: 'what should X be?',
`

    const { scope, log, fs, context, flow } = createTestSetup({ files: { file } })

    const parser = new Parser(
      [new ReadRule, new PromptRule, new EvalRule],
      scope, context, fs, log
    )

    const res = await parser.parse('file')
    const exec = res.run(flow)

    pipe(
      exec.tracker,
      tap(trace => {
        const current = trace.peek()

        if (current instanceof PromptExecution) {
          current.plug(() => ({
            setMessage: () => {},
            setDefault: () => {},
            unplug: () => {},
            value: () => new Promise(resolve => {
              setTimeout(() => resolve('Hola hola'), 10)
            })
          }))
        }
      }),
      observe
    )

    await exec.execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('Hola hola')
  })

  test('throws an error when there is a typo in the prompt field.', async () => {
    const file = `
    read: x
    promt: 'what should X be?',
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new PromptRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/promt.*prompt/)
  })

  test('throws an error when prompt field is of wrong type.', async () => {
    const file = `
    read: x
    prompt: 123
    `

    const { scope, log, fs, context } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new PromptRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/prompt.*string/)
  })
})
