import { Link } from 'react-router-dom'
import type { Article } from '@inking/shared-types'

const CATEGORY_PILL_CLASS: Record<Article['category'], string> = {
  news: 'pill',
  docs: 'pill neutral',
  other: 'pill neutral',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.id}`} className="lib-row">
      <span className={CATEGORY_PILL_CLASS[article.category]}>{article.category}</span>
      <div className="lib-title">{article.title}</div>
      <div className="lib-meta">
        {article.sourceDomain ?? 'pasted'} · {formatDate(article.addedAt)}
      </div>
    </Link>
  )
}
