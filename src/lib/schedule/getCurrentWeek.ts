import { differenceInCalendarWeeks, parseISO } from 'date-fns'
import type { Program } from '../validation/programSchema'

export function getCurrentWeek(program: Program, date: Date): number {
  const start = parseISO(program.startDate)
  const week = differenceInCalendarWeeks(date, start, { weekStartsOn: 1 }) + 1
  if (week < 1) return 1
  if (week > program.durationWeeks) return program.durationWeeks
  return week
}
