import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { GreekCard } from '../components/ui/GreekCard'
import { PageHeader } from '../components/ui/Icons'
import { StoneButton } from '../components/ui/StoneButton'
import { usePrograms } from '../hooks/usePrograms'
import { formatFirebaseError } from '../lib/firebase/utils'
import {
  DISPLAY_DATE_FORMAT,
  displayDateToStorage,
  formatDisplayDate,
  storageDateToDisplay,
} from '../lib/dates/format'

export function ProgramDetailPage() {
  const navigate = useNavigate()
  const { programId } = useParams<{ programId: string }>()
  const { programs, loading, updateStartDate, duplicateProgram } = usePrograms()
  const [showJson, setShowJson] = useState(false)
  const [startDateDraft, setStartDateDraft] = useState('')
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateId, setDuplicateId] = useState('')
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateStartDate, setDuplicateStartDate] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
  const startDateInput = startDateDraft || storageDateToDisplay(program.startDate)
  const parsedStartDateDraft = startDateDraft ? displayDateToStorage(startDateDraft) : null
  const effectiveStartDate = parsedStartDateDraft ?? program.startDate

  const openDuplicateDialog = () => {
    setDuplicateId(`${program.programId}-copy`)
    setDuplicateName(`${program.programName} (Copy)`)
    setDuplicateStartDate(storageDateToDisplay(program.startDate))
    setActionError(null)
    setDuplicateOpen(true)
  }

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
            <dd className="font-medium">{formatDisplayDate(program.startDate)}</dd>
          </div>
        </dl>
      </GreekCard>

      <GreekCard title="Program actions" className="mb-4">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Change start date</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={startDateInput}
                onChange={(e) => setStartDateDraft(e.target.value)}
                placeholder={DISPLAY_DATE_FORMAT.toLowerCase()}
                className="rounded-lg border border-stone-border bg-stone-surface px-3 py-2 text-sm"
              />
              <StoneButton
                variant="secondary"
                disabled={saving || effectiveStartDate === program.startDate}
                onClick={async () => {
                  const storageDate = displayDateToStorage(startDateInput)
                  if (!storageDate) {
                    setActionError(`Invalid date. Use ${DISPLAY_DATE_FORMAT.toLowerCase()}.`)
                    return
                  }
                  setSaving(true)
                  setActionError(null)
                  try {
                    await updateStartDate(program.programId, storageDate)
                    setStartDateDraft('')
                  } catch (error) {
                    setActionError(formatFirebaseError(error))
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Save start date
              </StoneButton>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Completion logs stay on calendar dates; the schedule shifts relative to the new start.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StoneButton variant="secondary" onClick={openDuplicateDialog}>
              Duplicate program
            </StoneButton>
            <Link to="/programs" state={{ showCreate: true, updateProgramId: program.programId }}>
              <StoneButton variant="secondary">Update program</StoneButton>
            </Link>
          </div>

          {actionError && <p className="text-sm text-status-missed">{actionError}</p>}
        </div>
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

      <ConfirmDialog
        open={duplicateOpen}
        title="Duplicate program?"
        message="Creates a new program with a fresh copy of the plan. Completion logs are not copied."
        confirmLabel="Duplicate"
        onCancel={() => setDuplicateOpen(false)}
        onConfirm={async () => {
          const storageDate = displayDateToStorage(duplicateStartDate)
          if (!storageDate) {
            setActionError(`Invalid date. Use ${DISPLAY_DATE_FORMAT.toLowerCase()}.`)
            return
          }
          setSaving(true)
          setActionError(null)
          try {
            const duplicated = await duplicateProgram(
              program.programId,
              duplicateId.trim(),
              storageDate,
              duplicateName.trim() || undefined,
            )
            setDuplicateOpen(false)
            navigate(`/programs/${duplicated.programId}`)
          } catch (error) {
            setActionError(formatFirebaseError(error))
          } finally {
            setSaving(false)
          }
        }}
      >
        <div className="mt-4 space-y-3 text-left">
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">New program ID</span>
            <input
              type="text"
              value={duplicateId}
              onChange={(e) => setDuplicateId(e.target.value)}
              className="w-full rounded-lg border border-stone-border bg-stone-surface px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Program name</span>
            <input
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              className="w-full rounded-lg border border-stone-border bg-stone-surface px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Start date</span>
            <input
              type="text"
              inputMode="numeric"
              value={duplicateStartDate}
              onChange={(e) => setDuplicateStartDate(e.target.value)}
              placeholder={DISPLAY_DATE_FORMAT.toLowerCase()}
              className="w-full rounded-lg border border-stone-border bg-stone-surface px-3 py-2 text-sm"
            />
          </label>
        </div>
      </ConfirmDialog>
    </>
  )
}
