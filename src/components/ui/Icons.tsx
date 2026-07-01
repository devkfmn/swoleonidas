import type { ReactNode } from 'react'

export function SpartanHelmet({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <img
      src="/swoleonidas.png"
      alt=""
      aria-hidden="true"
      className={`object-contain ${className}`}
    />
  )
}

export function LaurelWreath({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <ellipse cx="32" cy="32" rx="22" ry="18" stroke="currentColor" strokeWidth="2" />
      <path d="M14 28c4-8 10-12 18-14M50 28c-4-8-10-12-18-14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ColumnIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 48" fill="none" aria-hidden="true">
      <rect x="8" y="4" width="16" height="4" fill="currentColor" opacity="0.3" />
      <rect x="10" y="8" width="12" height="32" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="40" width="20" height="4" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function GreekKeyDivider({ className = '' }: { className?: string }) {
  return <div className={`greek-key-divider h-3 w-full ${className}`} aria-hidden="true" />
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent" />
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-wide text-ink md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      <GreekKeyDivider className="mt-4" />
    </header>
  )
}
