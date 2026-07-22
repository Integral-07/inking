export interface WiktionaryResult {
  partOfSpeech: string
  definition: string
}

// Sections that aren't a sense definition, so we skip past them when
// scanning for the first real definition line under a part-of-speech header.
const SKIP_HEADERS = new Set([
  'Etymology',
  'Pronunciation',
  'Alternative forms',
  'References',
  'Descendants',
  'Anagrams',
  'See also',
  'Usage notes',
  'Synonyms',
  'Antonyms',
  'Derived terms',
  'Translations',
  'Related terms',
])

function parseExtract(extract: string, term: string): WiktionaryResult | null {
  const lines = extract.split('\n')
  const termLower = term.trim().toLowerCase()
  let inEnglishSection = false
  let currentHeader: string | null = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Order matters: check the 3-equals (part-of-speech) pattern before the
    // 2-equals (language) pattern, since a loose "starts with ==" check would
    // otherwise also match "=== Foo ===" lines and misread them as a new
    // top-level language section.
    const posMatch = line.match(/^===([^=]+)===$/)
    if (posMatch) {
      currentHeader = posMatch[1].trim()
      continue
    }
    const langMatch = line.match(/^==([^=]+)==$/)
    if (langMatch) {
      if (inEnglishSection) break
      inEnglishSection = langMatch[1].trim() === 'English'
      continue
    }
    if (line.startsWith('====')) continue
    if (!inEnglishSection || !currentHeader || SKIP_HEADERS.has(currentHeader)) continue

    // The line right after a part-of-speech header is usually the headword's
    // own inflection line (e.g. "run (third-person singular ... ran)"), not
    // a definition — skip it and keep looking.
    const lineLower = line.toLowerCase()
    const isHeadwordLine =
      lineLower === termLower || lineLower.startsWith(`${termLower} (`) || lineLower.startsWith(`${termLower},`)
    if (isHeadwordLine || line.startsWith('For more quotations')) continue

    return { partOfSpeech: currentHeader, definition: line }
  }

  return null
}

export async function lookupWiktionary(term: string): Promise<WiktionaryResult | null> {
  const res = await fetch(
    `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(term.trim())}&prop=extracts&explaintext=1&format=json`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InklingBot/1.0)' } },
  )
  if (!res.ok) return null

  const data = (await res.json()) as { query?: { pages?: Record<string, { extract?: string }> } }
  const page = data.query?.pages && Object.values(data.query.pages)[0]
  if (!page?.extract) return null

  return parseExtract(page.extract, term)
}
