import { useNavigate } from 'react-router-dom'
import { PhaseTimeline } from '../components/domain/PhaseTimeline'
import { ProgramStatsHero } from '../components/domain/ProgramStatsHero'
import { StreakCard } from '../components/domain/StreakCard'
import { WeeklyAdherenceList } from '../components/domain/WeeklyAdherenceList'
import { EmptyState } from '../components/ui/EmptyState'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { useProgramStats } from '../hooks/useProgramStats'

export function DashboardPage() {
  const navigate = useNavigate()
  const { activeProgram, stats, loading } = useProgramStats()

  if (loading) {
    return <p className="text-ink-muted">Loading...</p>
  }

  if (!activeProgram || !stats) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Program progress and stats" />
        <EmptyState
          title="No active program"
          description="Activate a training program to see your progress, streak, and adherence stats."
          actionLabel="View programs"
          onAction={() => navigate('/programs')}
        />
      </>
    )
  }

  const { program } = activeProgram
  const { totals } = stats

  return (
    <>
      <PageHeader title="Dashboard" subtitle={program.programName} />

      <div className="space-y-4">
        <ProgramStatsHero program={program} stats={stats} />

        <StreakCard
          current={stats.streak.current}
          best={stats.streak.best}
          atRisk={stats.streak.atRisk}
        />

        <GreekCard title="Day totals">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Complete</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-status-complete">
                {totals.complete}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Partial</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-status-partial">
                {totals.partial}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Missed</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-status-missed">
                {totals.missed}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Rest</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-ink-muted">
                {totals.rest}
              </dd>
            </div>
          </dl>
          {totals.minimumVersionDays > 0 && (
            <p className="mt-4 text-center text-xs text-ink-muted">
              {totals.minimumVersionDays} day{totals.minimumVersionDays === 1 ? '' : 's'} using minimum version
            </p>
          )}
        </GreekCard>

        <WeeklyAdherenceList weeks={stats.weeklyAdherence} />

        <PhaseTimeline
          program={program}
          currentPhase={stats.currentPhase}
          currentWeek={stats.currentWeek}
        />

        <div className="flex flex-wrap gap-2 pb-2">
          <StoneButton onClick={() => navigate('/today')}>Go to Today</StoneButton>
          <StoneButton variant="secondary" onClick={() => navigate('/calendar')}>
            View Calendar
          </StoneButton>
        </div>
      </div>
    </>
  )
}
