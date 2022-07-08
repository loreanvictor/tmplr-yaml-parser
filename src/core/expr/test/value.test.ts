import { ValueRule } from '../value'


describe(ValueRule, () => {
  test('reads strings.', async () => {
    const rule = new ValueRule()
    const node = { object: 'foo', location: undefined as any }

    expect(rule.applies(node)).toBe(true)
    const value = await rule.resolve(node, undefined as any)
    await expect(value.run().execute()).resolves.toBe('foo')
  })

  test('reads numbers.', async () => {
    const rule = new ValueRule()
    const node = { object: 42, location: undefined as any }

    expect(rule.applies(node)).toBe(true)
    const value = await rule.resolve(node, undefined as any)
    await expect(value.run().execute()).resolves.toBe('42')
  })

  test('reads booleans.', async () => {
    const rule = new ValueRule()
    const node = { object: false, location: undefined as any }

    expect(rule.applies(node)).toBe(true)
    const value = await rule.resolve(node, undefined as any)
    await expect(value.run().execute()).resolves.toBe('false')
  })
})
