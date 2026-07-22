import { apiFetch } from './apiClient'

export interface DictionaryLookupResult {
  word: string
  phonetic?: string
  partOfSpeech?: string
  definition: string
}

interface DictionaryApiEntry {
  word: string
  phonetic?: string
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{ definition: string }>
  }>
}

// Free Dictionary API only covers single English words, not phrases —
// callers should skip this for multi-word selections.
export async function lookupDefinition(term: string): Promise<DictionaryLookupResult | null> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term.trim().toLowerCase())}`,
    )
    if (!res.ok) return null

    const data = (await res.json()) as DictionaryApiEntry[]
    const entry = data[0]
    const meaning = entry?.meanings?.[0]
    const definition = meaning?.definitions?.[0]?.definition

    if (!entry || !meaning || !definition) return null

    return {
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: meaning.partOfSpeech,
      definition,
    }
  } catch {
    return null
  }
}

export interface WebSearchResult {
  text: string
  source: string
  sourceUrl?: string
}

// Fallback for phrases and words the dictionary doesn't have. Routed through
// our own API (GET /api/lookup) rather than called directly from the browser
// — DuckDuckGo's instant-answer endpoint doesn't reliably send CORS headers
// for browser-originated requests, but server-to-server fetches aren't
// subject to CORS at all.
export async function lookupWebSearch(term: string): Promise<WebSearchResult | null> {
  try {
    return await apiFetch<WebSearchResult | null>(`/api/lookup?term=${encodeURIComponent(term.trim())}`)
  } catch {
    return null
  }
}
