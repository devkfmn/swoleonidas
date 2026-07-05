import { useState } from 'react'
import type { Program } from '../../lib/validation/programSchema'
import { validateProgramJson } from '../../lib/validation/validateProgramJson'
import { buildProgramPrompt, canBuildProgramPrompt } from '../../lib/prompt/buildProgramPrompt'
import { exampleProgram } from '../../data/exampleProgram'
import { WEEKDAYS_MONDAY_FIRST, WEEKDAY_LABELS, type Weekday } from '../../lib/schedule/weekdays'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { GreekCard } from '../ui/GreekCard'
import { StoneButton } from '../ui/StoneButton'
import { ValidationErrors } from '../ui/ValidationErrors'

interface CreateProgramPanelProps {
  onImport: (program: Program, mode: 'create' | 'update') => Promise<'created' | 'updated'>
  importing?: boolean
  importError?: string | null
  hasProgram: (programId: string) => boolean
  lastImported: Program | null
  onActivateAndStart: () => void
  onDone: () => void
}

const inputClassName =
  'w-full rounded-lg border border-stone-border bg-stone-surface p-3 text-sm'

export function CreateProgramPanel({
  onImport,
  importing,
  importError,
  hasProgram,
  lastImported,
  onActivateAndStart,
  onDone,
}: CreateProgramPanelProps) {
  const [goal, setGoal] = useState('')
  const [equipment, setEquipment] = useState('')
  const [duration, setDuration] = useState('')
  const [preferredExercises, setPreferredExercises] = useState<string[]>([])
  const [newExercise, setNewExercise] = useState('')
  const [restDays, setRestDays] = useState<Weekday[]>([])
  const [copied, setCopied] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [validated, setValidated] = useState<Program | null>(null)
  const [pendingProgram, setPendingProgram] = useState<Program | null>(null)
  const [confirmUpdate, setConfirmUpdate] = useState(false)

  const promptInput = { goal, equipment, duration, preferredExercises, restDays }
  const promptReady = canBuildProgramPrompt(promptInput)
  const generatedPrompt = promptReady ? buildProgramPrompt(promptInput) : ''

  const handleValidate = () => {
    const result = validateProgramJson(jsonText)
    if (result.success) {
      setErrors([])
      setValidated(result.data)
    } else {
      setErrors(result.errors)
      setValidated(null)
    }
  }

  const runImport = async (program: Program, mode: 'create' | 'update') => {
    try {
      await onImport(program, mode)
      setJsonText('')
      setValidated(null)
      setPendingProgram(null)
      setConfirmUpdate(false)
    } catch {
      // Import errors are shown by the parent via importError
    }
  }

  const handleSave = async () => {
    const result = validateProgramJson(jsonText)
    if (!result.success) {
      setErrors(result.errors)
      setValidated(null)
      return
    }

    setErrors([])
    setValidated(result.data)

    if (hasProgram(result.data.programId)) {
      setPendingProgram(result.data)
      setConfirmUpdate(true)
      return
    }

    await runImport(result.data, 'create')
  }

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleAddExercise = () => {
    const trimmed = newExercise.trim()
    if (!trimmed) return
    setPreferredExercises((prev) => [...prev, trimmed])
    setNewExercise('')
    setCopied(false)
  }

  const handleRemoveExercise = (index: number) => {
    setPreferredExercises((prev) => prev.filter((_, i) => i !== index))
    setCopied(false)
  }

  const toggleRestDay = (day: Weekday) => {
    setRestDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
    setCopied(false)
  }

  return (
    <div className="space-y-6">
      <GreekCard title="Build Program Prompt">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Goal</span>
            <textarea
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value)
                setCopied(false)
              }}
              rows={3}
              className={inputClassName}
              placeholder="e.g. Build strength and lose body fat"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Available Equipment</span>
            <textarea
              value={equipment}
              onChange={(e) => {
                setEquipment(e.target.value)
                setCopied(false)
              }}
              rows={3}
              className={inputClassName}
              placeholder="e.g. Dumbbells, pull-up bar, resistance bands"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink-muted">Duration</span>
            <input
              type="text"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value)
                setCopied(false)
              }}
              className={inputClassName}
              placeholder="e.g. 12 weeks"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm text-ink-muted">Preferred Exercises</span>
            {preferredExercises.length > 0 && (
              <ul className="mb-2 space-y-1">
                {preferredExercises.map((exercise, index) => (
                  <li
                    key={`${exercise}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-stone-elevated px-3 py-2 text-sm"
                  >
                    <span>{exercise}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="text-ink-muted hover:text-ink"
                      aria-label={`Remove ${exercise}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddExercise()
                  }
                }}
                className={inputClassName}
                placeholder="e.g. Push-ups"
              />
              <StoneButton
                type="button"
                variant="secondary"
                onClick={handleAddExercise}
                disabled={!newExercise.trim()}
              >
                Add exercise
              </StoneButton>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm text-ink-muted">Rest Days</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS_MONDAY_FIRST.map((day) => {
                const selected = restDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleRestDay(day)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-bronze bg-bronze/10 text-bronze'
                        : 'border-stone-border bg-stone-surface text-ink-muted hover:border-stone-border hover:text-ink'
                    }`}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Copy this prompt into ChatGPT, review the summary it returns, then paste the JSON below.
        </p>

        {promptReady && (
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-elevated p-3 text-xs">
            {generatedPrompt}
          </pre>
        )}

        <StoneButton
          className="mt-3"
          onClick={handleCopyPrompt}
          disabled={!promptReady}
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </StoneButton>
      </GreekCard>

      <GreekCard title="Paste Program JSON">
        <p className="mb-3 text-sm text-ink-muted">
          Paste only the JSON block from ChatGPT&apos;s response. Only the JSON is validated and saved.
        </p>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value)
            setValidated(null)
            setErrors([])
          }}
          rows={14}
          className="w-full rounded-lg border border-stone-border bg-stone-surface p-3 font-mono text-sm"
          placeholder="Paste your program JSON here..."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <StoneButton
            variant="secondary"
            onClick={() => setJsonText(JSON.stringify(exampleProgram, null, 2))}
          >
            Load Example Program
          </StoneButton>
          <StoneButton variant="secondary" onClick={handleValidate}>
            Validate
          </StoneButton>
          <StoneButton onClick={handleSave} disabled={!jsonText.trim() || importing}>
            {importing ? 'Saving...' : 'Save Program'}
          </StoneButton>
        </div>
      </GreekCard>

      {errors.length > 0 && <ValidationErrors errors={errors} />}

      {importError && <ValidationErrors errors={[importError]} />}

      {validated && (
        <GreekCard title="Preview">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-ink-muted">Name</dt>
              <dd className="font-medium">{validated.programName}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Duration</dt>
              <dd className="font-medium">{validated.durationWeeks} weeks</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Exercises</dt>
              <dd className="font-medium">{validated.exercises.length}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Workouts</dt>
              <dd className="font-medium">{validated.workouts.length}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Phases</dt>
              <dd className="font-medium">{validated.phases.length}</dd>
            </div>
          </dl>
        </GreekCard>
      )}

      {lastImported && (
        <GreekCard className="border-status-complete/30 bg-status-complete/10">
          <p className="text-sm text-status-complete">
            <span className="font-semibold">{lastImported.programName}</span> saved successfully.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StoneButton onClick={onActivateAndStart} disabled={importing}>
              Activate and start
            </StoneButton>
            <StoneButton variant="secondary" onClick={onDone}>
              Done
            </StoneButton>
          </div>
        </GreekCard>
      )}

      <ConfirmDialog
        open={confirmUpdate}
        title="Update existing program?"
        message="A program with this ID already exists. Updating will replace the plan but preserve completion logs."
        confirmLabel="Update program"
        onCancel={() => {
          setConfirmUpdate(false)
          setPendingProgram(null)
        }}
        onConfirm={() => {
          if (pendingProgram) {
            void runImport(pendingProgram, 'update')
          }
        }}
      />
    </div>
  )
}
