import { describe, expect, it } from 'vitest'
import { validateProgramObject } from '../validateProgramJson'

const validProgram = {
  schemaVersion: '1.0',
  programId: 'test-program',
  programName: 'Test Program',
  programType: 'fitness',
  durationWeeks: 4,
  startDate: '2026-07-01',
  exercises: [
    {
      id: 'push_up',
      name: 'Push-up',
      category: 'strength',
      unit: 'reps',
    },
  ],
  workouts: [
    {
      id: 'day1',
      name: 'Day 1',
      items: [
        {
          id: 'item1',
          exerciseId: 'push_up',
          sets: 1,
          target: 10,
          unit: 'reps',
          progression: { type: 'linear_daily', increaseBy: 1, cap: 20 },
        },
      ],
    },
  ],
  phases: [
    {
      id: 'phase1',
      name: 'Phase 1',
      startWeek: 1,
      endWeek: 4,
      schedule: [{ days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], workoutId: 'day1' }],
    },
  ],
}

describe('validateProgramJson', () => {
  it('accepts a valid program', () => {
    const result = validateProgramObject(validProgram)
    expect(result.success).toBe(true)
  })

  it('accepts the bundled example program', async () => {
    const { exampleProgram } = await import('../../../data/exampleProgram')
    const result = validateProgramObject(exampleProgram)
    expect(result.success).toBe(true)
  })

  it('rejects invalid exercise reference', () => {
    const bad = {
      ...validProgram,
      workouts: [
        {
          ...validProgram.workouts[0],
          items: [{ ...validProgram.workouts[0].items[0], exerciseId: 'missing' }],
        },
      ],
    }
    const result = validateProgramObject(bad)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('unknown exerciseId'))).toBe(true)
    }
  })

  it('rejects duplicate exercise ids', () => {
    const bad = {
      ...validProgram,
      exercises: [
        validProgram.exercises[0],
        { ...validProgram.exercises[0] },
      ],
    }
    const result = validateProgramObject(bad)
    expect(result.success).toBe(false)
  })
})
