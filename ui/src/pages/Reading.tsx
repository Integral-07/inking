import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArticle } from '../hooks/article'
import { ArticleContent } from '../components/ArticleContent'

export function Reading() {
  const { id } = useParams<{ id: string }>()
  const { article, loading, error } = useArticle(id)
  const [savedCount, setSavedCount] = useState(0)

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Library / Reading</div>
        <h1 className="stage-title">記事閲覧</h1>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <span className="url">marginalia.app/article/{id}</span>
        </div>
        <div className="reader-body">
          <div className="reader-topline">
            <Link className="back-link" to="/">
              ← 戻る
            </Link>
            {id && (
              <Link className="pill red" to={`/article/${id}/write`}>
                この記事について書く →
              </Link>
            )}
          </div>

          {loading && <p className="empty-state">読み込み中…</p>}
          {error && <p style={{ color: 'var(--redpen)' }}>{error}</p>}

          {article && (
            <>
              <span className="pill" style={{ marginBottom: 8, display: 'inline-block' }}>
                {article.category}
              </span>
              <h2 className="serif" style={{ fontSize: 19, margin: '6px 0 14px 0' }}>
                {article.title}
              </h2>
              <ArticleContent article={article} onSaved={() => setSavedCount((c) => c + 1)} />
            </>
          )}

          {savedCount > 0 && (
            <div className="float-badge">
              <span>inklings</span>
              <span className="count">{savedCount}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
