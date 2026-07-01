import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { usePrograms } from '../hooks/usePrograms'

export function ProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>()
  const { programs, loading } = usePrograms()
  const [showJson, setShowJson] = useState(false)

  const stored = programs.find((p) => p.program.programId === programId)

  if (loading) return <p className="text-ink-muted">Loading...</p>
  if (!stored) {
    return (
      <div>
        <p className="text-ink-muted">Program not found.</p>
        <Link to="/programs">
          <StoneButton variant="secondary" className="mt-4">
            Back to Programs
          </StoneButton>
        </Link>
      </div>
    )
  }

  const { program } = stored

  return (
    <>
      <PageHeader title={program.programName} subtitle={program.goal} />

      <GreekCard title="Overview" className="mb-4">
        <p className="text-sm text-ink-muted">{program.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
        </dl>
      </GreekCard>

      <GreekCard title="Phases" className="mb-4">
        <ul className="space-y-3">
          {program.phases.map((phase) => (
            <li key={phase.id} className="rounded-lg border border-stone-border p-3">
              <p className="font-medium">{phase.name}</p>
              <p className="text-sm text-ink-muted">
                Weeks {phase.startWeek}–{phase.endWeek}
              </p>
              {phase.description && (
                <p className="mt-1 text-sm text-ink-muted">{phase.description}</p>
              )}
              <ul className="mt-2 text-xs text-ink-muted">
                {phase.schedule.map((entry, i) => (
                  <li key={i}>
                    {entry.days.join(', ')} → {entry.workoutId}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </GreekCard>

      <GreekCard title="Workouts" className="mb-4">
        <ul className="space-y-3">
          {program.workouts.map((workout) => (
            <li key={workout.id} className="rounded-lg border border-stone-border p-3">
              <p className="font-medium">{workout.name}</p>
              <p className="text-sm text-ink-muted">{workout.items.length} exercises</p>
            </li>
          ))}
        </ul>
      </GreekCard>

      <GreekCard title="Exercises" className="mb-4">
        <ul className="space-y-2 text-sm">
          {program.exercises.map((ex) => (
            <li key={ex.id}>
              <span className="font-medium">{ex.name}</span>
              <span className="text-ink-muted"> · {ex.category} · {ex.unit}</span>
            </li>
          ))}
        </ul>
      </GreekCard>

      <GreekCard title="Raw JSON">
        <StoneButton variant="secondary" onClick={() => setShowJson(!showJson)}>
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </StoneButton>
        {showJson && (
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-stone-elevated p-3 text-xs">
            {JSON.stringify(program, null, 2)}
          </pre>
        )}
      </GreekCard>

      <Link to="/programs" className="mt-6 inline-block">
        <StoneButton variant="ghost">← Back to Programs</StoneButton>
      </Link>
    </>
  )
}
