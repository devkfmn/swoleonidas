import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'
import { isFirebaseConfigured } from './lib/firebase/config'
import { LandingPage } from './pages/LandingPage'
import { FirebaseSetupPage } from './pages/FirebaseSetupPage'
import { TodayPage } from './pages/TodayPage'
import { CalendarPage } from './pages/CalendarPage'
import { ProgramsPage } from './pages/ProgramsPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { CreateProgramPage } from './pages/CreateProgramPage'
import { SettingsPage } from './pages/SettingsPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupPage />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/today" element={<TodayPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:programId" element={<ProgramDetailPage />} />
            <Route path="/create-program" element={<CreateProgramPage />} />
            <Route path="/import" element={<Navigate to="/create-program" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
