import { useState } from 'react'

export type DisplayItem = {
  id: string
  exerciseId: string
  exerciseName: string
  sets: number
  target: number
  unit: string
  description?: string
  equipment?: string
}

interface ExerciseChecklistItemProps {
  item: DisplayItem
  completed: boolean
  actual?: number
  onToggle: (completed: boolean) => void
  onActualChange?: (actual: number) => void
}

export function ExerciseChecklistItem({
  item,
  completed,
  actual,
  onToggle,
  onActualChange,
}: ExerciseChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = Boolean(item.description)

  return (
    <div className="rounded-lg border border-stone-border bg-stone-elevated/50 p-3 transition-colors hover:bg-stone-elevated">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-stone-border text-bronze focus:ring-bronze"
        />
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${completed ? 'text-ink line-through opacity-70' : 'text-ink'}`}>
            {item.exerciseName}
          </p>
          <p className="text-sm text-ink-muted">
            {item.sets} × {item.target} {item.unit}
          </p>
          {item.equipment && (
            <span className="mt-1 inline-block rounded bg-stone-surface px-2 py-0.5 text-xs text-ink-muted">
              {item.equipment}
            </span>
          )}
          {onActualChange && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-ink-muted">Actual:</span>
              <input
                type="number"
                min={0}
                value={actual ?? ''}
                onChange={(e) => onActualChange(Number(e.target.value))}
                className="w-20 rounded border border-stone-border bg-stone-surface px-2 py-1 text-sm"
                placeholder={String(item.target)}
              />
            </div>
          )}
        </div>
      </label>
      {hasDetails && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 ml-8 text-xs text-bronze hover:underline"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      )}
      {expanded && item.description && (
        <p className="mt-2 ml-8 text-sm text-ink-muted">{item.description}</p>
      )}
    </div>
  )
}
