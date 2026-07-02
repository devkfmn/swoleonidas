import type { WeeklyAdherenceRow } from '../../lib/stats/getProgramStats'
import { GreekCard } from '../ui/GreekCard'
import { ProgressBar } from '../ui/ProgressRing'

interface WeeklyAdherenceListProps {
  weeks: WeeklyAdherenceRow[]
}

export function WeeklyAdherenceList({ weeks }: WeeklyAdherenceListProps) {
  if (weeks.length === 0) {
    return (
      <GreekCard title="Weekly adherence">
        <p className="text-sm text-ink-muted">No workout weeks recorded yet.</p>
      </GreekCard>
    )
  }

  return (
    <GreekCard title="Weekly adherence">
      <div className="space-y-4">
        {[...weeks].reverse().map((week) => {
          const percent =
            week.scheduled > 0
              ? Math.round((week.completed / week.scheduled) * 100)
              : 0
          return (
            <div key={week.weekNumber}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-ink">Week {week.weekNumber}</span>
                <span className="text-ink-muted">
                  {week.completed}/{week.scheduled}
                  {week.partial > 0 && (
                    <span className="ml-1 text-status-partial">({week.partial} partial)</span>
                  )}
                </span>
              </div>
              <ProgressBar percentage={percent} />
            </div>
          )
        })}
      </div>
    </GreekCard>
  )
}
