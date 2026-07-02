import { parseISO } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { getProgramStats } from '../getProgramStats'
import type { CompletionLog } from '../../../types/program'
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
          days: ['monday', 'wednesday', 'friday'],
          workoutId: 'mini',
        },
      ],
    },
  ],
}

function log(date: string, completed: boolean): CompletionLog {
  return {
    date,
    programId: 'test',
    workoutId: 'mini',
    usedMinimumVersion: false,
    items: [{ exerciseId: 'push_up', completed }],
    note: '',
  }
}

describe('getProgramStats', () => {
  const today = parseISO('2026-07-10') // Friday week 2

  it('excludes future days from totals', () => {
    const midWeek = parseISO('2026-07-03')
    const stats = getProgramStats(program, [], midWeek)
    expect(stats.totals.complete).toBe(0)
    expect(stats.totals.missed).toBe(2)
    expect(stats.totals.rest).toBe(1)
  })

  it('counts partial days toward denominator but not adherence numerator', () => {
    const multiExerciseProgram: Program = {
      ...program,
      exercises: [
        { id: 'push_up', name: 'Push-up', category: 'strength', unit: 'reps' },
        { id: 'squat', name: 'Squat', category: 'strength', unit: 'reps' },
      ],
      workouts: [
        {
          id: 'mini',
          name: 'Mini',
          estimatedMinutes: 5,
          items: [
            { id: 'i1', exerciseId: 'push_up', sets: 1, target: 10, unit: 'reps' },
            { id: 'i2', exerciseId: 'squat', sets: 1, target: 10, unit: 'reps' },
          ],
          minimumVersion: [{ exerciseId: 'push_up', sets: 1, target: 1, unit: 'reps' }],
        },
      ],
    }
    const logs: CompletionLog[] = [
      {
        date: '2026-07-01',
        programId: 'test',
        workoutId: 'mini',
        usedMinimumVersion: false,
        items: [
          { exerciseId: 'push_up', completed: true },
          { exerciseId: 'squat', completed: true },
        ],
        note: '',
      },
      {
        date: '2026-07-03',
        programId: 'test',
        workoutId: 'mini',
        usedMinimumVersion: false,
        items: [
          { exerciseId: 'push_up', completed: true },
          { exerciseId: 'squat', completed: false },
        ],
        note: '',
      },
    ]
    const stats = getProgramStats(multiExerciseProgram, logs, parseISO('2026-07-03'))
    expect(stats.totals.complete).toBe(1)
    expect(stats.totals.partial).toBe(1)
    expect(stats.adherencePercent).toBe(50)
  })

  it('does not break streak across rest days', () => {
    const logs = [
      log('2026-07-01', true), // Wed
      log('2026-07-03', true), // Fri
      log('2026-07-06', true), // Mon
      log('2026-07-08', true), // Wed
    ]
    const stats = getProgramStats(program, logs, today)
    expect(stats.streak.current).toBe(4)
    expect(stats.streak.best).toBeGreaterThanOrEqual(4)
  })

  it('breaks streak on missed workout day', () => {
    const logs = [
      log('2026-07-01', true),
      log('2026-07-03', true),
      // 2026-07-06 missed
      log('2026-07-08', true),
    ]
    const stats = getProgramStats(program, logs, today)
    expect(stats.streak.current).toBe(1)
  })

  it('marks streak at risk when today workout is incomplete', () => {
    const logs = [
      log('2026-07-01', true),
      log('2026-07-03', true),
      log('2026-07-06', true),
      log('2026-07-08', true),
    ]
    const friday = parseISO('2026-07-10')
    const stats = getProgramStats(program, logs, friday)
    expect(stats.streak.atRisk).toBe(true)
    expect(stats.streak.current).toBe(4)
  })

  it('groups weekly adherence by program week', () => {
    const logs = [
      log('2026-07-01', true),
      log('2026-07-03', true),
      log('2026-07-06', true),
    ]
    const stats = getProgramStats(program, logs, today)
    expect(stats.weeklyAdherence.length).toBeGreaterThan(0)
    const week1 = stats.weeklyAdherence.find((w) => w.weekNumber === 1)
    expect(week1).toBeDefined()
    expect(week1!.completed).toBe(2)
    expect(week1!.scheduled).toBe(2)
  })

  it('computes timeline percent from elapsed program days', () => {
    const stats = getProgramStats(program, [], today)
    expect(stats.currentWeek).toBe(2)
    expect(stats.timelineDay).toBe(10)
    expect(stats.timelineTotalDays).toBe(28)
    expect(stats.timelinePercent).toBe(36)
  })

  it('computes phase progress for single-phase program', () => {
    const stats = getProgramStats(program, [], today)
    expect(stats.phaseDay).toBe(10)
    expect(stats.phaseTotalDays).toBe(28)
    expect(stats.phasePercent).toBe(36)
    expect(stats.phasePercent).toBe(stats.timelinePercent)
    expect(stats.phaseDay).toBe(stats.timelineDay)
  })

  it('computes phase progress for multi-phase program', () => {
    const multiPhaseProgram: Program = {
      ...program,
      durationWeeks: 8,
      phases: [
        {
          id: 'p1',
          name: 'Foundation',
          startWeek: 1,
          endWeek: 4,
          schedule: program.phases[0].schedule,
        },
        {
          id: 'p2',
          name: 'Strength',
          startWeek: 5,
          endWeek: 8,
          schedule: program.phases[0].schedule,
        },
      ],
    }
    const week6 = parseISO('2026-08-07')
    const stats = getProgramStats(multiPhaseProgram, [], week6)
    expect(stats.currentWeek).toBe(6)
    expect(stats.currentPhase?.name).toBe('Strength')
    expect(stats.phaseDay).toBe(10)
    expect(stats.phaseTotalDays).toBe(28)
    expect(stats.phasePercent).toBe(36)
  })

  it('counts minimum version days', () => {
    const logs: CompletionLog[] = [
      {
        ...log('2026-07-01', true),
        usedMinimumVersion: true,
      },
    ]
    const stats = getProgramStats(program, logs, today)
    expect(stats.totals.minimumVersionDays).toBe(1)
  })
})
