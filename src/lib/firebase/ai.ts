import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from 'firebase/ai'
import { buildProgramPrompt, canBuildProgramPrompt, type ProgramPromptInput } from '../prompt/buildProgramPrompt'
import { validateAiProgramResponse } from '../validation/validateAiProgramResponse'
import type { Program } from '../validation/programSchema'
import { getFirebaseApp } from './config'

const MODEL_ID = 'gemini-2.5-flash'
const MAX_OUTPUT_TOKENS = 16384

export type GenerateProgramResult =
  | { success: true; program: Program; summary: string | null; rawText: string }
  | { success: false; errors: string[]; summary?: string | null; rawText?: string }

function getProgramModel() {
  const ai = getAI(getFirebaseApp(), {
    backend: new GoogleAIBackend(),
    useLimitedUseAppCheckTokens: true,
  })

  return getGenerativeModel(ai, {
    model: MODEL_ID,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  })
}

function formatAiError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code.includes('app-check') || code.includes('APP_CHECK')) {
      return 'App Check rejected this request. Refresh the page and try again.'
    }
    if (code.includes('permission') || code.includes('PERMISSION')) {
      return 'Firebase AI Logic is not enabled or App Check is blocking requests.'
    }
    if (code.includes('resource-exhausted') || code.includes('quota')) {
      return 'AI quota exceeded. Try again later.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Failed to generate a program with AI.'
}

export async function generateProgramWithAi(
  input: ProgramPromptInput,
): Promise<GenerateProgramResult> {
  if (!canBuildProgramPrompt(input)) {
    return {
      success: false,
      errors: ['Goal, equipment, and duration are required before generating.'],
    }
  }

  const prompt = buildProgramPrompt(input)
  const model = getProgramModel()

  try {
    const result = await model.generateContent(prompt)
    const rawText = result.response.text()
    const validated = validateAiProgramResponse(rawText)

    if (validated.success) {
      return {
        success: true,
        program: validated.data,
        summary: validated.summary,
        rawText,
      }
    }

    // One repair attempt with validation feedback
    const repairPrompt = `${prompt}

Your previous response failed validation with these errors:
${validated.errors.map((e) => `- ${e}`).join('\n')}

Return a corrected Program Summary followed by a valid JSON code block that fixes every error.`

    const repairResult = await model.generateContent(repairPrompt)
    const repairText = repairResult.response.text()
    const repaired = validateAiProgramResponse(repairText)

    if (repaired.success) {
      return {
        success: true,
        program: repaired.data,
        summary: repaired.summary,
        rawText: repairText,
      }
    }

    return {
      success: false,
      errors: repaired.errors,
      summary: repaired.summary,
      rawText: repairText,
    }
  } catch (error) {
    return {
      success: false,
      errors: [formatAiError(error)],
    }
  }
}
