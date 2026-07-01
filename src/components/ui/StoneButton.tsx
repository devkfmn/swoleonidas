import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface StoneButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-bronze text-white hover:bg-bronze-dark shadow-sm border border-bronze-dark/30',
  secondary:
    'bg-stone-surface text-ink border border-stone-border hover:bg-stone-elevated',
  ghost: 'bg-transparent text-ink hover:bg-stone-elevated border border-transparent',
  danger: 'bg-status-missed/10 text-status-missed border border-status-missed/30 hover:bg-status-missed/20',
}

export function StoneButton({
  variant = 'primary',
  children,
  fullWidth,
  className = '',
  disabled,
  ...props
}: StoneButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
