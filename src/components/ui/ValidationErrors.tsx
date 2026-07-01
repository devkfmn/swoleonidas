interface ValidationErrorsProps {
  errors: string[]
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null

  return (
    <div className="rounded-lg border border-status-missed/30 bg-status-missed/10 p-4">
      <h4 className="text-sm font-semibold text-status-missed">Validation failed</h4>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-status-missed/90">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
