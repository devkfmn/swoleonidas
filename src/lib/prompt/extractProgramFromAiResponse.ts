export interface ExtractedAiResponse {
  summary: string | null
  jsonText: string
}

const FENCED_BLOCK_RE = /```(?:json)?\s*([\s\S]*?)```/gi

function tryParseJsonObject(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    JSON.parse(trimmed)
    return trimmed
  } catch {
    return null
  }
}

function extractBalancedJson(text: string, startIndex: number): string | null {
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0) {
        const candidate = text.slice(startIndex, i + 1)
        if (tryParseJsonObject(candidate)) {
          return candidate
        }
        return null
      }
    }
  }

  return null
}

function findJsonInFencedBlocks(text: string): { jsonText: string; startIndex: number } | null {
  const matches = [...text.matchAll(FENCED_BLOCK_RE)]
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const body = match[1]?.trim() ?? ''
    const parsed = tryParseJsonObject(body)
    if (parsed) {
      return { jsonText: parsed, startIndex: match.index ?? 0 }
    }
  }
  return null
}

function findJsonInBareText(text: string): { jsonText: string; startIndex: number } | null {
  const startIndex = text.indexOf('{')
  if (startIndex === -1) return null
  const jsonText = extractBalancedJson(text, startIndex)
  if (!jsonText) return null
  return { jsonText, startIndex }
}

export function extractProgramFromAiResponse(text: string): ExtractedAiResponse {
  const trimmed = text.trim()
  if (!trimmed) {
    return { summary: null, jsonText: '' }
  }

  const bareOnly = tryParseJsonObject(trimmed)
  if (bareOnly) {
    return { summary: null, jsonText: bareOnly }
  }

  const fromFence = findJsonInFencedBlocks(trimmed)
  const fromBare = fromFence ? null : findJsonInBareText(trimmed)
  const found = fromFence ?? fromBare

  if (!found) {
    return { summary: null, jsonText: '' }
  }

  const summaryText = trimmed.slice(0, found.startIndex).trim()
  const summary = summaryText.length > 0 ? summaryText : null

  return { summary, jsonText: found.jsonText }
}
