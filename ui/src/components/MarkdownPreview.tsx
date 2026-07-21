import { useMemo } from 'react'
import { marked } from 'marked'

// Reuses .article-text styling — markdown preview and article content are
// both "rendered rich text", so the same typographic rules apply.
export function MarkdownPreview({ markdown }: { markdown: string }) {
  const html = useMemo(() => marked.parse(markdown, { async: false }) as string, [markdown])
  return <div className="article-text" dangerouslySetInnerHTML={{ __html: html }} />
}
