import { describe, expect, it } from 'vitest'
import { buildProgramPrompt, canBuildProgramPrompt } from '../buildProgramPrompt'
import { programJsonTemplate } from '../../../data/exampleProgram'

const validInput = {
  goal: 'Build strength and lose body fat',
  equipment: 'Dumbbells, pull-up bar',
  duration: '12 weeks',
  preferredExercises: [] as string[],
  restDays: [] as string[],
}

describe('canBuildProgramPrompt', () => {
  it('returns true when all required fields have content', () => {
    expect(canBuildProgramPrompt(validInput)).toBe(true)
  })

  it('returns false when any required field is empty or whitespace', () => {
    expect(canBuildProgramPrompt({ ...validInput, goal: '' })).toBe(false)
    expect(canBuildProgramPrompt({ ...validInput, equipment: '   ' })).toBe(false)
    expect(canBuildProgramPrompt({ ...validInput, duration: '' })).toBe(false)
  })

  it('returns true when optional exercise and rest day fields are empty', () => {
    expect(canBuildProgramPrompt(validInput)).toBe(true)
  })
})

describe('buildProgramPrompt', () => {
  it('returns empty string when inputs are incomplete', () => {
    expect(
      buildProgramPrompt({
        ...validInput,
        goal: '',
      }),
    ).toBe('')
  })

  it('includes goal, equipment, and duration', () => {
    const prompt = buildProgramPrompt(validInput)

    expect(prompt).toContain('User goal:\nBuild strength and lose body fat')
    expect(prompt).toContain('Available equipment:\nDumbbells, pull-up bar')
    expect(prompt).toContain('Duration:\n12 weeks')
  })

  it('includes the JSON template as schema', () => {
    const prompt = buildProgramPrompt(validInput)

    expect(prompt).toContain('Schema:')
    expect(prompt).toContain(programJsonTemplate)
    expect(prompt).toContain('"schemaVersion": "1.1"')
  })

  it('includes summary and JSON output format rules', () => {
    const prompt = buildProgramPrompt(validInput)

    expect(prompt).toContain('Program Summary')
    expect(prompt).toContain('JSON code block')
    expect(prompt).toContain('Schedule workouts only on non-rest weekdays.')
  })

  it('includes preferred exercises when provided', () => {
    const prompt = buildProgramPrompt({
      ...validInput,
      preferredExercises: ['Push-ups', 'Pull-ups'],
    })

    expect(prompt).toContain('Preferred exercises to include:')
    expect(prompt).toContain('- Push-ups')
    expect(prompt).toContain('- Pull-ups')
  })

  it('includes rest days when provided', () => {
    const prompt = buildProgramPrompt({
      ...validInput,
      restDays: ['saturday', 'sunday'],
    })

    expect(prompt).toContain('Rest days (do not schedule workouts on these days):')
    expect(prompt).toContain('- saturday')
    expect(prompt).toContain('- sunday')
  })

  it('omits optional sections when arrays are empty', () => {
    const prompt = buildProgramPrompt(validInput)

    expect(prompt).not.toContain('Preferred exercises to include:')
    expect(prompt).not.toContain('Rest days (do not schedule workouts on these days):')
  })

  it('trims whitespace from user inputs', () => {
    const prompt = buildProgramPrompt({
      goal: '  Get stronger  ',
      equipment: '  Kettlebell  ',
      duration: '  6 weeks  ',
      preferredExercises: ['  Push-ups  '],
      restDays: ['  Saturday  '],
    })

    expect(prompt).toContain('User goal:\nGet stronger')
    expect(prompt).toContain('Available equipment:\nKettlebell')
    expect(prompt).toContain('Duration:\n6 weeks')
    expect(prompt).toContain('- Push-ups')
    expect(prompt).toContain('- saturday')
  })
})
