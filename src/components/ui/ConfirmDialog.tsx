import type { ReactNode } from 'react'
import { StoneButton } from './StoneButton'
import { GreekCard } from './GreekCard'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive,
  children,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <GreekCard className="w-full max-w-md shadow-xl">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        {children}
        <div className="mt-6 flex gap-3">
          <StoneButton variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </StoneButton>
          <StoneButton
            variant={destructive ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </StoneButton>
        </div>
      </GreekCard>
    </div>
  )
}
