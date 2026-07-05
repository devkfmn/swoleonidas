import { PROGRAM_PROMPT_RULES, programJsonTemplate } from '../../data/exampleProgram'

export interface ProgramPromptInput {
  goal: string
  equipment: string
  duration: string
  preferredExercises: string[]
  restDays: string[]
}

function hasValue(value: string): boolean {
  return value.trim().length > 0
}

export function canBuildProgramPrompt(input: ProgramPromptInput): boolean {
  return hasValue(input.goal) && hasValue(input.equipment) && hasValue(input.duration)
}

function formatListSection(title: string, items: string[]): string {
  if (items.length === 0) return ''
  return `\n${title}:\n${items.map((item) => `- ${item}`).join('\n')}`
}

export function buildProgramPrompt(input: ProgramPromptInput): string {
  if (!canBuildProgramPrompt(input)) {
    return ''
  }

  const goal = input.goal.trim()
  const equipment = input.equipment.trim()
  const duration = input.duration.trim()
  const exercises = input.preferredExercises.map((e) => e.trim()).filter(Boolean)
  const restDays = input.restDays.map((d) => d.trim().toLowerCase()).filter(Boolean)

  const exerciseSection = formatListSection('Preferred exercises to include', exercises)
  const restDaySection = formatListSection(
    'Rest days (do not schedule workouts on these days)',
    restDays,
  )

  return `${PROGRAM_PROMPT_RULES}

User goal:
${goal}

Available equipment:
${equipment}

Duration:
${duration}${exerciseSection}${restDaySection}

Schema:
${programJsonTemplate}`
}
