export type DisplayItem = {
  id: string
  exerciseId: string
  exerciseName: string
  sets: number
  target: number
  unit: string
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
  return (
    <label className="flex items-start gap-3 rounded-lg border border-stone-border bg-stone-elevated/50 p-3 transition-colors hover:bg-stone-elevated">
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
  )
}
