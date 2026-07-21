export interface VocabEntry {
  id: string
  userId: string
  articleId: string | null
  term: string
  definition: string | null
  notes: string | null
  contextQuote: string | null
  reviewCount: number
  createdAt: string
  updatedAt: string
}
