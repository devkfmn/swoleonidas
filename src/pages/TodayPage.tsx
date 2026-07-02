import { useMemo } from 'react'
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'
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

function clampToProgramRange(date: Date, startDate: string, endDate: Date): Date {
  const start = startOfDay(parseISO(startDate))
  const end = startOfDay(endDate)
  if (isBefore(date, start)) return start
  if (isAfter(date, end)) return end
  return date
}

export function TodayPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeProgram, loading } = useActiveProgram()
  const today = new Date()

  const program = activeProgram?.program ?? null
  const programEnd = program ? getProgramEndDate(program) : null

  const viewDate = useMemo(() => {
    if (!program || !programEnd) return today
    const parsed = parseViewDate(searchParams.get('date'), today)
    return clampToProgramRange(startOfDay(parsed), program.startDate, programEnd)
  }, [program, programEnd, searchParams, today])

  const dateStr = format(viewDate, 'yyyy-MM-dd')
  const isToday = isSameDay(viewDate, today)

  const scheduled = useMemo(() => {
    if (!program) return null
    return getWorkoutForDate(program, viewDate)
  }, [program, viewDate])

  const currentWeek = program ? getCurrentWeek(program, viewDate) : null
  const currentPhase = program ? getCurrentPhaseForDate(program, viewDate) : null
  const workout = scheduled?.workout ?? null

  const { logMap } = useWeekStatus(program, viewDate)

  const canGoPrev = program
    ? !isSameDay(viewDate, startOfDay(parseISO(program.startDate)))
    : false
  const canGoNext = program && programEnd
    ? !isSameDay(viewDate, startOfDay(programEnd))
    : false

  const setViewDate = (next: Date) => {
    const nextStr = format(next, 'yyyy-MM-dd')
    if (isSameDay(next, today)) {
      setSearchParams({})
    } else {
      setSearchParams({ date: nextStr })
    }
  }

  const pageTitle = isToday ? 'Today' : format(viewDate, 'EEEE, MMMM d')

  if (loading) {
    return <p className="text-ink-muted">Loading...</p>
  }

  if (!activeProgram || !program) {
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

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={`${format(viewDate, 'EEEE, MMMM d, yyyy')} · ${program.programName}`}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <StoneButton
          variant="secondary"
          disabled={!canGoPrev}
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
          if (d === format(today, 'yyyy-MM-dd')) {
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
          <h2 className="font-display text-xl font-semibold">Rest day.</h2>
          <p className="mt-2 text-ink-muted">Even Spartans recover.</p>
          {currentPhase && (
            <p className="mt-4 text-sm text-ink-muted">Phase: {currentPhase.name}</p>
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
