import type { DayStatus } from '../../types/program'

const dotColors: Record<DayStatus, string> = {
  complete: 'bg-status-complete',
  partial: 'bg-status-partial',
  missed: 'bg-status-missed',
  rest: 'bg-stone-muted',
  future: 'bg-stone-elevated border-2 border-dashed border-stone-border',
  today: 'bg-bronze',
  planned: 'bg-stone-elevated border border-stone-border',
}

export function DayStatusDot({
  status,
  className = '',
}: {
  status: DayStatus
  className?: string
}) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[status]} ${className}`}
      title={status}
    />
  )
}
