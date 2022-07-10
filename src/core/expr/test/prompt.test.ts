import { PromptExecution } from '@tmplr/core'
import { pipe, tap, observe } from 'streamlets'

import { PromptRule, EvalRule, ReadRule } from '../..'
import { Parser } from '../../../parser'
import { testSetup } from '../../../test/util'


describe(PromptRule, () => {
  test('parses a prompt properly.', async () => {
    jest.useFakeTimers()

    const file = `
read: x
prompt: 'Dear {{ stuff.name }}, what should X be?',
default: "{{ stuff.name }}'s stuff",
`

    const { scope, log, fs, context } = testSetup({
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
    const exec = res.run()

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
              setTimeout(() => resolve('42'), 100)
              jest.advanceTimersByTime(100)
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

    jest.useRealTimers()
  })

  test('parses a prompt without default as well.', async () => {
    jest.useFakeTimers()

    const file = `
read: x
prompt: 'what should X be?',
`

    const { scope, log, fs, context } = testSetup({ files: { file } })

    const parser = new Parser(
      [new ReadRule, new PromptRule, new EvalRule],
      scope, context, fs, log
    )

    const res = await parser.parse('file')
    const exec = res.run()

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
              setTimeout(() => resolve('Hola hola'), 100)
              jest.advanceTimersByTime(100)
            })
          }))
        }
      }),
      observe
    )

    await exec.execute()

    await expect(scope.vars.has('_.x')).resolves.toBe(true)
    await expect(scope.vars.get('_.x')).resolves.toBe('Hola hola')

    jest.useRealTimers()
  })
})
