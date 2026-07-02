import { format, parseISO } from 'date-fns'
import type { Program } from '../validation/programSchema'
import { applyProgression, getElapsedDays, getElapsedWeeks } from './applyProgression'
import { getCurrentPhase } from './getCurrentPhase'
import { getCurrentWeek } from './getCurrentWeek'
import type { ResolvedWorkout, ScheduledDay } from './types'

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

function getWeekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

export function getWorkoutForDate(program: Program, date: Date): ScheduledDay {
  const dateStr = format(date, 'yyyy-MM-dd')
  const week = getCurrentWeek(program, date)
  const phase = getCurrentPhase(program, week)
  const elapsedDays = getElapsedDays(program, date)
  const elapsedWeeks = getElapsedWeeks(program, date)

  if (!phase) {
    return { date: dateStr, week, phase: null, workout: null, isRestDay: true }
  }

  const weekday = getWeekdayName(date)
  const scheduleEntry = phase.schedule.find((entry) =>
    entry.days.map((d) => d.toLowerCase()).includes(weekday),
  )

  if (!scheduleEntry) {
    return { date: dateStr, week, phase, workout: null, isRestDay: true }
  }

  const workout = program.workouts.find((w) => w.id === scheduleEntry.workoutId)
  if (!workout) {
    return { date: dateStr, week, phase, workout: null, isRestDay: true }
  }

  const exerciseMap = new Map(program.exercises.map((e) => [e.id, e]))

  const resolved: ResolvedWorkout = {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    estimatedMinutes: workout.estimatedMinutes,
    items: workout.items.map((item) => {
      const exercise = exerciseMap.get(item.exerciseId)
      const target = applyProgression(item, elapsedDays, elapsedWeeks)
      return {
        id: item.id,
        exerciseId: item.exerciseId,
        exerciseName: exercise?.name ?? item.exerciseId,
        sets: item.sets,
        target,
        unit: item.unit,
        originalTarget: item.target,
      }
    }),
  }

  return { date: dateStr, week, phase, workout: resolved, isRestDay: false }
}

export function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr)
}
