import type { Category } from '@inking/shared-types'

const DOCS_DOMAINS = [
  'developer.mozilla.org',
  'docs.python.org',
  'react.dev',
  'nodejs.org',
  'developer.chrome.com',
  'docs.github.com',
  'typescriptlang.org',
]

const NEWS_DOMAINS = ['bbc.com', 'nytimes.com', 'theguardian.com', 'reuters.com', 'cnn.com', 'npr.org', 'apnews.com']

export function inferCategory(domain: string | null): Category {
  if (!domain) return 'other'
  const host = domain.replace(/^www\./, '')

  if (host.startsWith('docs.') || DOCS_DOMAINS.some((d) => host.endsWith(d))) return 'docs'
  if (NEWS_DOMAINS.some((d) => host.endsWith(d))) return 'news'
  return 'other'
}
