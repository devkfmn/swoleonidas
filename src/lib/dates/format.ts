import { format, isValid, parse, parseISO } from 'date-fns'

/** ISO date keys for storage, URLs, and Firestore. */
export const STORAGE_DATE_FORMAT = 'yyyy-MM-dd'

/** User-facing date format application-wide. */
export const DISPLAY_DATE_FORMAT = 'dd-MM-yyyy'

export const DISPLAY_DATE_LONG_FORMAT = `EEEE, ${DISPLAY_DATE_FORMAT}`

export function toStorageDate(date: Date): string {
  return format(date, STORAGE_DATE_FORMAT)
}

export function formatDisplayDate(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, DISPLAY_DATE_FORMAT)
}

export function formatDisplayDateLong(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, DISPLAY_DATE_LONG_FORMAT)
}

export function parseDisplayDate(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = parse(trimmed, DISPLAY_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : null
}

export function displayDateToStorage(value: string): string | null {
  const parsed = parseDisplayDate(value)
  return parsed ? toStorageDate(parsed) : null
}

export function storageDateToDisplay(value: string): string {
  return formatDisplayDate(value)
}
