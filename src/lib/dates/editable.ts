import { isAfter, startOfDay } from 'date-fns'

export function isDateEditable(date: Date, today: Date = new Date()): boolean {
  return !isAfter(startOfDay(date), startOfDay(today))
}
