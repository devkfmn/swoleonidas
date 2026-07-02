import { describe, expect, it } from 'vitest'
import { getProgramSettings } from '../getProgramSettings'
import type { Program } from '../../validation/programSchema'

const baseProgram: Program = {
  schemaVersion: '1.0',
  programId: 'test',
  programName: 'Test',
  programType: 'fitness',
  durationWeeks: 4,
  startDate: '2026-07-01',
  exercises: [{ id: 'push_up', name: 'Push-up', category: 'strength', unit: 'reps' }],
  workouts: [
    {
      id: 'mini',
      name: 'Mini',
      items: [{ id: 'i1', exerciseId: 'push_up', sets: 1, target: 10, unit: 'reps' }],
    },
  ],
  phases: [
    {
      id: 'p1',
      name: 'Build',
      startWeek: 1,
      endWeek: 4,
      schedule: [{ days: ['monday'], workoutId: 'mini' }],
    },
  ],
}

describe('getProgramSettings', () => {
  it('returns defaults when settings are omitted', () => {
    expect(getProgramSettings(baseProgram)).toEqual({
      missedBehavior: 'mark_missed',
      trackingLevel: 'exercise',
      allowPartialCompletion: true,
      restDayStatus: 'rest',
    })
  })

  it('merges explicit settings with defaults', () => {
    const program: Program = {
      ...baseProgram,
      settings: { allowPartialCompletion: false },
    }
    expect(getProgramSettings(program).allowPartialCompletion).toBe(false)
    expect(getProgramSettings(program).trackingLevel).toBe('exercise')
  })
})
