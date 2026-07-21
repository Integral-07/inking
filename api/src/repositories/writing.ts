import type { SupabaseClient } from '@supabase/supabase-js'
import type { Writing } from '@inking/shared-types'

interface WritingRow {
  id: string
  user_id: string
  article_id: string
  content_markdown: string
  updated_at: string
}

function toWriting(row: WritingRow): Writing {
  return {
    id: row.id,
    userId: row.user_id,
    articleId: row.article_id,
    contentMarkdown: row.content_markdown,
    updatedAt: row.updated_at,
  }
}

export class WritingRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getByArticleId(articleId: string): Promise<Writing | null> {
    const { data, error } = await this.supabase
      .from('writings')
      .select('*')
      .eq('article_id', articleId)
      .maybeSingle()

    if (error) throw error
    return data ? toWriting(data) : null
  }

  async upsert(articleId: string, contentMarkdown: string): Promise<Writing> {
    const { data, error } = await this.supabase
      .from('writings')
      .upsert(
        { article_id: articleId, content_markdown: contentMarkdown, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,article_id' },
      )
      .select('*')
      .single()

    if (error) throw error
    return toWriting(data)
  }
}
