import { useEffect, useState } from 'react'
import {
  lookupDefinition,
  lookupWebSearch,
  type DictionaryLookupResult,
  type WebSearchResult,
} from '../lib/dictionary'
import { useAddVocabEntry } from '../hooks/vocab'

interface SelectionPopoverProps {
  text: string
  rect: DOMRect
  articleId: string
  contextQuote?: string
  onDismiss: () => void
  onSaved?: () => void
}

type LookupResult = { kind: 'dictionary'; data: DictionaryLookupResult } | { kind: 'web'; data: WebSearchResult }

const POPOVER_MAX_WIDTH = 320

function resultToDefinition(result: LookupResult | null): string | undefined {
  if (!result) return undefined
  if (result.kind === 'dictionary') {
    return result.data.partOfSpeech ? `(${result.data.partOfSpeech}) ${result.data.definition}` : result.data.definition
  }
  return result.data.text
}

export function SelectionPopover({ text, rect, articleId, contextQuote, onDismiss, onSaved }: SelectionPopoverProps) {
  const [result, setResult] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(true)
  const { addVocabEntry, submitting } = useAddVocabEntry()
  const [saved, setSaved] = useState(false)
  const isSingleWord = !/\s/.test(text.trim())

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setLoading(true)
    setSaved(false)

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

  async function handleSave() {
    const entry = await addVocabEntry({
      term: text,
      articleId,
      definition: resultToDefinition(result),
      contextQuote,
    })
    if (entry) {
      setSaved(true)
      onSaved?.()
    }
  }

  const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_MAX_WIDTH - 8))

  // position:fixed doesn't move with scroll, so a popover anchored below a
  // selection near the bottom of the viewport can end up entirely
  // off-screen and unreachable. Anchor from the bottom edge instead when
  // there isn't much room below, so it grows upward and stays on-screen
  // regardless of its (variable, content-dependent) height.
  const spaceBelow = window.innerHeight - rect.bottom
  const positionStyle =
    spaceBelow < 160 ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }

  return (
    <div className="selection-popover" style={{ ...positionStyle, left, maxWidth: POPOVER_MAX_WIDTH }}>
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
      <div style={{ display: 'flex' , gap: '12px'}}>
        <button className="selection-popover-save" onClick={handleSave} disabled={submitting || saved}>
          {saved ? '✓ 単語帳に追加しました' : submitting ? '追加中…' : '＋ 単語帳へ'}
        </button>
        <button className="selection-popover-save" onClick={handleSave} disabled={submitting || saved}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ verticalAlign: '-1px', marginRight: '4px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Web検索
        </button>
      </div>
    </div>
  )
}
