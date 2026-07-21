export type Category = 'news' | 'docs' | 'other'

export interface Article {
  id: string
  userId: string
  url: string | null
  title: string
  sourceDomain: string | null
  category: Category
  content: string
  addedAt: string
}
