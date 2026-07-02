import { NavLink } from 'react-router-dom'
import { SpartanHelmet } from '../ui/Icons'

const navItems = [
  { to: '/today', label: 'Today' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/programs', label: 'Programs' },
  { to: '/import', label: 'Import' },
  { to: '/settings', label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-stone-border bg-stone-surface md:flex md:flex-col">
      <div className="flex items-center gap-3 border-b border-stone-border px-6 py-5">
        <SpartanHelmet className="h-8 w-8" />
        <div>
          <p className="font-display text-lg font-semibold text-ink">Swoleonidas</p>
          <p className="text-xs text-ink-muted">Fight the day.</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-bronze/10 text-bronze'
                      : 'text-ink-muted hover:bg-stone-elevated hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
