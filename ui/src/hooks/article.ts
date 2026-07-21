import { useCallback, useEffect, useState } from 'react'
import type { Article } from '@inking/shared-types'
import { apiFetch } from '../lib/apiClient'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setArticles(await apiFetch<Article[]>('/api/articles'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load articles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { articles, loading, error, refresh }
}

export function useArticle(id: string | undefined) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    apiFetch<Article>(`/api/articles/${id}`)
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : 'failed to load article'))
      .finally(() => setLoading(false))
  }, [id])

  return { article, loading, error }
}

interface AddArticleInput {
  url?: string
  title?: string
  content?: string
}

export function useAddArticle() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addArticle(input: AddArticleInput): Promise<Article | null> {
    setSubmitting(true)
    setError(null)
    try {
      return await apiFetch<Article>('/api/articles', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to add article')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return { addArticle, submitting, error }
}
