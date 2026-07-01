import type { Program } from '../lib/validation/programSchema'

const allDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const upperLowerDays = ['monday', 'tuesday', 'thursday', 'friday'] as const
const shreddedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const

// referenced in phase schedules below
void upperLowerDays
void shreddedDays

export const exampleProgram: Program = {
  schemaVersion: '1.0',
  programId: 'swoleonidas-greek-god-v1',
  programName: 'Swoleonidas Greek God Program',
  description:
    '24-week progressive bodyweight and band program. Build the habit, then strength, then lean athletic conditioning.',
  goal: 'Get lean, strong, athletic, and consistent.',
  programType: 'fitness',
  durationWeeks: 24,
  startDate: '2026-07-01',
  settings: {
    missedBehavior: 'mark_missed',
    trackingLevel: 'exercise',
    allowPartialCompletion: true,
    restDayStatus: 'rest',
  },
  exercises: [
    { id: 'push_up', name: 'Push-up', category: 'strength', unit: 'reps', equipment: 'bodyweight', description: 'Classic upper-body push.' },
    { id: 'squat', name: 'Bodyweight Squat', category: 'strength', unit: 'reps', equipment: 'bodyweight', description: 'Full-range squat.' },
    { id: 'band_row', name: 'Band Row', category: 'strength', unit: 'reps', equipment: 'band', description: 'Horizontal pull with resistance band.' },
    { id: 'band_pull_apart', name: 'Band Pull-apart', category: 'mobility', unit: 'reps', equipment: 'band', description: 'Rear delt and posture work.' },
    { id: 'plank', name: 'Plank', category: 'core', unit: 'seconds', equipment: 'bodyweight', description: 'Front plank hold.' },
    { id: 'hollow_hold', name: 'Hollow Hold', category: 'core', unit: 'seconds', equipment: 'bodyweight', description: 'Supine core brace.' },
    { id: 'lunge', name: 'Walking Lunge', category: 'strength', unit: 'reps', equipment: 'bodyweight', description: 'Alternating forward lunges.' },
    { id: 'glute_bridge', name: 'Glute Bridge', category: 'strength', unit: 'reps', equipment: 'bodyweight', description: 'Hip thrust from floor.' },
    { id: 'pike_push_up', name: 'Pike Push-up', category: 'strength', unit: 'reps', equipment: 'bodyweight', description: 'Inverted shoulder press pattern.' },
    { id: 'plate_hold', name: 'Plate Hold', category: 'strength', unit: 'seconds', equipment: 'plate', description: 'Loaded carry or front hold.' },
  ],
  workouts: [
    {
      id: 'mini_habit_day',
      name: 'Mini Habit Day',
      description: 'Tiny daily habit to build consistency.',
      estimatedMinutes: 5,
      items: [
        { id: 'mh_push', exerciseId: 'push_up', sets: 1, target: 10, unit: 'reps', progression: { type: 'linear_daily', increaseBy: 1, cap: 30 } },
      ],
      minimumVersion: [{ exerciseId: 'push_up', sets: 1, target: 1, unit: 'reps' }],
    },
    {
      id: 'base_building_day',
      name: 'Base Building Circuit',
      description: 'Short full-body daily circuit.',
      estimatedMinutes: 15,
      items: [
        { id: 'bb_push', exerciseId: 'push_up', sets: 2, target: 12, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 24 } },
        { id: 'bb_squat', exerciseId: 'squat', sets: 2, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 3, cap: 30 } },
        { id: 'bb_plank', exerciseId: 'plank', sets: 2, target: 30, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 60 } },
        { id: 'bb_bridge', exerciseId: 'glute_bridge', sets: 2, target: 12, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 20 } },
      ],
      minimumVersion: [
        { exerciseId: 'push_up', sets: 1, target: 3, unit: 'reps' },
        { exerciseId: 'squat', sets: 1, target: 5, unit: 'reps' },
        { exerciseId: 'plank', sets: 1, target: 15, unit: 'seconds' },
        { exerciseId: 'glute_bridge', sets: 1, target: 5, unit: 'reps' },
      ],
    },
    {
      id: 'upper_day',
      name: 'Upper Body',
      description: 'Push, pull, and core upper session.',
      estimatedMinutes: 35,
      items: [
        { id: 'up_push', exerciseId: 'push_up', sets: 3, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
        { id: 'up_pike', exerciseId: 'pike_push_up', sets: 3, target: 8, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 1, cap: 15 } },
        { id: 'up_row', exerciseId: 'band_row', sets: 3, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 25 } },
        { id: 'up_pull', exerciseId: 'band_pull_apart', sets: 3, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 25 } },
        { id: 'up_plank', exerciseId: 'plank', sets: 3, target: 45, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 90 } },
      ],
      minimumVersion: [
        { exerciseId: 'push_up', sets: 1, target: 5, unit: 'reps' },
        { exerciseId: 'pike_push_up', sets: 1, target: 3, unit: 'reps' },
        { exerciseId: 'band_row', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'band_pull_apart', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'plank', sets: 1, target: 20, unit: 'seconds' },
      ],
    },
    {
      id: 'lower_day',
      name: 'Lower Body',
      description: 'Squat pattern, lunges, bridges, and core.',
      estimatedMinutes: 35,
      items: [
        { id: 'lo_squat', exerciseId: 'squat', sets: 3, target: 20, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 3, cap: 40 } },
        { id: 'lo_lunge', exerciseId: 'lunge', sets: 3, target: 12, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 24 } },
        { id: 'lo_bridge', exerciseId: 'glute_bridge', sets: 3, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 25 } },
        { id: 'lo_hollow', exerciseId: 'hollow_hold', sets: 3, target: 30, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 60 } },
      ],
      minimumVersion: [
        { exerciseId: 'squat', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'lunge', sets: 1, target: 6, unit: 'reps' },
        { exerciseId: 'glute_bridge', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'hollow_hold', sets: 1, target: 15, unit: 'seconds' },
      ],
    },
    {
      id: 'shredded_upper',
      name: 'Shredded Upper',
      description: 'Higher-volume upper conditioning.',
      estimatedMinutes: 40,
      items: [
        { id: 'sh_push', exerciseId: 'push_up', sets: 4, target: 18, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 35 } },
        { id: 'sh_pike', exerciseId: 'pike_push_up', sets: 4, target: 10, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 1, cap: 18 } },
        { id: 'sh_row', exerciseId: 'band_row', sets: 4, target: 18, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
        { id: 'sh_pull', exerciseId: 'band_pull_apart', sets: 3, target: 20, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
        { id: 'sh_plate', exerciseId: 'plate_hold', sets: 3, target: 45, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 90 } },
      ],
      minimumVersion: [
        { exerciseId: 'push_up', sets: 1, target: 6, unit: 'reps' },
        { exerciseId: 'pike_push_up', sets: 1, target: 4, unit: 'reps' },
        { exerciseId: 'band_row', sets: 1, target: 10, unit: 'reps' },
        { exerciseId: 'band_pull_apart', sets: 1, target: 10, unit: 'reps' },
        { exerciseId: 'plate_hold', sets: 1, target: 20, unit: 'seconds' },
      ],
    },
    {
      id: 'shredded_lower',
      name: 'Shredded Lower',
      description: 'Lower body density and core finishers.',
      estimatedMinutes: 40,
      items: [
        { id: 'sh_sq', exerciseId: 'squat', sets: 4, target: 25, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 3, cap: 45 } },
        { id: 'sh_lu', exerciseId: 'lunge', sets: 4, target: 16, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
        { id: 'sh_gb', exerciseId: 'glute_bridge', sets: 4, target: 20, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
        { id: 'sh_ho', exerciseId: 'hollow_hold', sets: 4, target: 40, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 75 } },
      ],
      minimumVersion: [
        { exerciseId: 'squat', sets: 1, target: 10, unit: 'reps' },
        { exerciseId: 'lunge', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'glute_bridge', sets: 1, target: 10, unit: 'reps' },
        { exerciseId: 'hollow_hold', sets: 1, target: 20, unit: 'seconds' },
      ],
    },
    {
      id: 'shredded_conditioning',
      name: 'Conditioning Circuit',
      description: 'Full-body conditioning finisher day.',
      estimatedMinutes: 30,
      items: [
        { id: 'sc_push', exerciseId: 'push_up', sets: 3, target: 15, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 25 } },
        { id: 'sc_squat', exerciseId: 'squat', sets: 3, target: 20, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 35 } },
        { id: 'sc_plank', exerciseId: 'plank', sets: 3, target: 50, unit: 'seconds', progression: { type: 'linear_weekly', increaseBy: 5, cap: 90 } },
        { id: 'sc_pull', exerciseId: 'band_pull_apart', sets: 3, target: 20, unit: 'reps', progression: { type: 'linear_weekly', increaseBy: 2, cap: 30 } },
      ],
      minimumVersion: [
        { exerciseId: 'push_up', sets: 1, target: 5, unit: 'reps' },
        { exerciseId: 'squat', sets: 1, target: 8, unit: 'reps' },
        { exerciseId: 'plank', sets: 1, target: 25, unit: 'seconds' },
        { exerciseId: 'band_pull_apart', sets: 1, target: 10, unit: 'reps' },
      ],
    },
  ],
  phases: [
    {
      id: 'phase_1',
      name: 'Build the Habit',
      description: 'Create consistency with a very small daily workout.',
      startWeek: 1,
      endWeek: 4,
      schedule: [{ days: allDays, workoutId: 'mini_habit_day' }],
    },
    {
      id: 'phase_2',
      name: 'Base Building',
      description: 'Expand volume with a manageable daily circuit.',
      startWeek: 5,
      endWeek: 8,
      schedule: [{ days: allDays, workoutId: 'base_building_day' }],
    },
    {
      id: 'phase_3',
      name: 'Upper / Lower Split',
      description: 'Four training days per week with dedicated upper and lower sessions.',
      startWeek: 9,
      endWeek: 16,
      schedule: [
        { days: ['monday', 'thursday'], workoutId: 'upper_day' },
        { days: ['tuesday', 'friday'], workoutId: 'lower_day' },
      ],
    },
    {
      id: 'phase_4',
      name: 'Shredded Phase',
      description: 'Higher frequency and volume for the final push.',
      startWeek: 17,
      endWeek: 24,
      schedule: [
        { days: ['monday', 'thursday'], workoutId: 'shredded_upper' },
        { days: ['tuesday', 'friday'], workoutId: 'shredded_lower' },
        { days: ['wednesday'], workoutId: 'shredded_conditioning' },
      ],
    },
  ],
}

