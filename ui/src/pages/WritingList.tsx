import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWritingList } from '../hooks/writing'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function snippet(markdown: string, length = 80) {
  const plain = markdown.replace(/[#*`>_-]/g, '').trim()
  return plain.length > length ? `${plain.slice(0, length)}…` : plain
}

export function WritingList() {
  const { writings, loading, error } = useWritingList()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = writings.filter(
    (w) => !q || w.articleTitle.toLowerCase().includes(q) || w.contentMarkdown.toLowerCase().includes(q),
  )

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">03 / Writing</div>
        <h1 className="stage-title">執筆した記事</h1>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
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
            <p className="empty-state">
              まだ執筆した記事がありません。記事を読んで「この記事について書く」から始めましょう。
            </p>
          )}

          <div className="card-stack">
            {filtered.map((w) => (
              <Link key={w.id} to={`/article/${w.articleId}/write`} className="idx-card">
                <div className="idx-top">
                  <span className="idx-word">{w.articleTitle}</span>
                  <span className="idx-date">{formatDate(w.updatedAt)}</span>
                </div>
                {w.contentMarkdown.trim() && <div className="idx-def">{snippet(w.contentMarkdown)}</div>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
