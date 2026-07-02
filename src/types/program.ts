export type { Program, Exercise, Workout, Phase, WorkoutItem } from '../lib/validation/programSchema'

export interface CompletionLogItem {
  exerciseId: string
  completed: boolean
  actual?: number
}

export interface CompletionLog {
  date: string
  programId: string
  workoutId: string
  items: CompletionLogItem[]
  note: string
  createdAt?: unknown
  updatedAt?: unknown
}

export interface StoredProgram {
  program: import('../lib/validation/programSchema').Program
  importedAt: unknown
  updatedAt: unknown
  isActive: boolean
}

export interface UserSettings {
  activeProgramId: string | null
  createdAt?: unknown
  updatedAt?: unknown
}

export type DayStatus =
  | 'rest'
  | 'complete'
  | 'partial'
  | 'missed'
  | 'future'
  | 'today'
  | 'planned'
