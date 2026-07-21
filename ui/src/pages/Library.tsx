import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticles, useAddArticle } from '../hooks/article'
import { ArticleRow } from '../components/ArticleRow'

export function Library() {
  const { articles, loading, error, refresh } = useArticles()
  const { addArticle, submitting, error: addError } = useAddArticle()
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    const article = await addArticle({ url: url.trim() })
    if (article) {
      setUrl('')
      await refresh()
      navigate(`/article/${article.id}`)
    }
  }

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">01 / Library</div>
        <h1 className="stage-title">記事の追加と一覧</h1>
        <p className="stage-desc">URLを貼り付けて記事を追加。カテゴリは自動推定される。</p>
      </div>

      <div className="frame wide">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <span className="url">marginalia.app/</span>
        </div>
        <div className="home-body">
          <form className="add-form" onSubmit={handleSubmit}>
            <input
              type="url"
              placeholder="記事のURLを貼り付け…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '追加中…' : '＋ 追加'}
            </button>
          </form>
          {addError && <p style={{ color: 'var(--redpen)', fontSize: 12.5 }}>{addError}</p>}

          {loading && <p className="empty-state">読み込み中…</p>}
          {error && <p style={{ color: 'var(--redpen)' }}>{error}</p>}
          {!loading && !error && articles.length === 0 && (
            <p className="empty-state">まだ記事がありません。URLを追加してみましょう。</p>
          )}
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
