export interface Writing {
  id: string
  userId: string
  articleId: string
  contentMarkdown: string
  updatedAt: string
}

/** A writing plus its article's title, for list views. */
export interface WritingListItem {
  id: string
  articleId: string
  articleTitle: string
  contentMarkdown: string
  updatedAt: string
}
