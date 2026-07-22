import type { WritingRepository } from '../repositories/writing'
import type { Writing, WritingListItem } from '@inking/shared-types'

export function listWritings(writingRepository: WritingRepository): Promise<WritingListItem[]> {
  return writingRepository.list()
}

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
