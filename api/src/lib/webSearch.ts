export interface WebSearchResult {
  text: string
  source: string
  sourceUrl?: string
}

const EXCERPT_LENGTH = 240

// Fallback for phrases and words the dictionary doesn't have. Fetched
// server-side because DuckDuckGo's instant-answer endpoint doesn't reliably
// send CORS headers for browser-originated requests.
export async function lookupWebSearch(term: string): Promise<WebSearchResult | null> {
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(term.trim())}&format=json&no_html=1&skip_disambig=1`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InklingBot/1.0)' } },
  )
  if (!res.ok) return null

  const data = (await res.json()) as {
    AbstractText?: string
    AbstractSource?: string
    AbstractURL?: string
  }

  const text = data.AbstractText?.trim()
  if (!text) return null

  return {
    text: text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text,
    source: data.AbstractSource || 'Web',
    sourceUrl: data.AbstractURL || undefined,
  }
}
