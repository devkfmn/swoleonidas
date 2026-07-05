import { useCallback, useEffect, useState } from 'react'
import { parseISO } from 'date-fns'
import type { CompletionLog, CompletionLogItem } from '../types/program'
import type { ResolvedWorkout } from '../lib/schedule/types'
import { isDateEditable } from '../lib/dates/editable'
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
    note: '',
    items: workout.items.map((item) => ({
      exerciseId: item.exerciseId,
      completed: false,
      actual: undefined,
    })),
  }
}

function syncLogWithWorkout(
  log: CompletionLog | null,
  date: string,
  programId: string,
  workout: ResolvedWorkout,
): CompletionLog {
  const base = log ?? buildDefaultLog(date, programId, workout)
  const items: CompletionLogItem[] = workout.items.map((item) => {
    const existing = base.items?.find((i) => i.exerciseId === item.exerciseId)
    return {
      exerciseId: item.exerciseId,
      completed: existing?.completed ?? false,
      actual: existing?.actual,
    }
  })

  return {
    ...base,
    date,
    programId,
    workoutId: workout.id,
    items,
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

  const prepareLog = useCallback((): CompletionLog | null => {
    if (!workout || !programId) return null
    return syncLogWithWorkout(log, date, programId, workout)
  }, [log, workout, programId, date])

  const canEdit = isDateEditable(parseISO(date))

  const persist = useCallback(
    async (next: CompletionLog) => {
      if (!user || !canEdit) return
      await saveCompletionLog(user.uid, next)
    },
    [user, canEdit],
  )

  const toggleExercise = useCallback(
    async (exerciseId: string, completed: boolean, actual?: number) => {
      if (!canEdit) return
      const base = prepareLog()
      if (!base || !workout) return
      const items = base.items.map((item) => {
        if (item.exerciseId !== exerciseId) return item
        const updated: CompletionLogItem = { exerciseId, completed }
        if (actual !== undefined) updated.actual = actual
        return updated
      })
      await persist({ ...base, items })
    },
    [prepareLog, persist, workout, canEdit],
  )

  const setNote = useCallback(
    async (note: string) => {
      if (!canEdit) return
      const base = prepareLog()
      if (!base) return
      await persist({ ...base, note })
    },
    [prepareLog, persist, canEdit],
  )

  const markAllComplete = useCallback(async () => {
    if (!canEdit) return
    const base = prepareLog()
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
  }, [prepareLog, persist, workout, canEdit])

  const resetDay = useCallback(async () => {
    if (!user || !programId || !canEdit) return
    await deleteCompletionLog(user.uid, date, programId)
  }, [user, date, programId, canEdit])

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
    setNote,
    markAllComplete,
    resetDay,
    resetAllForProgram,
  }
}
