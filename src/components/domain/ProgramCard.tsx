import { Link } from 'react-router-dom'
import type { StoredProgram } from '../../types/program'
import { GreekCard } from '../ui/GreekCard'
import { StatusBadge } from '../ui/StatusBadge'
import { StoneButton } from '../ui/StoneButton'
import { getCurrentWeek } from '../../lib/schedule/getCurrentWeek'
import { getCurrentPhaseForDate } from '../../lib/schedule/getCurrentPhase'

interface ProgramCardProps {
  stored: StoredProgram
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
}

export function ProgramCard({
  stored,
  onActivate,
  onDeactivate,
  onDelete,
}: ProgramCardProps) {
  const { program, isActive } = stored
  const today = new Date()
  const week = isActive ? getCurrentWeek(program, today) : null
  const phase = isActive ? getCurrentPhaseForDate(program, today) : null

  return (
    <GreekCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{program.programName}</h3>
          <p className="mt-1 text-sm text-ink-muted">{program.goal}</p>
        </div>
        <StatusBadge status={isActive ? 'active' : 'inactive'} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-ink-muted">Type</dt>
          <dd className="font-medium capitalize">{program.programType}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Duration</dt>
          <dd className="font-medium">{program.durationWeeks} weeks</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Start</dt>
          <dd className="font-medium">{program.startDate}</dd>
        </div>
        {isActive && week && (
          <div>
            <dt className="text-ink-muted">Current</dt>
            <dd className="font-medium">
              Week {week}
              {phase ? ` · ${phase.name}` : ''}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/programs/${program.programId}`}>
          <StoneButton variant="secondary">View details</StoneButton>
        </Link>
        {isActive ? (
          <StoneButton variant="ghost" onClick={onDeactivate}>
            Deactivate
          </StoneButton>
        ) : (
          <StoneButton onClick={onActivate}>Activate</StoneButton>
        )}
        <StoneButton variant="danger" onClick={onDelete}>
          Delete
        </StoneButton>
      </div>
    </GreekCard>
  )
}
