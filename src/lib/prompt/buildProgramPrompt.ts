import { PROGRAM_PROMPT_RULES, programJsonTemplate } from '../../data/exampleProgram'

export interface ProgramPromptInput {
  goal: string
  equipment: string
  duration: string
}

function hasValue(value: string): boolean {
  return value.trim().length > 0
}

export function canBuildProgramPrompt(input: ProgramPromptInput): boolean {
  return hasValue(input.goal) && hasValue(input.equipment) && hasValue(input.duration)
}

export function buildProgramPrompt(input: ProgramPromptInput): string {
  if (!canBuildProgramPrompt(input)) {
    return ''
  }

  const goal = input.goal.trim()
  const equipment = input.equipment.trim()
  const duration = input.duration.trim()

  return `${PROGRAM_PROMPT_RULES}

User goal:
${goal}

Available equipment:
${equipment}

Duration:
${duration}

Schema:
${programJsonTemplate}`
}
