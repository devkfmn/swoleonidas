import { parseISO } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { isDateEditable } from '../editable'

describe('isDateEditable', () => {
  const today = parseISO('2026-07-05')

  it('allows today and past dates', () => {
    expect(isDateEditable(parseISO('2026-07-05'), today)).toBe(true)
    expect(isDateEditable(parseISO('2026-07-04'), today)).toBe(true)
  })

  it('disallows future dates', () => {
    expect(isDateEditable(parseISO('2026-07-06'), today)).toBe(false)
  })
})
