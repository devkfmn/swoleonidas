import type { ReactNode } from 'react'
import { StoneButton } from './StoneButton'
import { SpartanHelmet } from './Icons'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 text-bronze">{icon ?? <SpartanHelmet className="h-16 w-16" />}</div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
      {actionLabel && onAction && (
        <StoneButton className="mt-6" onClick={onAction}>
          {actionLabel}
        </StoneButton>
      )}
    </div>
  )
}
