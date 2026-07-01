import type { DayStatus } from '../../types/program'

const dotColors: Record<DayStatus, string> = {
  complete: 'bg-status-complete',
  partial: 'bg-status-partial',
  missed: 'bg-status-missed',
  rest: 'bg-stone-muted',
  future: 'bg-stone-elevated border-2 border-dashed border-stone-border',
  today: 'bg-bronze ring-2 ring-blue-400 ring-offset-1',
  planned: 'bg-stone-elevated border border-stone-border',
}

export function DayStatusDot({
  status,
  isToday,
  className = '',
}: {
  status: DayStatus
  isToday?: boolean
  className?: string
}) {
  const effectiveStatus = isToday && status !== 'rest' ? 'today' : status
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[effectiveStatus]} ${className}`}
      title={effectiveStatus}
    />
  )
}
