import { ChoicesExecution } from '@tmplr/core'
import { pipe, tap, observe } from 'streamlets'

import { ReadRule, ChoicesRule, EvalRule } from '../..'
import { Parser } from '../../../parser'
import { LocatedExecution } from '../../../location'
import { testSetup } from '../../../test/util'


describe(ChoicesRule, () => {
  test('parses choices properly.', async () => {
    jest.useFakeTimers()

    const file = `
read: msg
prompt: What's the message?
choices:
  - hi: 'hi {{ stuff.name }}'
  - 'hellow {{ stuff.name }}'
  - label: hola
    value: 'hola {{ stuff.name }}'
`

    const { scope, log, fs, context } = testSetup({
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
    const exec = res.run()

    const setMessage = jest.fn()
    const setChoices = jest.fn()

    pipe(
      exec.tracker,
      tap(trace => {
        const peek = trace.peek()
        const current = peek instanceof LocatedExecution ? peek.proxy : peek

        if (current instanceof ChoicesExecution) {
          current.plug(() => ({
            setMessage,
            setChoices,
            unplug: () => {},
            pick: () => new Promise(resolve => {
              setTimeout(() => resolve(1), 100)
              jest.advanceTimersByTime(100)
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

    jest.useRealTimers()
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

    const { scope, log, fs, context } = testSetup({files: { file1, file2, file3 }})
    const parser = new Parser([new ReadRule, new ChoicesRule, new EvalRule], scope, context, fs, log)

    await expect(parser.parse('file1')).resolves.toEqual(expect.anything())
    await expect(() => parser.parse('file2')).rejects.toThrow()
    await expect(() => parser.parse('file3')).rejects.toThrow()
  })
})
