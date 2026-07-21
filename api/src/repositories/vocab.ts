import type { SupabaseClient } from '@supabase/supabase-js'
import type { VocabEntry } from '@inking/shared-types'

interface VocabRow {
  id: string
  user_id: string
  article_id: string | null
  term: string
  definition: string | null
  notes: string | null
  context_quote: string | null
  review_count: number
  created_at: string
  updated_at: string
}

function toVocabEntry(row: VocabRow): VocabEntry {
  return {
    id: row.id,
    userId: row.user_id,
    articleId: row.article_id,
    term: row.term,
    definition: row.definition,
    notes: row.notes,
    contextQuote: row.context_quote,
    reviewCount: row.review_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface CreateVocabEntryInput {
  term: string
  articleId: string | null
  definition: string | null
  contextQuote: string | null
}

export interface UpdateVocabEntryInput {
  definition?: string
  notes?: string
}

export class VocabRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<VocabEntry[]> {
    const { data, error } = await this.supabase
      .from('vocab_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(toVocabEntry)
  }

  async getById(id: string): Promise<VocabEntry | null> {
    const { data, error } = await this.supabase.from('vocab_entries').select('*').eq('id', id).maybeSingle()

    if (error) throw error
    return data ? toVocabEntry(data) : null
  }

  /** Case-insensitive lookup used to decide insert vs. merge-and-count-up. */
  async findByTerm(term: string): Promise<VocabEntry | null> {
    const { data, error } = await this.supabase
      .from('vocab_entries')
      .select('*')
      .ilike('term', term)
      .maybeSingle()

    if (error) throw error
    return data ? toVocabEntry(data) : null
  }

  async create(input: CreateVocabEntryInput): Promise<VocabEntry> {
    const { data, error } = await this.supabase
      .from('vocab_entries')
      .insert({
        term: input.term,
        article_id: input.articleId,
        definition: input.definition,
        context_quote: input.contextQuote,
        review_count: 1,
      })
      .select('*')
      .single()

    if (error) throw error
    return toVocabEntry(data)
  }

  async bumpReviewCount(id: string, nextCount: number): Promise<VocabEntry> {
    const { data, error } = await this.supabase
      .from('vocab_entries')
      .update({ review_count: nextCount, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return toVocabEntry(data)
  }

  async update(id: string, patch: UpdateVocabEntryInput): Promise<VocabEntry> {
    const { data, error } = await this.supabase
      .from('vocab_entries')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return toVocabEntry(data)
  }
}
