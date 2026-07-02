import { useState } from 'react'
import type { Program } from '../../lib/validation/programSchema'
import { validateProgramJson } from '../../lib/validation/validateProgramJson'
import { buildProgramPrompt, canBuildProgramPrompt } from '../../lib/prompt/buildProgramPrompt'
import { exampleProgram } from '../../data/exampleProgram'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { GreekCard } from '../ui/GreekCard'
import { StoneButton } from '../ui/StoneButton'
import { ValidationErrors } from '../ui/ValidationErrors'

interface ImportJsonPanelProps {
  onImport: (program: Program, mode: 'create' | 'update') => Promise<'created' | 'updated'>
  importing?: boolean
  importError?: string | null
  hasProgram: (programId: string) => boolean
  lastImported: Program | null
  onActivateAndStart: () => void
  onViewPrograms: () => void
}

const inputClassName =
  'w-full rounded-lg border border-stone-border bg-stone-surface p-3 text-sm'

export function ImportJsonPanel({
  onImport,
  importing,
  importError,
  hasProgram,
  lastImported,
  onActivateAndStart,
  onViewPrograms,
}: ImportJsonPanelProps) {
  const [goal, setGoal] = useState('')
  const [equipment, setEquipment] = useState('')
  const [duration, setDuration] = useState('')
  const [copied, setCopied] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [validated, setValidated] = useState<Program | null>(null)
  const [pendingProgram, setPendingProgram] = useState<Program | null>(null)
  const [confirmUpdate, setConfirmUpdate] = useState(false)

  const promptInput = { goal, equipment, duration }
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

  const handleImport = async () => {
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

  return (
    <div className="space-y-6">
      <GreekCard title="Create Program Prompt">
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
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Copy this prompt into ChatGPT or another AI, then paste the returned JSON below.
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
          <StoneButton variant="secondary" onClick={() => setJsonText(JSON.stringify(exampleProgram, null, 2))}>
            Load Example Program
          </StoneButton>
          <StoneButton variant="secondary" onClick={handleValidate}>
            Validate
          </StoneButton>
          <StoneButton onClick={handleImport} disabled={!jsonText.trim() || importing}>
            {importing ? 'Importing...' : 'Import'}
          </StoneButton>
        </div>
      </GreekCard>

      {errors.length > 0 && <ValidationErrors errors={errors} />}

      {importError && (
        <ValidationErrors errors={[importError]} />
      )}

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
            <span className="font-semibold">{lastImported.programName}</span> imported successfully.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StoneButton onClick={onActivateAndStart} disabled={importing}>
              Activate and start
            </StoneButton>
            <StoneButton variant="secondary" onClick={onViewPrograms}>
              View programs
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
