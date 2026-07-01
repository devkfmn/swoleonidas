import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import type { CalendarDay } from '../../hooks/useCalendarStatus'
import { DayStatusDot } from './DayStatusDot'
import { StoneButton } from '../ui/StoneButton'

interface CalendarMonthProps {
  month: Date
  days: CalendarDay[]
  onPrev: () => void
  onNext: () => void
  onSelectDay: (date: string) => void
}

export function CalendarMonth({
  month,
  days,
  onPrev,
  onNext,
  onSelectDay,
}: CalendarMonthProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const today = new Date()
  const dayMap = new Map(days.map((d) => [d.date, d]))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <StoneButton variant="secondary" onClick={onPrev}>
          ←
        </StoneButton>
        <h2 className="font-display text-lg font-semibold">{format(month, 'MMMM yyyy')}</h2>
        <StoneButton variant="secondary" onClick={onNext}>
          →
        </StoneButton>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-muted">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayData = dayMap.get(dateStr)
          const inMonth = isSameMonth(date, month)
          const isToday = isSameDay(date, today)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => inMonth && onSelectDay(dateStr)}
              disabled={!inMonth}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg border p-1 transition-colors ${
                inMonth
                  ? 'border-stone-border bg-stone-surface hover:bg-stone-elevated'
                  : 'border-transparent opacity-30'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
            >
              <span className="text-sm font-medium">{format(date, 'd')}</span>
              {inMonth && dayData && (
                <DayStatusDot status={dayData.status} className="mt-1" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { addMonths, subMonths, parseISO }
