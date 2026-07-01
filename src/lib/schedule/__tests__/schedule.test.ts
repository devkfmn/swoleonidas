import { parseISO } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { applyProgression } from '../applyProgression'
import { getDayStatus } from '../getDayStatus'
import { getCurrentWeek } from '../getCurrentWeek'
import { getWorkoutForDate } from '../getWorkoutForDate'
import type { Program } from '../../validation/programSchema'

const program: Program = {
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
      estimatedMinutes: 5,
      items: [
        {
          id: 'i1',
          exerciseId: 'push_up',
          sets: 1,
          target: 10,
          unit: 'reps',
          progression: { type: 'linear_daily', increaseBy: 1, cap: 15 },
        },
      ],
      minimumVersion: [{ exerciseId: 'push_up', sets: 1, target: 1, unit: 'reps' }],
    },
  ],
  phases: [
    {
      id: 'p1',
      name: 'Build',
      startWeek: 1,
      endWeek: 4,
      schedule: [
        {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workoutId: 'mini',
        },
      ],
    },
  ],
}

describe('schedule engine', () => {
  it('calculates current week from start date', () => {
    expect(getCurrentWeek(program, parseISO('2026-07-01'))).toBe(1)
    expect(getCurrentWeek(program, parseISO('2026-07-08'))).toBe(2)
  })

  it('applies daily progression with cap', () => {
    const item = program.workouts[0].items[0]
    expect(applyProgression(item, 0, 0)).toBe(10)
    expect(applyProgression(item, 3, 0)).toBe(13)
    expect(applyProgression(item, 10, 0)).toBe(15)
  })

  it('returns workout for scheduled day and rest for unscheduled', () => {
    const wed = getWorkoutForDate(program, parseISO('2026-07-01'))
    expect(wed.isRestDay).toBe(false)
    expect(wed.workout?.items[0].target).toBe(10)

    const thu = getWorkoutForDate(program, parseISO('2026-07-02'))
    expect(thu.workout?.items[0].target).toBe(11)
  })

  it('determines day status correctly', () => {
    const date = parseISO('2026-06-30')
    const today = parseISO('2026-07-05')
    expect(getDayStatus(program, date, null, today)).toBe('missed')

    const future = parseISO('2026-07-10')
    expect(getDayStatus(program, future, null, today)).toBe('future')

    const complete = getDayStatus(
      program,
      parseISO('2026-07-01'),
      {
        date: '2026-07-01',
        programId: 'test',
        workoutId: 'mini',
        usedMinimumVersion: false,
        items: [{ exerciseId: 'push_up', completed: true }],
        note: '',
      },
      today,
    )
    expect(complete).toBe('complete')
  })
})
