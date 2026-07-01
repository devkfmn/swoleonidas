import { useEffect, useMemo, useState } from 'react'
import { subscribeSettings } from '../lib/firebase/firestore'
import { getCurrentPhaseForDate } from '../lib/schedule/getCurrentPhase'
import { getCurrentWeek } from '../lib/schedule/getCurrentWeek'
import type { UserSettings } from '../types/program'
import { useAuth } from './useAuth'
import { usePrograms } from './usePrograms'

export function useActiveProgram() {
  const { user } = useAuth()
  const { programs, loading: programsLoading } = usePrograms()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSettings(null)
      setSettingsLoading(false)
      return
    }

    setSettingsLoading(true)
    const unsub = subscribeSettings(user.uid, (data) => {
      setSettings(data)
      setSettingsLoading(false)
    })
    return unsub
  }, [user])

  const activeProgram = useMemo(() => {
    const activeId = settings?.activeProgramId
    if (!activeId) {
      const flagged = programs.find((p) => p.isActive)
      return flagged ?? null
    }
    const found = programs.find((p) => p.program.programId === activeId)
    return found ?? null
  }, [programs, settings])

  const today = new Date()
  const currentWeek = activeProgram
    ? getCurrentWeek(activeProgram.program, today)
    : null
  const currentPhase = activeProgram
    ? getCurrentPhaseForDate(activeProgram.program, today)
    : null

  return {
    activeProgram,
    settings,
    currentWeek,
    currentPhase,
    loading: programsLoading || settingsLoading,
  }
}
