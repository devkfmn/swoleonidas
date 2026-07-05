import { extractProgramFromAiResponse } from '../prompt/extractProgramFromAiResponse'
import type { Program } from './programSchema'
import { validateProgramJson } from './validateProgramJson'

export type AiValidationResult =
  | { success: true; data: Program; summary: string | null }
  | { success: false; errors: string[]; summary?: string | null }

export function validateAiProgramResponse(text: string): AiValidationResult {
  const { summary, jsonText } = extractProgramFromAiResponse(text)

  if (!jsonText) {
    return {
      success: false,
      errors: ['Could not find program JSON in the response'],
      summary,
    }
  }

  const result = validateProgramJson(jsonText)
  if (result.success) {
    return { success: true, data: result.data, summary }
  }

  return { success: false, errors: result.errors, summary }
}
