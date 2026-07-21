import type { SupabaseClient } from '@supabase/supabase-js'
import type { Article, Category } from '@inking/shared-types'

interface ArticleRow {
  id: string
  user_id: string
  url: string | null
  title: string
  source_domain: string | null
  category: Category
  content: string
  added_at: string
}

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    userId: row.user_id,
    url: row.url,
    title: row.title,
    sourceDomain: row.source_domain,
    category: row.category,
    content: row.content,
    addedAt: row.added_at,
  }
}

export interface CreateArticleInput {
  url: string | null
  title: string
  sourceDomain: string | null
  category: Category
  content: string
}

export class ArticleRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .order('added_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(toArticle)
  }

  async getById(id: string): Promise<Article | null> {
    const { data, error } = await this.supabase.from('articles').select('*').eq('id', id).maybeSingle()

    if (error) throw error
    return data ? toArticle(data) : null
  }

  async create(input: CreateArticleInput): Promise<Article> {
    const { data, error } = await this.supabase
      .from('articles')
      .insert({
        url: input.url,
        title: input.title,
        source_domain: input.sourceDomain,
        category: input.category,
        content: input.content,
      })
      .select('*')
      .single()

    if (error) throw error
    return toArticle(data)
  }
}
