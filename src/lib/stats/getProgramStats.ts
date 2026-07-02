import {
  eachDayOfInterval,
  format,
  min,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns'
import type { CompletionLog } from '../../types/program'
import type { Phase, Program } from '../validation/programSchema'
import { getCurrentPhaseForDate } from '../schedule/getCurrentPhase'
import { getCurrentWeek } from '../schedule/getCurrentWeek'
import {
  getPhaseTimelineProgress,
  getProgramEndDate,
  getProgramTimelineProgress,
} from '../schedule/getTimelineProgress'
import { getDayStatus } from '../schedule/getDayStatus'
import { getWorkoutForDate } from '../schedule/getWorkoutForDate'

export interface WeeklyAdherenceRow {
  weekNumber: number
  scheduled: number
  completed: number
  partial: number
  missed: number
}

export interface ProgramStats {
  timelinePercent: number
  timelineDay: number
  timelineTotalDays: number
  phasePercent: number | null
  phaseDay: number | null
  phaseTotalDays: number | null
  adherencePercent: number
  currentWeek: number
  currentPhase: Phase | null
  streak: { current: number; best: number; atRisk: boolean }
  totals: {
    complete: number
    partial: number
    missed: number
    rest: number
  }
  weeklyAdherence: WeeklyAdherenceRow[]
}

const WEEKLY_ADHERENCE_LIMIT = 8

function isWorkoutDay(program: Program, date: Date): boolean {
  const scheduled = getWorkoutForDate(program, date)
  return !scheduled.isRestDay && scheduled.workout !== null
}

function computeStreak(
  program: Program,
  logMap: Map<string, CompletionLog>,
  today: Date,
): { current: number; best: number; atRisk: boolean } {
  const start = parseISO(program.startDate)
  const end = min([startOfDay(today), startOfDay(getProgramEndDate(program))])

  const getStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return getDayStatus(program, date, logMap.get(dateStr) ?? null, today)
  }

  const todayStatus = getStatus(today)
  const todayIsWorkout = isWorkoutDay(program, today)
  const atRisk =
    todayIsWorkout && todayStatus !== 'complete' && todayStatus !== 'future'

  let current = 0
  let cursor = atRisk ? subDays(today, 1) : today

  while (cursor >= start) {
    if (!isWorkoutDay(program, cursor)) {
      cursor = subDays(cursor, 1)
      continue
    }

    const status = getStatus(cursor)
    if (status === 'future') {
      cursor = subDays(cursor, 1)
      continue
    }

    if (status === 'complete') {
      current++
      cursor = subDays(cursor, 1)
    } else {
      break
    }
  }

  let best = 0
  let run = 0

  for (const date of eachDayOfInterval({ start, end })) {
    if (!isWorkoutDay(program, date)) continue

    const status = getStatus(date)
    if (status === 'future') continue

    if (status === 'complete') {
      run++
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  return { current, best, atRisk }
}

export function getProgramStats(
  program: Program,
  logs: CompletionLog[],
  today: Date = new Date(),
): ProgramStats {
  const logMap = new Map(logs.map((l) => [l.date, l]))
  const start = parseISO(program.startDate)
  const end = min([startOfDay(today), startOfDay(getProgramEndDate(program))])
  const currentWeek = getCurrentWeek(program, today)
  const currentPhase = getCurrentPhaseForDate(program, today)
  const programTimeline = getProgramTimelineProgress(program, today)
  const phaseTimeline = getPhaseTimelineProgress(program, currentPhase, today)

  const totals = {
    complete: 0,
    partial: 0,
    missed: 0,
    rest: 0,
  }

  const weekMap = new Map<number, WeeklyAdherenceRow>()
  let workoutDaysPast = 0
  let workoutDaysComplete = 0

  if (start <= end) {
    for (const date of eachDayOfInterval({ start, end })) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const log = logMap.get(dateStr) ?? null
      const status = getDayStatus(program, date, log, today)

      if (status === 'future') continue

      if (status === 'complete') totals.complete++
      else if (status === 'partial') totals.partial++
      else if (status === 'missed') totals.missed++
      else if (status === 'rest') totals.rest++

      if (isWorkoutDay(program, date)) {
        workoutDaysPast++
        if (status === 'complete') workoutDaysComplete++

        const weekNumber = getCurrentWeek(program, date)
        const row = weekMap.get(weekNumber) ?? {
          weekNumber,
          scheduled: 0,
          completed: 0,
          partial: 0,
          missed: 0,
        }
        row.scheduled++
        if (status === 'complete') row.completed++
        else if (status === 'partial') row.partial++
        else if (status === 'missed') row.missed++
        weekMap.set(weekNumber, row)
      }
    }
  }

  const adherencePercent =
    workoutDaysPast > 0
      ? Math.round((workoutDaysComplete / workoutDaysPast) * 100)
      : 0

  const weeklyAdherence = [...weekMap.values()]
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .slice(0, WEEKLY_ADHERENCE_LIMIT)
    .sort((a, b) => a.weekNumber - b.weekNumber)

  const streak = computeStreak(program, logMap, today)

  return {
    timelinePercent: programTimeline.percent,
    timelineDay: programTimeline.currentDay,
    timelineTotalDays: programTimeline.totalDays,
    phasePercent: phaseTimeline?.percent ?? null,
    phaseDay: phaseTimeline?.currentDay ?? null,
    phaseTotalDays: phaseTimeline?.totalDays ?? null,
    adherencePercent,
    currentWeek,
    currentPhase,
    streak,
    totals,
    weeklyAdherence,
  }
}
