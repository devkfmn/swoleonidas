import { Navigate, Outlet } from 'react-router-dom'
import { AppShell } from './AppShell'
import { LoadingSpinner } from '../ui/Icons'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/" replace />

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/today" replace />

  return <Outlet />
}
