import type { Phase, Program, Workout, WorkoutItem } from '../validation/programSchema'

export interface ResolvedWorkoutItem {
  id: string
  exerciseId: string
  exerciseName: string
  sets: number
  target: number
  unit: string
  originalTarget: number
}

export interface ResolvedWorkout {
  id: string
  name: string
  description?: string
  estimatedMinutes?: number
  items: ResolvedWorkoutItem[]
}

export interface ScheduledDay {
  date: string
  week: number
  phase: Phase | null
  workout: ResolvedWorkout | null
  isRestDay: boolean
}

export type { Program, Phase, Workout, WorkoutItem }
