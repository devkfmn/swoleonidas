import { z } from 'zod'
import { programSchema, type Program } from './programSchema'

export type ValidationResult =
  | { success: true; data: Program }
  | { success: false; errors: string[] }

function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
    return `${path}: ${issue.message}`
  })
}

export function validateProgramJson(jsonString: string): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { success: false, errors: ['Invalid JSON: could not parse the input'] }
  }

  const result = programSchema.safeParse(parsed)
  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: formatZodErrors(result.error) }
}

export function validateProgramObject(data: unknown): ValidationResult {
  const result = programSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: formatZodErrors(result.error) }
}
