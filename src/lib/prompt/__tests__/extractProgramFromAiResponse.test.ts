import { describe, expect, it } from 'vitest'
import { exampleProgram } from '../../../data/exampleProgram'
import { extractProgramFromAiResponse } from '../extractProgramFromAiResponse'

const exampleJson = JSON.stringify(exampleProgram, null, 2)

describe('extractProgramFromAiResponse', () => {
  it('extracts JSON from summary plus fenced json block', () => {
    const text = `## Program Summary

A 12-week strength program with three phases.

\`\`\`json
${exampleJson}
\`\`\``

    const result = extractProgramFromAiResponse(text)

    expect(result.summary).toContain('12-week strength program')
    expect(JSON.parse(result.jsonText).programId).toBe(exampleProgram.programId)
  })

  it('extracts JSON from summary plus bare object', () => {
    const text = `Program Summary: Four phases over 24 weeks.\n\n${exampleJson}`

    const result = extractProgramFromAiResponse(text)

    expect(result.summary).toContain('Four phases over 24 weeks')
    expect(JSON.parse(result.jsonText).programId).toBe(exampleProgram.programId)
  })

  it('handles JSON-only input', () => {
    const result = extractProgramFromAiResponse(exampleJson)

    expect(result.summary).toBeNull()
    expect(JSON.parse(result.jsonText).programId).toBe(exampleProgram.programId)
  })

  it('returns empty jsonText when no JSON is found', () => {
    const result = extractProgramFromAiResponse('Just a summary with no JSON.')

    expect(result.summary).toBeNull()
    expect(result.jsonText).toBe('')
  })

  it('prefers the last valid fenced JSON block', () => {
    const text = `\`\`\`json
{"not": "a program"}
\`\`\`

Summary text here.

\`\`\`json
${exampleJson}
\`\`\``

    const result = extractProgramFromAiResponse(text)

    expect(JSON.parse(result.jsonText).programId).toBe(exampleProgram.programId)
  })
})
