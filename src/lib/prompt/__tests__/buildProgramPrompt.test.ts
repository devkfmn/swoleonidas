import { describe, expect, it } from 'vitest'
import { buildProgramPrompt, canBuildProgramPrompt } from '../buildProgramPrompt'
import { programJsonTemplate } from '../../../data/exampleProgram'

const validInput = {
  goal: 'Build strength and lose body fat',
  equipment: 'Dumbbells, pull-up bar',
  duration: '12 weeks',
}

describe('canBuildProgramPrompt', () => {
  it('returns true when all fields have content', () => {
    expect(canBuildProgramPrompt(validInput)).toBe(true)
  })

  it('returns false when any field is empty or whitespace', () => {
    expect(canBuildProgramPrompt({ ...validInput, goal: '' })).toBe(false)
    expect(canBuildProgramPrompt({ ...validInput, equipment: '   ' })).toBe(false)
    expect(canBuildProgramPrompt({ ...validInput, duration: '' })).toBe(false)
  })
})

describe('buildProgramPrompt', () => {
  it('returns empty string when inputs are incomplete', () => {
    expect(buildProgramPrompt({ goal: '', equipment: 'bands', duration: '8 weeks' })).toBe('')
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

  it('includes all rule bullets', () => {
    const prompt = buildProgramPrompt(validInput)

    expect(prompt).toContain('Output only valid JSON.')
    expect(prompt).toContain('Do not include markdown.')
    expect(prompt).toContain('Schedule workouts by weekday.')
  })

  it('trims whitespace from user inputs', () => {
    const prompt = buildProgramPrompt({
      goal: '  Get stronger  ',
      equipment: '  Kettlebell  ',
      duration: '  6 weeks  ',
    })

    expect(prompt).toContain('User goal:\nGet stronger')
    expect(prompt).toContain('Available equipment:\nKettlebell')
    expect(prompt).toContain('Duration:\n6 weeks')
  })
})
