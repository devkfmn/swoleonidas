import { useCallback, useEffect, useState } from 'react'
import type { CompletionLog, CompletionLogItem } from '../types/program'
import type { ResolvedWorkout } from '../lib/schedule/types'
import {
  deleteCompletionLog,
  resetAllLogsForProgram,
  saveCompletionLog,
  subscribeCompletionLog,
} from '../lib/firebase/firestore'
import { useAuth } from './useAuth'

function buildDefaultLog(
  date: string,
  programId: string,
  workout: ResolvedWorkout,
): CompletionLog {
  return {
    date,
    programId,
    workoutId: workout.id,
    usedMinimumVersion: false,
    note: '',
    items: workout.items.map((item) => ({
      exerciseId: item.exerciseId,
      completed: false,
      actual: undefined,
    })),
  }
}

export function useCompletionLog(
  date: string,
  programId: string | null,
  workout: ResolvedWorkout | null,
) {
  const { user } = useAuth()
  const [log, setLog] = useState<CompletionLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !programId) {
      setLog(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeCompletionLog(user.uid, date, programId, (data) => {
      setLog(data)
      setLoading(false)
    })
    return unsub
  }, [user, date, programId])

  const ensureLog = useCallback((): CompletionLog | null => {
    if (!workout || !programId) return null
    if (log) return log
    return buildDefaultLog(date, programId, workout)
  }, [log, workout, programId, date])

  const persist = useCallback(
    async (next: CompletionLog) => {
      if (!user) return
      await saveCompletionLog(user.uid, next)
    },
    [user],
  )

  const toggleExercise = useCallback(
    async (exerciseId: string, completed: boolean, actual?: number) => {
      const base = ensureLog()
      if (!base) return
      const items: CompletionLogItem[] = base.items.map((item) =>
        item.exerciseId === exerciseId ? { ...item, completed, actual } : item,
      )
      await persist({ ...base, items })
    },
    [ensureLog, persist],
  )

  const setMinimumVersion = useCallback(
    async (used: boolean) => {
      const base = ensureLog()
      if (!base || !workout) return
      await persist({ ...base, usedMinimumVersion: used })
    },
    [ensureLog, persist, workout],
  )

  const setNote = useCallback(
    async (note: string) => {
      const base = ensureLog()
      if (!base) return
      await persist({ ...base, note })
    },
    [ensureLog, persist],
  )

  const markAllComplete = useCallback(async () => {
    const base = ensureLog()
    if (!base || !workout) return
    const items = workout.items.map((item) => {
      const existing = base.items.find((i) => i.exerciseId === item.exerciseId)
      return {
        exerciseId: item.exerciseId,
        completed: true,
        actual: existing?.actual ?? item.target,
      }
    })
    await persist({ ...base, items })
  }, [ensureLog, persist, workout])

  const resetDay = useCallback(async () => {
    if (!user || !programId) return
    await deleteCompletionLog(user.uid, date, programId)
  }, [user, date, programId])

  const resetAllForProgram = useCallback(
    async (pid: string) => {
      if (!user) return
      await resetAllLogsForProgram(user.uid, pid)
    },
    [user],
  )

  return {
    log,
    loading,
    toggleExercise,
    setMinimumVersion,
    setNote,
    markAllComplete,
    resetDay,
    resetAllForProgram,
  }
}
