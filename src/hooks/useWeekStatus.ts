import { useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import type { CompletionLog } from '../types/program'
import type { Program } from '../lib/validation/programSchema'
import { subscribeCompletionLogsForRange } from '../lib/firebase/firestore'
import { useAuth } from './useAuth'

export function useWeekStatus(program: Program | null, anchorDate: Date) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<CompletionLog[]>([])
  const [loading, setLoading] = useState(false)

  const range = useMemo(() => {
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 })
    const end = endOfWeek(anchorDate, { weekStartsOn: 1 })
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    }
  }, [anchorDate])

  useEffect(() => {
    if (!user || !program) {
      setLogs([])
      return
    }

    let cancelled = false
    setLoading(true)
    const unsub = subscribeCompletionLogsForRange(
      user.uid,
      program.programId,
      range.start,
      range.end,
      (data) => {
        if (!cancelled) {
          setLogs(data)
          setLoading(false)
        }
      },
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [user, program, range.start, range.end])

  const logMap = useMemo(() => new Map(logs.map((l) => [l.date, l])), [logs])

  return { logMap, loading, range }
}
