import { useEffect, useState } from 'react'
import {
  lookupDefinition,
  lookupWebSearch,
  type DictionaryLookupResult,
  type WebSearchResult,
} from '../lib/dictionary'

interface SelectionPopoverProps {
  text: string
  rect: DOMRect
  onDismiss: () => void
}

type LookupResult = { kind: 'dictionary'; data: DictionaryLookupResult } | { kind: 'web'; data: WebSearchResult }

const POPOVER_MAX_WIDTH = 320

export function SelectionPopover({ text, rect, onDismiss }: SelectionPopoverProps) {
  const [result, setResult] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(true)
  const isSingleWord = !/\s/.test(text.trim())

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setLoading(true)

    async function run() {
      // Single words: try the dictionary first. Phrases skip straight to web
      // search since the dictionary API only covers single words anyway.
      if (isSingleWord) {
        const dict = await lookupDefinition(text)
        if (cancelled) return
        if (dict) {
          setResult({ kind: 'dictionary', data: dict })
          setLoading(false)
          return
        }
      }

      const web = await lookupWebSearch(text)
      if (cancelled) return
      setResult(web ? { kind: 'web', data: web } : null)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [text, isSingleWord])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  const top = rect.bottom + 8
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_MAX_WIDTH - 8))

  return (
    <div className="selection-popover" style={{ top, left, maxWidth: POPOVER_MAX_WIDTH }}>
      <div className="selection-popover-term">{text}</div>
      {loading ? (
        <div className="selection-popover-def">調べています…</div>
      ) : result?.kind === 'dictionary' ? (
        <div className="selection-popover-def">
          {result.data.partOfSpeech && <span className="selection-popover-pos">{result.data.partOfSpeech}</span>}
          {result.data.definition}
        </div>
      ) : result?.kind === 'web' ? (
        <div className="selection-popover-def">
          {result.data.text}
          <div className="selection-popover-source">via {result.data.source}</div>
        </div>
      ) : (
        <div className="selection-popover-def">定義が見つかりませんでした</div>
      )}
    </div>
  )
}
