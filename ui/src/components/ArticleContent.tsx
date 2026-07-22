import { useRef, useState } from 'react'
import type { Article } from '@inking/shared-types'
import { SelectionPopover } from './SelectionPopover'

interface ActiveSelection {
  text: string
  rect: DOMRect
  contextQuote?: string
}

function extractContextSentence(range: Range, selectedText: string): string | undefined {
  const startNode = range.startContainer
  const container = startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : (startNode as Element)
  const block = container?.closest('p, li, blockquote, h1, h2, h3, h4, h5, h6')
  const fullText = block?.textContent?.trim()
  if (!fullText) return undefined

  const sentences = fullText.split(/(?<=[.!?])\s+/)
  return sentences.find((s) => s.includes(selectedText)) ?? fullText.slice(0, 200)
}

interface ArticleContentProps {
  article: Article
  onSaved?: () => void
}

// article.content is sanitized server-side in api/src/lib/readabilityExtractor.ts
// before it's ever stored, so it's safe to render as-is here.
export function ArticleContent({ article, onSaved }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<ActiveSelection | null>(null)

  // Only read the selection once the gesture ends (mouseup/touchend), not on
  // every intermediate selectionchange during the drag itself. The popover is
  // a real, clickable DOM element on top of the text — if it existed while
  // the drag was still in progress, the browser's selection-extension can
  // jump to include it (it sits later in DOM order), ballooning the range to
  // "select everything" between the drag's start and the popover.
  function handleSelectionEnd() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelection(null)
      return
    }

    const text = sel.toString().trim()
    if (!text) {
      setSelection(null)
      return
    }

    const range = sel.getRangeAt(0)
    if (!containerRef.current?.contains(range.commonAncestorContainer)) {
      setSelection(null)
      return
    }

    setSelection({
      text,
      rect: range.getBoundingClientRect(),
      contextQuote: extractContextSentence(range, text),
    })
  }

  return (
    <>
      <div
        ref={containerRef}
        className="article-text"
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      {selection && (
        <SelectionPopover
          text={selection.text}
          rect={selection.rect}
          articleId={article.id}
          contextQuote={selection.contextQuote}
          onDismiss={() => setSelection(null)}
          onSaved={onSaved}
        />
      )}
    </>
  )
}
