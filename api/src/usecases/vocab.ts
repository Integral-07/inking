import type { VocabRepository, UpdateVocabEntryInput } from '../repositories/vocab'
import type { VocabEntry } from '@inking/shared-types'

export interface AddVocabEntryInput {
  term: string
  articleId: string | null
  /** Prefilled from a dictionary lookup on the client for single words; user-typed for phrases. */
  definition?: string
  contextQuote?: string
}

// The same word selected from different articles is one vocab entry: we
// only count occurrences and keep the first context quote, rather than
// creating duplicate cards per article.
export async function addVocabEntry(
  vocabRepository: VocabRepository,
  input: AddVocabEntryInput,
): Promise<VocabEntry> {
  const existing = await vocabRepository.findByTerm(input.term)

  if (existing) {
    return vocabRepository.bumpReviewCount(existing.id, existing.reviewCount + 1)
  }

  return vocabRepository.create({
    term: input.term,
    articleId: input.articleId,
    definition: input.definition ?? null,
    contextQuote: input.contextQuote ?? null,
  })
}

export function listVocabEntries(vocabRepository: VocabRepository): Promise<VocabEntry[]> {
  return vocabRepository.list()
}

export function getVocabEntry(vocabRepository: VocabRepository, id: string): Promise<VocabEntry | null> {
  return vocabRepository.getById(id)
}

export function updateVocabEntry(
  vocabRepository: VocabRepository,
  id: string,
  patch: UpdateVocabEntryInput,
): Promise<VocabEntry> {
  return vocabRepository.update(id, patch)
}
