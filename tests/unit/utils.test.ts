import { afterEach, describe, expect, it, vi } from 'vitest'
import { debounce, deepClone, parseTime, param, param2Obj, regEmail, regMobile } from '@/utils'

afterEach(() => vi.useRealTimers())
describe('typed utility contracts', () => {
  it('formats second and millisecond timestamps consistently and handles missing dates', () => {
    expect(parseTime(1700000000)).toBe(parseTime(1700000000000))
    expect(parseTime('1700000000')).toBe(parseTime(1700000000000))
    expect(parseTime(null)).toBe('')
    expect(parseTime('invalid-date')).toBe('')
    expect(parseTime(new Date(2026, 0, 4), '{y}-{m}-{d} {a}')).toBe('2026-01-04 日')
  })
  it('round trips encoded query values and omits undefined filters', () => {
    const query = param({ name: '研发 & A+B', enabled: false, missing: undefined })
    expect(param2Obj('/api?' + query)).toEqual({ name: '研发 & A+B', enabled: 'false' })
  })
  it('debounces to the latest arguments while preserving the receiver', () => {
    vi.useFakeTimers()
    const calls: string[] = []
    const receiver = { prefix: 'value:', run: debounce(function(this: { prefix: string }, value: string) { calls.push(this.prefix + value) }, 50) }
    receiver.run('first'); receiver.run('last')
    vi.advanceTimersByTime(50)
    expect(calls).toEqual(['value:last'])
  })
  it('isolates nested form values and dates when cloning', () => {
    const source = { roles: [{ id: 1 }], created: new Date(2026, 0, 1) }
    const copy = deepClone(source)
    copy.roles[0].id = 2
    copy.created.setFullYear(2027)
    expect(source.roles[0].id).toBe(1)
    expect(source.created.getFullYear()).toBe(2026)
  })
  it('preserves masking used by the personal profile', () => {
    expect(regEmail('username@example.com')).toBe('use*****@example.com')
    expect(regMobile('13812345678')).toBe('138****5678')
  })
})
