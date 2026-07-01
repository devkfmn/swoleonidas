import { z } from 'zod'

export const unitSchema = z.enum([
  'reps',
  'seconds',
  'minutes',
  'meters',
  'kilometers',
  'custom',
])

export const progressionTypeSchema = z.enum(['none', 'linear_daily', 'linear_weekly'])

export const progressionSchema = z.object({
  type: progressionTypeSchema,
  increaseBy: z.number().optional(),
  cap: z.number().optional(),
})

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: unitSchema,
  equipment: z.string().optional(),
  description: z.string().optional(),
})

export const workoutItemSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  sets: z.number().int().positive(),
  target: z.number().positive(),
  unit: unitSchema,
  progression: progressionSchema.optional(),
})

export const minimumVersionItemSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().positive(),
  target: z.number().positive(),
  unit: unitSchema,
})

export const workoutSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  items: z.array(workoutItemSchema).min(1),
  minimumVersion: z.array(minimumVersionItemSchema).min(1),
})

export const scheduleEntrySchema = z.object({
  days: z.array(z.string().min(1)).min(1),
  workoutId: z.string().min(1),
})

export const phaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  startWeek: z.number().int().positive(),
  endWeek: z.number().int().positive(),
  schedule: z.array(scheduleEntrySchema).min(1),
})

export const programSettingsSchema = z.object({
  missedBehavior: z.string().optional(),
  trackingLevel: z.string().optional(),
  allowPartialCompletion: z.boolean().optional(),
  restDayStatus: z.string().optional(),
})

export const programSchema = z
  .object({
    schemaVersion: z.string().min(1),
    programId: z.string().min(1),
    programName: z.string().min(1),
    description: z.string().optional(),
    goal: z.string().optional(),
    programType: z.string().min(1),
    durationWeeks: z.number().int().positive(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
    settings: programSettingsSchema.optional(),
    exercises: z.array(exerciseSchema).min(1),
    workouts: z.array(workoutSchema).min(1),
    phases: z.array(phaseSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const exerciseIds = data.exercises.map((e) => e.id)
    const workoutIds = data.workouts.map((w) => w.id)
    const phaseIds = data.phases.map((p) => p.id)

    const checkDuplicates = (ids: string[], label: string) => {
      const seen = new Set<string>()
      for (const id of ids) {
        if (seen.has(id)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate ${label} id: "${id}"`,
          })
        }
        seen.add(id)
      }
    }

    checkDuplicates(exerciseIds, 'exercise')
    checkDuplicates(workoutIds, 'workout')
    checkDuplicates(phaseIds, 'phase')

    const exerciseIdSet = new Set(exerciseIds)
    const workoutIdSet = new Set(workoutIds)

    for (const workout of data.workouts) {
      for (const item of workout.items) {
        if (!exerciseIdSet.has(item.exerciseId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Workout "${workout.id}" references unknown exerciseId "${item.exerciseId}"`,
          })
        }
      }
      for (const minItem of workout.minimumVersion) {
        if (!exerciseIdSet.has(minItem.exerciseId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Workout "${workout.id}" minimumVersion references unknown exerciseId "${minItem.exerciseId}"`,
          })
        }
      }
    }

    for (const phase of data.phases) {
      if (phase.startWeek > phase.endWeek) {
        ctx.addIssue({
          code: 'custom',
          message: `Phase "${phase.id}" has startWeek greater than endWeek`,
        })
      }
      if (phase.startWeek < 1 || phase.endWeek > data.durationWeeks) {
        ctx.addIssue({
          code: 'custom',
          message: `Phase "${phase.id}" weeks must be within 1 and ${data.durationWeeks}`,
        })
      }
      for (const entry of phase.schedule) {
        if (!workoutIdSet.has(entry.workoutId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Phase "${phase.id}" references unknown workoutId "${entry.workoutId}"`,
          })
        }
      }
    }
  })

export type Unit = z.infer<typeof unitSchema>
export type Progression = z.infer<typeof progressionSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type WorkoutItem = z.infer<typeof workoutItemSchema>
export type MinimumVersionItem = z.infer<typeof minimumVersionItemSchema>
export type Workout = z.infer<typeof workoutSchema>
export type ScheduleEntry = z.infer<typeof scheduleEntrySchema>
export type Phase = z.infer<typeof phaseSchema>
export type ProgramSettings = z.infer<typeof programSettingsSchema>
export type Program = z.infer<typeof programSchema>
