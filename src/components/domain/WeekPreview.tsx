import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from 'date-fns'
import type { CompletionLog } from '../../types/program'
import type { Program } from '../../lib/validation/programSchema'
import { getDayStatus } from '../../lib/schedule/getDayStatus'
import { getWorkoutForDate } from '../../lib/schedule/getWorkoutForDate'
import { DayStatusDot } from './DayStatusDot'
import { GreekCard } from '../ui/GreekCard'

interface WeekPreviewProps {
  program: Program
  selectedDate: Date
  logMap: Map<string, CompletionLog>
  onSelectDate: (dateStr: string) => void
}

export function WeekPreview({
  program,
  selectedDate,
  logMap,
  onSelectDate,
}: WeekPreviewProps) {
  const today = new Date()
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <GreekCard title="This week" className="mb-6">
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const scheduled = getWorkoutForDate(program, date)
          const log = logMap.get(dateStr) ?? null
          const status = getDayStatus(program, date, log, today)
          const isSelected = isSameDay(date, selectedDate)
          const label = scheduled.isRestDay
            ? 'Rest'
            : (scheduled.workout?.name ?? 'Rest')

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors ${
                isSelected
                  ? 'bg-bronze/10 ring-1 ring-bronze'
                  : 'hover:bg-stone-elevated'
              }`}
            >
              <span className="text-[10px] font-medium uppercase text-ink-muted">
                {format(date, 'EEE')}
              </span>
              <DayStatusDot status={status} />
              <span className="line-clamp-2 text-[10px] leading-tight text-ink-muted">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </GreekCard>
  )
}
