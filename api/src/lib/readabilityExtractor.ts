import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'

export interface ExtractedArticle {
  title: string
  content: string
  sourceDomain: string
}

/**
 * jsdom needs Node APIs unavailable on Workers, so we parse HTML with
 * linkedom (a Workers-compatible DOM shim) and hand that document to
 * Readability, which only relies on standard DOM interfaces.
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InklingBot/1.0)' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const html = await response.text()
  const { document } = parseHTML(html)
  const reader = new Readability(document as unknown as Document)
  const parsed = reader.parse()

  if (!parsed || !parsed.textContent?.trim()) {
    throw new Error('Could not extract article content from this URL')
  }

  return {
    title: parsed.title || new URL(url).hostname,
    content: parsed.textContent.trim(),
    sourceDomain: new URL(url).hostname,
  }
}