export const programJsonTemplate = JSON.stringify(
  {
    schemaVersion: '1.0',
    programId: 'your-program-id',
    programName: 'Your Program Name',
    description: 'Program description.',
    goal: 'Your goal.',
    programType: 'fitness',
    durationWeeks: 12,
    startDate: '2026-07-01',
    settings: {
      missedBehavior: 'mark_missed',
      trackingLevel: 'exercise',
      allowPartialCompletion: true,
      restDayStatus: 'rest',
    },
    exercises: [
      {
        id: 'exercise_id',
        name: 'Exercise Name',
        category: 'strength',
        unit: 'reps',
        equipment: 'bodyweight',
        description: 'Description.',
      },
    ],
    workouts: [
      {
        id: 'workout_id',
        name: 'Workout Name',
        description: 'Workout description.',
        estimatedMinutes: 20,
        items: [
          {
            id: 'item_id',
            exerciseId: 'exercise_id',
            sets: 3,
            target: 10,
            unit: 'reps',
            progression: { type: 'linear_weekly', increaseBy: 1, cap: 20 },
          },
        ],
        minimumVersion: [
          { exerciseId: 'exercise_id', sets: 1, target: 1, unit: 'reps' },
        ],
      },
    ],
    phases: [
      {
        id: 'phase_id',
        name: 'Phase Name',
        description: 'Phase description.',
        startWeek: 1,
        endWeek: 4,
        schedule: [
          {
            days: ['monday', 'wednesday', 'friday'],
            workoutId: 'workout_id',
          },
        ],
      },
    ],
  },
  null,
  2,
)

export const PROGRAM_PROMPT_RULES = `Create a complete fitness program as valid JSON using the schema below.

Rules:
* Output only valid JSON.
* Do not include markdown.
* Do not include explanations.
* All workout exerciseId values must match an exercise id from the exercises array.
* All phase workoutId values must match a workout id from the workouts array.
* Use clear phase names.
* Use realistic progressions.
* Include minimum versions for all workouts.
* Schedule workouts by weekday.
* Keep the program beginner-friendly at the start.
* Make the first phase extremely easy to support habit formation.`
