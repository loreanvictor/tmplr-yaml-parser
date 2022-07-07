import { ReadRule, FromRule, ValueRule } from '../..'
import { LocatedError } from '../../../location'
import { Parser } from '../../../parser'
import { testSetup } from '../../../test/util'


describe(ReadRule, () => {
  test('parses a read command properly.', async () => {
    const { scope, context, log, fs } = testSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing'
      },
      providers: {
        stuff: {
          thing: async () => 'yo'
        }
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    await res.run().execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('yo')
  })

  test('parses a read command fallback properly.', async () => {
    const { scope, context, fs, log } = testSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing\nfallback: wassup'
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    await res.run().execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('wassup')
  })

  test('isolates error boundaries properly.', async () => {
    const { scope, context, fs, log } = testSetup({
      files: {
        whatever: 'read: whut\nfrom: stuff.thing'
      },
      providers: {
        stuff: {
          thing: async () => { throw new Error('screw you for some reason') }
        }
      }
    })

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, fs, log)
    const res = await parser.parse('whatever')

    try {
      await res.run().execute()
      expect(true).toBe(false)
    } catch (err) {
      expect(err).toBeInstanceOf(LocatedError)
      expect((err as LocatedError).source()).toEqual({
        0: { content: 'read: whut', surround: false },
        1: { content: 'from: stuff.thing', surround: false }
      })
    }
  })
})
