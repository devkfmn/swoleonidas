import type { Program } from '../validation/programSchema'
import type { Phase } from '../validation/programSchema'
import { getCurrentWeek } from './getCurrentWeek'

export function getCurrentPhase(program: Program, week: number): Phase | null {
  return program.phases.find((p) => week >= p.startWeek && week <= p.endWeek) ?? null
}

export function getCurrentPhaseForDate(program: Program, date: Date): Phase | null {
  const week = getCurrentWeek(program, date)
  return getCurrentPhase(program, week)
}
