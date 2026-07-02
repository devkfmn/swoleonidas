import { isAfter, startOfDay } from 'date-fns'
import type { CompletionLog } from '../../types/program'
import type { DayStatus } from '../../types/program'
import type { Program } from '../validation/programSchema'
import { getProgramSettings } from './getProgramSettings'
import { getWorkoutForDate } from './getWorkoutForDate'

function countCompletedWorkoutItems(
  workoutItems: { exerciseId: string }[],
  log: CompletionLog | null,
): number {
  if (!log?.items?.length) return 0
  return workoutItems.filter((item) =>
    log.items.some((logItem) => logItem.exerciseId === item.exerciseId && logItem.completed),
  ).length
}

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
  const completedCount = countCompletedWorkoutItems(scheduled.workout.items, log)

  const isFuture = isAfter(dayStart, todayStart)

  if (isFuture) {
    return 'future'
  }

  if (completedCount === itemCount && itemCount > 0) {
    return 'complete'
  }

  if (completedCount > 0 && completedCount < itemCount) {
    const { allowPartialCompletion } = getProgramSettings(program)
    return allowPartialCompletion ? 'partial' : 'missed'
  }

  return 'missed'
}

export function getCompletionPercentage(
  program: Program,
  date: Date,
  log: CompletionLog | null,
): number {
  const scheduled = getWorkoutForDate(program, date)
  if (!scheduled.workout || scheduled.workout.items.length === 0) return 0
  const total = scheduled.workout.items.length
  const completed = countCompletedWorkoutItems(scheduled.workout.items, log)
  return Math.round((completed / total) * 100)
}
