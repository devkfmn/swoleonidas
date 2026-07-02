import { LaurelWreath } from '../ui/Icons'
import { GreekCard } from '../ui/GreekCard'

interface StreakCardProps {
  current: number
  best: number
  atRisk: boolean
}

export function StreakCard({ current, best, atRisk }: StreakCardProps) {
  return (
    <GreekCard>
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-bronze">
          <LaurelWreath className="h-14 w-14" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-muted">Workout streak</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <p className="font-display text-3xl font-bold text-ink">
              {current}
              <span className="ml-1 text-base font-normal text-ink-muted">
                {current === 1 ? 'day' : 'days'}
              </span>
            </p>
            <p className="text-sm text-ink-muted">
              Best: <span className="font-semibold text-ink">{best}</span>
            </p>
          </div>
          {atRisk && current > 0 && (
            <p className="mt-2 text-sm text-bronze">Complete today to extend your streak.</p>
          )}
          {atRisk && current === 0 && (
            <p className="mt-2 text-sm text-ink-muted">Complete today&apos;s workout to start a streak.</p>
          )}
        </div>
      </div>
    </GreekCard>
  )
}
