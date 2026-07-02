import type { Phase, Program } from '../../lib/validation/programSchema'
import { GreekCard } from '../ui/GreekCard'

interface PhaseTimelineProps {
  program: Program
  currentPhase: Phase | null
  currentWeek: number
}

export function PhaseTimeline({ program, currentPhase, currentWeek }: PhaseTimelineProps) {
  if (program.phases.length === 0) return null

  return (
    <GreekCard title="Phases">
      <div className="flex gap-1">
        {program.phases.map((phase) => {
          const weekSpan = phase.endWeek - phase.startWeek + 1
          const isCurrent = currentPhase?.id === phase.id
          return (
            <div
              key={phase.id}
              className="flex flex-col items-center"
              style={{ flex: weekSpan }}
            >
              <div
                className={`h-2 w-full rounded-full transition-colors ${
                  isCurrent ? 'bg-bronze' : 'bg-stone-border'
                }`}
                title={`${phase.name} (weeks ${phase.startWeek}–${phase.endWeek})`}
              />
              <p
                className={`mt-2 text-center text-xs leading-tight ${
                  isCurrent ? 'font-semibold text-bronze' : 'text-ink-muted'
                }`}
              >
                {phase.name}
              </p>
            </div>
          )
        })}
      </div>
      {currentPhase && (
        <p className="mt-3 text-center text-xs text-ink-muted">
          Week {currentWeek} · {currentPhase.name}
        </p>
      )}
    </GreekCard>
  )
}
