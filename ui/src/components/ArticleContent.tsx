import type { Article } from '@inking/shared-types'

// article.content is sanitized server-side in api/src/lib/readabilityExtractor.ts
// before it's ever stored, so it's safe to render as-is here.
export function ArticleContent({ article }: { article: Article }) {
  return <div className="article-text" dangerouslySetInnerHTML={{ __html: article.content }} />
}
