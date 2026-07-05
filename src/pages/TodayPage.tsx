import { useMemo } from 'react'
import {
  addDays,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'
import { toStorageDate, formatDisplayDate, formatDisplayDateLong } from '../lib/dates/format'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { WeekPreview } from '../components/domain/WeekPreview'
import { WorkoutDayView } from '../components/domain/WorkoutDayView'
import { EmptyState } from '../components/ui/EmptyState'
import { GreekCard } from '../components/ui/GreekCard'
import { LaurelWreath, PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { useActiveProgram } from '../hooks/useActiveProgram'
import { useWeekStatus } from '../hooks/useWeekStatus'
import { getCurrentPhaseForDate } from '../lib/schedule/getCurrentPhase'
import { getCurrentWeek } from '../lib/schedule/getCurrentWeek'
import { getProgramEndDate } from '../lib/schedule/getTimelineProgress'
import { getWorkoutForDate } from '../lib/schedule/getWorkoutForDate'

function parseViewDate(param: string | null, fallback: Date): Date {
  if (!param) return fallback
  const parsed = parseISO(param)
  return isValid(parsed) ? parsed : fallback
}

export function TodayPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeProgram, loading } = useActiveProgram()
  const today = new Date()

  const program = activeProgram?.program ?? null
  const programEnd = program ? getProgramEndDate(program) : null

  const viewDate = useMemo(() => {
    if (!program) return today
    const parsed = parseViewDate(searchParams.get('date'), today)
    const day = startOfDay(parsed)
    if (programEnd && isAfter(day, startOfDay(programEnd))) {
      return startOfDay(programEnd)
    }
    return day
  }, [program, programEnd, searchParams, today])

  const dateStr = toStorageDate(viewDate)
  const isToday = isSameDay(viewDate, today)

  const scheduled = useMemo(() => {
    if (!program) return null
    return getWorkoutForDate(program, viewDate)
  }, [program, viewDate])

  const currentWeek = program ? getCurrentWeek(program, viewDate) : null
  const currentPhase = program ? getCurrentPhaseForDate(program, viewDate) : null
  const workout = scheduled?.workout ?? null

  const { logMap } = useWeekStatus(program, viewDate)

  const isBeforeProgramStart = program
    ? isBefore(startOfDay(viewDate), startOfDay(parseISO(program.startDate)))
    : false
  const isAfterProgramEnd = program && programEnd
    ? isAfter(startOfDay(viewDate), startOfDay(programEnd))
    : false

  const selectedDayLabel = isToday ? 'today' : formatDisplayDateLong(viewDate)

  const canGoNext = program && programEnd
    ? !isSameDay(viewDate, startOfDay(programEnd))
    : false

  const setViewDate = (next: Date) => {
    const nextStr = toStorageDate(next)
    if (isSameDay(next, today)) {
      setSearchParams({})
    } else {
      setSearchParams({ date: nextStr })
    }
  }

  const pageTitle = isToday ? 'Today' : formatDisplayDateLong(viewDate)

  if (loading) {
    return <p className="text-ink-muted">Loading...</p>
  }

  if (!activeProgram || !program) {
    return (
      <>
        <PageHeader title="Today" subtitle={formatDisplayDateLong(today)} />
        <EmptyState
          title="No active program"
          description="Create a training program and activate it to see today's workout."
          actionLabel="Create your first program"
          onAction={() => navigate('/programs', { state: { showCreate: true } })}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={`${formatDisplayDateLong(viewDate)} · ${program.programName}`}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <StoneButton
          variant="secondary"
          onClick={() => setViewDate(addDays(viewDate, -1))}
        >
          ← Previous
        </StoneButton>
        {!isToday && (
          <StoneButton variant="ghost" onClick={() => setSearchParams({})}>
            Jump to today
          </StoneButton>
        )}
        <StoneButton
          variant="secondary"
          disabled={!canGoNext}
          onClick={() => setViewDate(addDays(viewDate, 1))}
        >
          Next →
        </StoneButton>
      </div>

      <WeekPreview
        program={program}
        selectedDate={viewDate}
        logMap={logMap}
        onSelectDate={(d) => {
          if (d === toStorageDate(today)) {
            setSearchParams({})
          } else {
            setSearchParams({ date: d })
          }
        }}
      />

      {scheduled?.isRestDay || !workout ? (
        <GreekCard className="text-center">
          <div className="mx-auto mb-4 flex justify-center text-bronze">
            <LaurelWreath className="h-16 w-16" />
          </div>
          {isBeforeProgramStart ? (
            <>
              <h2 className="font-display text-xl font-semibold">No workout scheduled.</h2>
              <p className="mt-2 text-ink-muted">
                Nothing planned for {selectedDayLabel}. Your program starts on{' '}
                {formatDisplayDate(program.startDate)}.
              </p>
            </>
          ) : isAfterProgramEnd ? (
            <>
              <h2 className="font-display text-xl font-semibold">No workout scheduled.</h2>
              <p className="mt-2 text-ink-muted">
                Nothing planned for {selectedDayLabel}. Your program ended on{' '}
                {formatDisplayDate(programEnd!)}.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold">Rest day.</h2>
              <p className="mt-2 text-ink-muted">Even Spartans recover.</p>
              {currentPhase && (
                <p className="mt-4 text-sm text-ink-muted">Phase: {currentPhase.name}</p>
              )}
            </>
          )}
        </GreekCard>
      ) : (
        <WorkoutDayView
          program={program}
          date={viewDate}
          dateStr={dateStr}
          workout={workout}
          currentWeek={currentWeek ?? 1}
          currentPhase={currentPhase}
        />
      )}
    </>
  )
}
