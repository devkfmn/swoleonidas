import type { DayStatus } from '../../types/program'

const statusStyles: Record<string, string> = {
  complete: 'bg-status-complete/15 text-status-complete border-status-complete/30',
  partial: 'bg-status-partial/15 text-status-partial border-status-partial/30',
  missed: 'bg-status-missed/15 text-status-missed border-status-missed/30',
  rest: 'bg-stone-elevated text-ink-muted border-stone-border',
  future: 'bg-blue-50 text-blue-700 border-blue-200',
  today: 'bg-bronze/15 text-bronze border-bronze/30',
  planned: 'bg-stone-elevated text-ink-muted border-stone-border',
  active: 'bg-bronze/15 text-bronze border-bronze/30',
  inactive: 'bg-stone-elevated text-ink-muted border-stone-border',
}

const statusLabels: Record<string, string> = {
  complete: 'Complete',
  partial: 'Partial',
  missed: 'Missed',
  rest: 'Rest',
  future: 'Planned',
  today: 'Today',
  planned: 'Planned',
  active: 'Active',
  inactive: 'Inactive',
}

export function StatusBadge({ status }: { status: DayStatus | 'active' | 'inactive' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusStyles[status] ?? statusStyles.planned}`}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}
