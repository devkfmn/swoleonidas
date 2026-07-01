import type { ReactNode } from 'react'

interface GreekCardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function GreekCard({ children, className = '', title }: GreekCardProps) {
  return (
    <section className={`stone-tablet rounded-xl p-4 md:p-6 ${className}`}>
      {title && (
        <h2 className="font-display mb-3 text-lg font-semibold text-ink">{title}</h2>
      )}
      {children}
    </section>
  )
}
