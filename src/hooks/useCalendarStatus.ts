import { useEffect, useMemo, useState } from 'react'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns'
import type { Program } from '../lib/validation/programSchema'
import type { CompletionLog, DayStatus } from '../types/program'
import { getCompletionLogsForRange, subscribeCompletionLogsForRange } from '../lib/firebase/firestore'
import { getDayStatus } from '../lib/schedule/getDayStatus'
import { getWorkoutForDate } from '../lib/schedule/getWorkoutForDate'
import { useAuth } from './useAuth'

export interface CalendarDay {
  date: string
  status: DayStatus
  scheduled: ReturnType<typeof getWorkoutForDate>
  log: CompletionLog | null
}

export function useCalendarStatus(program: Program | null, month: Date) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<CompletionLog[]>([])
  const [loading, setLoading] = useState(false)

  const range = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    }
  }, [month])

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

  const days: CalendarDay[] = useMemo(() => {
    if (!program) return []

    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const today = new Date()
    const logMap = new Map(logs.map((l) => [l.date, l]))

    return eachDayOfInterval({ start, end }).map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const scheduled = getWorkoutForDate(program, date)
      const log = logMap.get(dateStr) ?? null
      const status = getDayStatus(program, date, log, today)
      return { date: dateStr, status, scheduled, log }
    })
  }, [program, month, logs])

  const getDay = (dateStr: string) => days.find((d) => d.date === dateStr) ?? null

  return { days, loading, getDay }
}

export function useCalendarDayDetail(
  program: Program | null,
  dateStr: string | null,
) {
  const { user } = useAuth()
  const [log, setLog] = useState<CompletionLog | null>(null)

  useEffect(() => {
    if (!user || !program || !dateStr) {
      setLog(null)
      return
    }

    getCompletionLogsForRange(user.uid, program.programId, dateStr, dateStr).then(
      (logs) => setLog(logs[0] ?? null),
    )
  }, [user, program, dateStr])

  const scheduled = useMemo(() => {
    if (!program || !dateStr) return null
    return getWorkoutForDate(program, parseISO(dateStr))
  }, [program, dateStr])

  const status = useMemo(() => {
    if (!program || !dateStr) return 'rest' as DayStatus
    return getDayStatus(program, parseISO(dateStr), log)
  }, [program, dateStr, log])

  return { scheduled, log, status }
}
