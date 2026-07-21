import type { WritingRepository } from '../repositories/writing'
import type { Writing } from '@inking/shared-types'

export function getWriting(writingRepository: WritingRepository, articleId: string): Promise<Writing | null> {
  return writingRepository.getByArticleId(articleId)
}

export function saveWriting(
  writingRepository: WritingRepository,
  articleId: string,
  contentMarkdown: string,
): Promise<Writing> {
  return writingRepository.upsert(articleId, contentMarkdown)
}
