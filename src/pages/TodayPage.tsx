import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { ExerciseChecklistItem } from '../components/domain/ExerciseChecklistItem'
import { EmptyState } from '../components/ui/EmptyState'
import { GreekCard } from '../components/ui/GreekCard'
import { LaurelWreath, PageHeader } from '../components/ui/Icons'
import { ProgressRing } from '../components/ui/ProgressRing'
import { StoneButton } from '../components/ui/StoneButton'
import { useActiveProgram } from '../hooks/useActiveProgram'
import { useCompletionLog } from '../hooks/useCompletionLog'
import { getCompletionPercentage } from '../lib/schedule/getDayStatus'
import { getWorkoutForDate } from '../lib/schedule/getWorkoutForDate'

export function TodayPage() {
  const navigate = useNavigate()
  const { activeProgram, currentPhase, currentWeek, loading } = useActiveProgram()
  const today = new Date()
  const dateStr = format(today, 'yyyy-MM-dd')

  const scheduled = useMemo(() => {
    if (!activeProgram) return null
    return getWorkoutForDate(activeProgram.program, today)
  }, [activeProgram, today])

  const workout = scheduled?.workout ?? null
  const programId = activeProgram?.program.programId ?? null

  const {
    log,
    toggleExercise,
    setMinimumVersion,
    setNote,
    markAllComplete,
    resetDay,
  } = useCompletionLog(dateStr, programId, workout)

  const [noteDraft, setNoteDraft] = useState('')
  const [useMinimum, setUseMinimum] = useState(false)

  const displayItems = useMemo((): import('../components/domain/ExerciseChecklistItem').DisplayItem[] => {
    if (!workout) return []
    if (useMinimum || log?.usedMinimumVersion) {
      const exerciseMap = new Map(
        activeProgram?.program.exercises.map((e) => [e.id, e.name]) ?? [],
      )
      return workout.minimumVersion.map((item) => ({
        ...item,
        id: item.exerciseId,
        exerciseName: exerciseMap.get(item.exerciseId) ?? item.exerciseId,
      }))
    }
    return workout.items
  }, [workout, useMinimum, log, activeProgram])

  const percentage = activeProgram && workout
    ? getCompletionPercentage(activeProgram.program, today, log)
    : 0

  if (loading) {
    return <p className="text-ink-muted">Loading...</p>
  }

  if (!activeProgram) {
    return (
      <>
        <PageHeader title="Today" subtitle={format(today, 'EEEE, MMMM d, yyyy')} />
        <EmptyState
          title="No active program"
          description="Import a training program and activate it to see today's workout."
          actionLabel="Import your first program"
          onAction={() => navigate('/import')}
        />
      </>
    )
  }

  if (scheduled?.isRestDay || !workout) {
    return (
      <>
        <PageHeader
          title="Today"
          subtitle={`${activeProgram.program.programName} · Week ${currentWeek}`}
        />
        <GreekCard className="text-center">
          <div className="mx-auto mb-4 flex justify-center text-bronze">
            <LaurelWreath className="h-16 w-16" />
          </div>
          <h2 className="font-display text-xl font-semibold">Rest day.</h2>
          <p className="mt-2 text-ink-muted">Even Spartans recover.</p>
          {currentPhase && (
            <p className="mt-4 text-sm text-ink-muted">Phase: {currentPhase.name}</p>
          )}
        </GreekCard>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={`${format(today, 'EEEE, MMMM d')} · ${activeProgram.program.programName}`}
      />

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
          variant="secondary"
          onClick={() => {
            const next = !useMinimum
            setUseMinimum(next)
            setMinimumVersion(next)
          }}
        >
          {useMinimum || log?.usedMinimumVersion ? 'Using minimum' : 'Use minimum version'}
        </StoneButton>
        <StoneButton variant="ghost" onClick={resetDay}>
          Reset today
        </StoneButton>
      </div>
    </>
  )
}
