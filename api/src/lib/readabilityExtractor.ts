import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'
import sanitizeHtml from 'sanitize-html'

export interface ExtractedArticle {
  title: string
  /** Sanitized HTML — keeps code blocks, lists, links, emphasis, etc. */
  content: string
  sourceDomain: string
}

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'strong', 'em', 'b', 'i', 'a', 'span',
  'figure', 'figcaption', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https'],
  })
}

// Many news sites mark up their author/timestamp block with "byline"
// somewhere in a class/id/data-testid/data-component attribute. Readability's
// own byline detection often misses these (or extracts the byline text
// separately but leaves a copy behind in the content), so it leaks into the
// article body as unstyled noise. Stripping it before parsing generalizes
// across sites better than matching against Readability's `byline` output.
const NOISE_ATTRIBUTE_KEYWORDS = ['byline']
const NOISE_ATTRIBUTES = ['class', 'id', 'data-testid', 'data-component']

function stripNoiseElements(document: Document): void {
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const attrValues = NOISE_ATTRIBUTES.map((attr) => (el.getAttribute(attr) || '').toLowerCase())
    if (attrValues.some((value) => NOISE_ATTRIBUTE_KEYWORDS.some((keyword) => value.includes(keyword)))) {
      el.remove()
    }
  }
}

// Lazy-loading sites often ship a real <img> pointing at a blank/grey
// placeholder alongside the real photo, meant to be hidden or swapped by
// the source site's own JS. We render static HTML with no such JS, so it
// shows up as an actual blank image ahead of the real one.
function stripPlaceholderImages(document: Document): void {
  for (const img of Array.from(document.querySelectorAll('img'))) {
    const src = (img.getAttribute('src') || '').toLowerCase()
    if (src.includes('placeholder')) {
      img.remove()
    }
  }
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
  stripNoiseElements(document as unknown as Document)
  stripPlaceholderImages(document as unknown as Document)
  const reader = new Readability(document as unknown as Document)
  const parsed = reader.parse()

  if (!parsed || !parsed.content?.trim()) {
    throw new Error('Could not extract article content from this URL')
  }

  return {
    title: parsed.title || new URL(url).hostname,
    content: sanitizeArticleHtml(parsed.content),
    sourceDomain: new URL(url).hostname,
  }
}
