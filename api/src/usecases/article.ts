import type { ArticleRepository } from '../repositories/article'
import { extractArticle } from '../lib/readabilityExtractor'
import { inferCategory } from '../lib/categoryInference'
import type { Article } from '@inking/shared-types'

export interface AddArticleInput {
  url?: string
  /** Manual fallback when URL extraction fails or isn't wanted. */
  title?: string
  content?: string
}

export async function addArticle(articleRepository: ArticleRepository, input: AddArticleInput): Promise<Article> {
  if (input.url) {
    const extracted = await extractArticle(input.url)
    return articleRepository.create({
      url: input.url,
      title: extracted.title,
      sourceDomain: extracted.sourceDomain,
      category: inferCategory(extracted.sourceDomain),
      content: extracted.content,
    })
  }

  if (!input.title || !input.content) {
    throw new Error('Either a url or both title and content are required')
  }

  return articleRepository.create({
    url: null,
    title: input.title,
    sourceDomain: null,
    category: 'other',
    content: input.content,
  })
}

export function listArticles(articleRepository: ArticleRepository): Promise<Article[]> {
  return articleRepository.list()
}

export function getArticle(articleRepository: ArticleRepository, id: string): Promise<Article | null> {
  return articleRepository.getById(id)
}
