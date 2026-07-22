import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVocabEntries } from '../hooks/vocab'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function Vocab() {
  const { entries, loading, error } = useVocabEntries()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = entries.filter(
    (e) => !q || e.term.toLowerCase().includes(q) || e.definition?.toLowerCase().includes(q),
  )

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">02 / Vocabulary</div>
        <h1 className="stage-title">Your inklings</h1>
        <p className="stage-desc">まだ確信はないけれど、気になった単語・表現。タップで詳細ページへ。</p>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <span className="url">marginalia.app/vocab</span>
        </div>
        <div className="vocab-body">
          <div className="search-row">
            <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
              ⌕
            </span>
            <input placeholder="検索…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {loading && <p className="empty-state">読み込み中…</p>}
          {error && <p style={{ color: 'var(--redpen)' }}>{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="empty-state">まだ単語がありません。記事を読んで気になった表現を選択してみましょう。</p>
          )}

          <div className="card-stack">
            {filtered.map((entry) => (
              <Link key={entry.id} to={`/vocab/${entry.id}`} className="idx-card">
                <div className="idx-top">
                  <span className="idx-word">{entry.term}</span>
                  <span className="idx-date">{formatDate(entry.createdAt)}</span>
                </div>
                {entry.definition && <div className="idx-def">{entry.definition}</div>}
                {entry.reviewCount > 1 && <div className="stamp">×{entry.reviewCount}</div>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
