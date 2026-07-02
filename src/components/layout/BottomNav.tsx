import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/today', label: 'Today', icon: '⚔' },
  { to: '/dashboard', label: 'Dashboard', icon: '🏛' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/programs', label: 'Programs', icon: '📜' },
  { to: '/import', label: 'Import', icon: '📥' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-border bg-stone-surface/95 backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around px-1 py-2">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-bronze' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
