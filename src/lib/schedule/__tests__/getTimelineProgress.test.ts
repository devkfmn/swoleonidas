import { addWeeks, parseISO, subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import type { Program } from '../../validation/programSchema'
import {
  getPhaseDateRange,
  getPhaseTimelineProgress,
  getProgramEndDate,
  getProgramTimelineProgress,
} from '../getTimelineProgress'

const program: Program = {
  schemaVersion: '1.0',
  programId: 'test',
  programName: 'Test',
  programType: 'fitness',
  durationWeeks: 4,
  startDate: '2026-07-01',
  exercises: [],
  workouts: [],
  phases: [
    {
      id: 'p1',
      name: 'Build',
      startWeek: 1,
      endWeek: 4,
      schedule: [],
    },
    {
      id: 'p2',
      name: 'Strength',
      startWeek: 5,
      endWeek: 8,
      schedule: [],
    },
  ],
}

describe('getTimelineProgress', () => {
  it('computes program day progress from start and end dates', () => {
    const progress = getProgramTimelineProgress(program, parseISO('2026-07-10'))
    expect(progress.currentDay).toBe(10)
    expect(progress.totalDays).toBe(28)
    expect(progress.percent).toBe(36)
  })

  it('aligns phase date ranges to program week boundaries', () => {
    const phase = program.phases[1]
    const { start, end } = getPhaseDateRange(program, phase)
    expect(start).toEqual(addWeeks(parseISO('2026-07-01'), 4))
    expect(end).toEqual(subDays(addWeeks(parseISO('2026-07-01'), 8), 1))
  })

  it('computes phase day progress within the active phase range', () => {
    const progress = getPhaseTimelineProgress(
      { ...program, durationWeeks: 8 },
      program.phases[1],
      parseISO('2026-08-07'),
    )
    expect(progress).toEqual({
      currentDay: 10,
      totalDays: 28,
      percent: 36,
    })
  })

  it('matches program end date helper to duration weeks', () => {
    expect(getProgramEndDate(program)).toEqual(subDays(addWeeks(parseISO('2026-07-01'), 4), 1))
  })
})
