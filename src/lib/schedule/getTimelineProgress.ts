import {
  addWeeks,
  differenceInCalendarDays,
  min,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns'
import type { Phase, Program } from '../validation/programSchema'

export interface TimelineProgress {
  currentDay: number
  totalDays: number
  percent: number
}

export function getProgramEndDate(program: Program): Date {
  const start = parseISO(program.startDate)
  return subDays(addWeeks(start, program.durationWeeks), 1)
}

export function getPhaseDateRange(
  program: Program,
  phase: Phase,
): { start: Date; end: Date } {
  const programStart = parseISO(program.startDate)
  return {
    start: addWeeks(programStart, phase.startWeek - 1),
    end: subDays(addWeeks(programStart, phase.endWeek), 1),
  }
}

export function getProgramTimelineProgress(
  program: Program,
  today: Date,
): TimelineProgress {
  const start = startOfDay(parseISO(program.startDate))
  const end = startOfDay(getProgramEndDate(program))
  const effectiveToday = min([startOfDay(today), end])
  const totalDays = differenceInCalendarDays(end, start) + 1
  const currentDay = Math.max(1, differenceInCalendarDays(effectiveToday, start) + 1)
  const percent = Math.round((currentDay / totalDays) * 100)

  return { currentDay, totalDays, percent }
}

export function getPhaseTimelineProgress(
  program: Program,
  phase: Phase | null,
  today: Date,
): TimelineProgress | null {
  if (!phase) return null

  const { start, end } = getPhaseDateRange(program, phase)
  const phaseStart = startOfDay(start)
  const phaseEnd = startOfDay(end)
  const effectiveToday = min([startOfDay(today), phaseEnd])
  const totalDays = differenceInCalendarDays(phaseEnd, phaseStart) + 1
  const currentDay = Math.max(1, differenceInCalendarDays(effectiveToday, phaseStart) + 1)
  const percent = Math.round((currentDay / totalDays) * 100)

  return { currentDay, totalDays, percent }
}
