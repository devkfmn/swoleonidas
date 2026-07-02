import type { Program } from '../../lib/validation/programSchema'
import type { ProgramStats } from '../../lib/stats/getProgramStats'
import { GreekCard } from '../ui/GreekCard'
import { ProgressBar, ProgressRing } from '../ui/ProgressRing'

interface ProgramStatsHeroProps {
  program: Program
  stats: ProgramStats
}

export function ProgramStatsHero({ program, stats }: ProgramStatsHeroProps) {
  return (
    <GreekCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-ink">{program.programName}</h2>
          <p className="mt-1 text-sm text-ink-muted">{program.goal}</p>
          <p className="mt-3 text-sm text-ink-muted">
            Week {stats.currentWeek} of {program.durationWeeks}
            {stats.currentPhase ? ` · ${stats.currentPhase.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <ProgressRing percentage={stats.adherencePercent} size={88} />
            <p className="mt-1 text-xs text-ink-muted">Adherence</p>
          </div>
          <div className="text-center">
            <ProgressRing percentage={stats.timelinePercent} size={88} strokeWidth={6} />
            <p className="mt-1 text-xs text-ink-muted">Timeline</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-ink-muted">
          <span>Program timeline</span>
          <span>{stats.timelinePercent}%</span>
        </div>
        <ProgressBar percentage={stats.timelinePercent} />
      </div>
    </GreekCard>
  )
}
