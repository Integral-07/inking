import { Link, useParams } from 'react-router-dom'
import { useArticle } from '../hooks/article'
import { ArticleContent } from '../components/ArticleContent'

export function Reading() {
  const { id } = useParams<{ id: string }>()
  const { article, loading, error } = useArticle(id)

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">02 / Reading</div>
        <h1 className="stage-title">記事閲覧</h1>
        <p className="stage-desc">記事本文を読む。単語選択→単語帳への保存は次のステップで追加予定。</p>
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
              <ArticleContent article={article} />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
