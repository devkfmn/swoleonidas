import { isAfter, isBefore, startOfDay } from 'date-fns'
import type { CompletionLog } from '../../types/program'
import type { DayStatus } from '../../types/program'
import type { Program } from '../validation/programSchema'
import { getWorkoutForDate } from './getWorkoutForDate'

export function getDayStatus(
  program: Program,
  date: Date,
  log: CompletionLog | null,
  today: Date = new Date(),
): DayStatus {
  const scheduled = getWorkoutForDate(program, date)
  const dayStart = startOfDay(date)
  const todayStart = startOfDay(today)

  if (scheduled.isRestDay || !scheduled.workout) {
    return 'rest'
  }

  const itemCount = scheduled.workout.items.length
  const completedCount =
    log?.items.filter((i) => i.completed).length ?? 0

  const isToday = dayStart.getTime() === todayStart.getTime()
  const isFuture = isAfter(dayStart, todayStart)
  const isPast = isBefore(dayStart, todayStart)

  if (isFuture) {
    return 'future'
  }

  if (completedCount === itemCount && itemCount > 0) {
    return isToday ? 'today' : 'complete'
  }

  if (completedCount > 0 && completedCount < itemCount) {
    return isToday ? 'today' : 'partial'
  }

  if (isPast && completedCount === 0) {
    return 'missed'
  }

  if (isToday) {
    return 'today'
  }

  return 'planned'
}

export function getCompletionPercentage(
  program: Program,
  date: Date,
  log: CompletionLog | null,
): number {
  const scheduled = getWorkoutForDate(program, date)
  if (!scheduled.workout || scheduled.workout.items.length === 0) return 0
  const total = scheduled.workout.items.length
  const completed = log?.items.filter((i) => i.completed).length ?? 0
  return Math.round((completed / total) * 100)
}
