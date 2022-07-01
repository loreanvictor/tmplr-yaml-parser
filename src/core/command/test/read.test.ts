import { ChangeLog, EvaluationContext, providerFromFunctions,
  scopeFromProviders, STANDARD_PIPES, FileSystem } from '@tmplr/core'
import { ReadRule, FromRule, ValueRule } from '../..'
import { LocatedError } from '../../../location'
import { Parser } from '../../../parser'


describe(ReadRule, () => {
  test('parses a read command properly.', async () => {
    const scope = scopeFromProviders({
      stuff: providerFromFunctions({
        thing: async () => 'yo'
      })
    }, '_')
    const context = new EvaluationContext(scope, STANDARD_PIPES)
    const log = new ChangeLog()
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'read: whut\nfrom: stuff.thing'),
      write: jest.fn(),
      absolute: jest.fn(_ => _),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '.',
      root: '.',
    }

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, dummyFS, log)
    const res = await parser.parse('whatever')

    await res.run().execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('yo')
  })

  test('parses a read command fallback properly.', async () => {
    const scope = scopeFromProviders({}, '_')
    const context = new EvaluationContext(scope, STANDARD_PIPES)
    const log = new ChangeLog()
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'read: whut\nfrom: stuff.thing\nfallback: wassup'),
      write: jest.fn(),
      absolute: jest.fn(_ => _),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '.',
      root: '.',
    }

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, dummyFS, log)
    const res = await parser.parse('whatever')

    await res.run().execute()

    await expect(scope.vars.has('_.whut')).resolves.toBe(true)
    await expect(scope.vars.get('_.whut')).resolves.toBe('wassup')
  })

  test('isolates error boundaries properly.', async () => {
    const scope = scopeFromProviders({
      stuff: providerFromFunctions({
        thing: async () => {
          throw new Error('screw you for some reason.')
        }
      })
    }, '_')
    const context = new EvaluationContext(scope, STANDARD_PIPES)
    const log = new ChangeLog()
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'read: whut\nfrom: stuff.thing'),
      write: jest.fn(),
      absolute: jest.fn(_ => _),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '.',
      root: '.',
    }

    const parser = new Parser([new ReadRule, new FromRule, new ValueRule], scope, context, dummyFS, log)
    const res = await parser.parse('whatever')

    try {
      await res.run().execute()
      expect(true).toBe(false)
    } catch (err) {
      console.log(err)
      expect(err).toBeInstanceOf(LocatedError)
      expect((err as LocatedError).source()).toEqual({
        0: { content: 'read: whut', surround: false },
        1: { content: 'from: stuff.thing', surround: false }
      })
    }
  })
})
