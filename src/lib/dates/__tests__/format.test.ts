import { describe, expect, it } from 'vitest'
import {
  displayDateToStorage,
  formatDisplayDate,
  formatDisplayDateLong,
  parseDisplayDate,
  storageDateToDisplay,
  toStorageDate,
} from '../format'

describe('date format utilities', () => {
  it('formats storage dates for display', () => {
    expect(formatDisplayDate('2026-07-01')).toBe('01-07-2026')
    expect(storageDateToDisplay('2026-12-25')).toBe('25-12-2026')
  })

  it('formats long display dates', () => {
    expect(formatDisplayDateLong('2026-07-01')).toMatch(/01-07-2026/)
  })

  it('parses display dates to storage', () => {
    expect(displayDateToStorage('01-07-2026')).toBe('2026-07-01')
    expect(parseDisplayDate('31-12-2026')).not.toBeNull()
  })

  it('returns null for invalid display dates', () => {
    expect(parseDisplayDate('2026-07-01')).toBeNull()
    expect(parseDisplayDate('not-a-date')).toBeNull()
    expect(displayDateToStorage('99-99-9999')).toBeNull()
  })

  it('round-trips through storage format', () => {
    const date = new Date(2026, 6, 5)
    expect(storageDateToDisplay(toStorageDate(date))).toBe('05-07-2026')
  })
})
