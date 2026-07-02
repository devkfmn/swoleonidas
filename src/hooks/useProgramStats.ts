import { useEffect, useMemo, useState } from 'react'
import { addWeeks, format, min, parseISO, startOfDay, subDays } from 'date-fns'
import { subscribeCompletionLogsForRange } from '../lib/firebase/firestore'
import { getProgramStats } from '../lib/stats/getProgramStats'
import type { Program } from '../lib/validation/programSchema'
import { useActiveProgram } from './useActiveProgram'
import { useAuth } from './useAuth'

function getProgramEndDateStr(program: Program): string {
  const start = parseISO(program.startDate)
  const end = subDays(addWeeks(start, program.durationWeeks), 1)
  return format(end, 'yyyy-MM-dd')
}

export function useProgramStats() {
  const { user } = useAuth()
  const { activeProgram, loading: programLoading } = useActiveProgram()
  const [logs, setLogs] = useState<import('../types/program').CompletionLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  const program = activeProgram?.program ?? null
  const today = new Date()

  const range = useMemo(() => {
    if (!program) return null
    const end = format(
      min([startOfDay(today), startOfDay(parseISO(getProgramEndDateStr(program)))]),
      'yyyy-MM-dd',
    )
    return { start: program.startDate, end }
  }, [program, today])

  useEffect(() => {
    if (!user || !program || !range) {
      setLogs([])
      return
    }

    let cancelled = false
    setLogsLoading(true)
    const unsub = subscribeCompletionLogsForRange(
      user.uid,
      program.programId,
      range.start,
      range.end,
      (data) => {
        if (!cancelled) {
          setLogs(data)
          setLogsLoading(false)
        }
      },
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [user, program, range?.start, range?.end])

  const stats = useMemo(() => {
    if (!program) return null
    return getProgramStats(program, logs, today)
  }, [program, logs, today])

  return {
    activeProgram,
    stats,
    loading: programLoading || logsLoading,
  }
}
