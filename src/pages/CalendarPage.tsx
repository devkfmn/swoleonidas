import { useState } from 'react'
import { formatDisplayDateLong } from '../lib/dates/format'
import { CalendarMonth, addMonths, subMonths } from '../components/domain/CalendarMonth'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StatusBadge } from '../components/ui/StatusBadge'
import { StoneButton } from '../components/ui/StoneButton'
import { EmptyState } from '../components/ui/EmptyState'
import { useActiveProgram } from '../hooks/useActiveProgram'
import { useCalendarStatus } from '../hooks/useCalendarStatus'
import { useNavigate } from 'react-router-dom'

export function CalendarPage() {
  const navigate = useNavigate()
  const { activeProgram, loading } = useActiveProgram()
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const program = activeProgram?.program ?? null
  const { days, getDay } = useCalendarStatus(program, month)

  if (loading) return <p className="text-ink-muted">Loading...</p>

  if (!activeProgram) {
    return (
      <>
        <PageHeader title="Calendar" />
        <EmptyState
          title="No active program"
          description="Activate a program to see your training calendar."
          actionLabel="Go to Programs"
          onAction={() => navigate('/programs')}
        />
      </>
    )
  }

  const selected = selectedDate ? getDay(selectedDate) : null

  return (
    <>
      <PageHeader title="Calendar" subtitle={activeProgram.program.programName} />

      <GreekCard>
        <CalendarMonth
          month={month}
          days={days}
          onPrev={() => setMonth(subMonths(month, 1))}
          onNext={() => setMonth(addMonths(month, 1))}
          onSelectDay={setSelectedDate}
        />
      </GreekCard>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-complete" /> Complete
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-partial" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-missed" /> Missed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-muted" /> Rest
        </span>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center">
          <GreekCard className="max-h-[80vh] w-full max-w-lg overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {formatDisplayDateLong(selected.date)}
                </h3>
                <StatusBadge status={selected.status} />
              </div>
              <StoneButton variant="ghost" onClick={() => setSelectedDate(null)}>
                Close
              </StoneButton>
            </div>

            {selected.scheduled.isRestDay ? (
              <p className="mt-4 text-ink-muted">Rest day — no workout scheduled.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="font-medium">{selected.scheduled.workout?.name}</p>
                <ul className="space-y-1 text-sm text-ink-muted">
                  {selected.scheduled.workout?.items.map((item) => {
                    const logItem = selected.log?.items.find(
                      (i) => i.exerciseId === item.exerciseId,
                    )
                    return (
                      <li key={item.id}>
                        {item.exerciseName}: {item.sets}×{item.target} {item.unit}
                        {logItem?.completed ? ' ✓' : ''}
                      </li>
                    )
                  })}
                </ul>
                {selected.log?.note && (
                  <p className="text-sm italic text-ink-muted">"{selected.log.note}"</p>
                )}
                {!selected.scheduled.isRestDay && selected.status !== 'future' && (
                  <StoneButton
                    className="mt-2"
                    onClick={() => navigate(`/today?date=${selected.date}`)}
                  >
                    {selected.status === 'complete' || selected.status === 'partial'
                      ? 'Edit log'
                      : 'Log workout'}
                  </StoneButton>
                )}
              </div>
            )}
          </GreekCard>
        </div>
      )}
    </>
  )
}
