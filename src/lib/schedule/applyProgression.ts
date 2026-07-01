import { differenceInCalendarDays, differenceInCalendarWeeks, parseISO } from 'date-fns'
import type { Program } from '../validation/programSchema'
import type { WorkoutItem } from '../validation/programSchema'

export function getElapsedDays(program: Program, date: Date): number {
  const start = parseISO(program.startDate)
  return Math.max(0, differenceInCalendarDays(date, start))
}

export function getElapsedWeeks(program: Program, date: Date): number {
  const start = parseISO(program.startDate)
  return Math.max(0, differenceInCalendarWeeks(date, start, { weekStartsOn: 1 }))
}

export function applyProgression(
  item: WorkoutItem,
  elapsedDays: number,
  elapsedWeeks: number,
): number {
  const progression = item.progression
  if (!progression || progression.type === 'none') {
    return item.target
  }

  let value = item.target
  if (progression.type === 'linear_daily') {
    value = item.target + (progression.increaseBy ?? 0) * elapsedDays
  } else if (progression.type === 'linear_weekly') {
    value = item.target + (progression.increaseBy ?? 0) * elapsedWeeks
  }

  if (progression.cap !== undefined) {
    value = Math.min(value, progression.cap)
  }

  return value
}
