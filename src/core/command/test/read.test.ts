import { createTestSetup } from '@tmplr/jest'

import { ReadRule, FromRule, EvalRule } from '../..'
import { LocatedError } from '../../../location'
import { Parser } from '../../../parser'
import { Flow } from '@tmplr/core'


describe(ReadRule, () => {
  test('parses a read command properly.', async () => {
    const { scope, context, log, fs } = createTestSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing'
      },
      providers: {
        stuff: {
          thing: async () => 'yo'
        }
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new EvalRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    await res.run(new Flow()).execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('yo')
  })

  test('parses a read command fallback properly.', async () => {
    const { scope, context, fs, log } = createTestSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing\nfallback: wassup'
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new EvalRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    await res.run(new Flow()).execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('wassup')
  })

  test('isolates error boundaries properly.', async () => {
    const { scope, context, fs, log } = createTestSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing'
      },
      providers: {
        stuff: {
          thing: async () => { throw new Error('screw you for some reason') }
        }
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new EvalRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    try {
      await res.run(new Flow()).execute()
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toBeInstanceOf(LocatedError)
      expect((err as LocatedError).source()).toEqual({
        0: { content: 'read: whut', surround: false },
        1: { content: 'from: stuff.thing', surround: false }
      })
    }
  })

  test('throws an error if the read field is of the wrong type.', async () => {
    const file = `
    read:
      eval: xx
    eval: halo
    `

    const { scope, context, fs, log } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new FromRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/read.*string/)
  })

  test('throws an error if there is a typo in the read field.', async () => {
    const file = `
    reed: xx
    eval: halo
    `

    const { scope, context, fs, log } = createTestSetup({ files: { file } })
    const parser = new Parser([new ReadRule, new FromRule, new EvalRule], scope, context, fs, log)

    await expect(() => parser.parse('file')).rejects.toThrow(/reed.*read/)
  })
})
