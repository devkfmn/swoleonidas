import { describe, expect, it } from 'vitest'
import { formatFirebaseError, sanitizeForFirestore } from '../utils'

describe('firebase utils', () => {
  it('strips undefined values for Firestore', () => {
    const input = { a: 1, b: undefined, nested: { c: undefined, d: 2 } }
    expect(sanitizeForFirestore(input)).toEqual({ a: 1, nested: { d: 2 } })
  })

  it('maps permission-denied to a friendly message', () => {
    expect(formatFirebaseError({ code: 'permission-denied' })).toContain('permission denied')
  })

  it('maps unavailable errors', () => {
    expect(formatFirebaseError({ code: 'unavailable' })).toContain('not available')
  })
})
