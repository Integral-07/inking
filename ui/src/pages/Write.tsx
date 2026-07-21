import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArticle } from '../hooks/article'
import { useAutosaveWriting, useWriting } from '../hooks/writing'
import { ArticleContent } from '../components/ArticleContent'
import { MarkdownPreview } from '../components/MarkdownPreview'

export function Write() {
  const { id } = useParams<{ id: string }>()
  const { article } = useArticle(id)
  const { writing, loading } = useWriting(id)
  const { scheduleSave, status } = useAutosaveWriting(id)

  const [markdown, setMarkdown] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [mobileTab, setMobileTab] = useState<'article' | 'write'>('write')

  useEffect(() => {
    if (!loading) setMarkdown(writing?.contentMarkdown ?? '')
  }, [loading, writing])

  function handleChange(value: string) {
    setMarkdown(value)
    scheduleSave(value)
  }

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0
  const statusLabel =
    status === 'saving'
      ? '保存中…'
      : status === 'error'
        ? '保存に失敗しました'
        : status === 'saved' || writing
          ? '保存済み ✓'
          : ''

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Library / Writing</div>
        <h1 className="stage-title">執筆</h1>
        <p className="stage-desc">記事について感じたことを書く。自動保存される。</p>
      </div>

      <div className="frame wide">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <span className="url">marginalia.app/article/{id}/write</span>
        </div>

        <div className="write-mobile-tabs">
          <button
            className={`write-mobile-tab${mobileTab === 'article' ? ' active' : ''}`}
            onClick={() => setMobileTab('article')}
          >
            記事
          </button>
          <button
            className={`write-mobile-tab${mobileTab === 'write' ? ' active' : ''}`}
            onClick={() => setMobileTab('write')}
          >
            執筆
          </button>
        </div>

        <div className="write-shell">
          <div className={`write-col left${mobileTab === 'article' ? ' mobile-active' : ''}`}>
            <span className="pill neutral">原文</span>
            {article && (
              <>
                <Link className="back-link" to={`/article/${id}`} style={{ float: 'right' }}>
                  ← 記事に戻る
                </Link>
                <div className="write-article-title">{article.title}</div>
                <ArticleContent article={article} />
              </>
            )}
          </div>

          <div className={`write-col right${mobileTab === 'write' ? ' mobile-active' : ''}`}>
            <div className="editor-topline">
              <span className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>
                {wordCount} words{statusLabel && ' · '}
                <span style={{ color: 'var(--pine-deep)' }}>{statusLabel}</span>
              </span>
              <div className="view-toggle">
                <button
                  className={`toggle-btn${viewMode === 'edit' ? ' on' : ''}`}
                  onClick={() => setViewMode('edit')}
                >
                  編集
                </button>
                <button
                  className={`toggle-btn${viewMode === 'preview' ? ' on' : ''}`}
                  onClick={() => setViewMode('preview')}
                >
                  プレビュー
                </button>
              </div>
            </div>

            {viewMode === 'edit' ? (
              <textarea
                className="editor-box"
                value={markdown}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="この記事について書く…"
              />
            ) : (
              <div className="editor-box">
                <MarkdownPreview markdown={markdown} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
