import { useState } from 'react'
import type { DisplayItem } from './ExerciseChecklistItem'
import { ExerciseChecklistItem } from './ExerciseChecklistItem'
import { GreekCard } from '../ui/GreekCard'
import { ProgressRing } from '../ui/ProgressRing'
import { StoneButton } from '../ui/StoneButton'
import { useCompletionLog } from '../../hooks/useCompletionLog'
import { getCompletionPercentage } from '../../lib/schedule/getDayStatus'
import type { ResolvedWorkout } from '../../lib/schedule/types'
import type { Phase, Program } from '../../lib/validation/programSchema'

interface WorkoutDayViewProps {
  program: Program
  date: Date
  dateStr: string
  workout: ResolvedWorkout
  currentWeek: number
  currentPhase: Phase | null
}

export function WorkoutDayView({
  program,
  date,
  dateStr,
  workout,
  currentWeek,
  currentPhase,
}: WorkoutDayViewProps) {
  const programId = program.programId
  const {
    log,
    toggleExercise,
    setNote,
    markAllComplete,
    resetDay,
  } = useCompletionLog(dateStr, programId, workout)

  const [noteDraft, setNoteDraft] = useState('')

  const exerciseMap = new Map(program.exercises.map((e) => [e.id, e]))

  const displayItems: DisplayItem[] = workout.items.map((item) => {
    const exercise = exerciseMap.get(item.exerciseId)
    return {
      ...item,
      description: exercise?.description,
      equipment: exercise?.equipment,
    }
  })

  const percentage = getCompletionPercentage(program, date, log)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <ProgressRing percentage={percentage} />
        <div>
          <p className="text-sm text-ink-muted">
            Week {currentWeek}
            {currentPhase ? ` · ${currentPhase.name}` : ''}
          </p>
          <h2 className="font-display text-xl font-semibold text-ink">{workout.name}</h2>
          {workout.estimatedMinutes && (
            <p className="text-sm text-ink-muted">~{workout.estimatedMinutes} min</p>
          )}
        </div>
      </div>

      <GreekCard title="Exercises" className="mb-6">
        <div className="space-y-3">
          {displayItems.map((item) => {
            const logItem = log?.items.find((i) => i.exerciseId === item.exerciseId)
            return (
              <ExerciseChecklistItem
                key={item.exerciseId}
                item={item}
                completed={logItem?.completed ?? false}
                actual={logItem?.actual}
                onToggle={(completed) =>
                  toggleExercise(item.exerciseId, completed, logItem?.actual ?? item.target)
                }
                onActualChange={(actual) =>
                  toggleExercise(item.exerciseId, true, actual)
                }
              />
            )
          })}
        </div>
      </GreekCard>

      <GreekCard title="Note" className="mb-6">
        <textarea
          value={noteDraft || log?.note || ''}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setNote(noteDraft || log?.note || '')}
          rows={3}
          className="w-full rounded-lg border border-stone-border bg-stone-surface p-3 text-sm"
          placeholder="How did it go?"
        />
      </GreekCard>

      <div className="flex flex-wrap gap-2">
        <StoneButton onClick={markAllComplete}>Mark all complete</StoneButton>
        <StoneButton
          variant="ghost"
          onClick={async () => {
            await resetDay()
            setNoteDraft('')
          }}
        >
          Reset day
        </StoneButton>
      </div>
    </>
  )
}
