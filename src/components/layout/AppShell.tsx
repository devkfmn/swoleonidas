import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-marble text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">{children}</main>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
