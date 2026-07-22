import { useCallback, useEffect, useState } from 'react'
import type { VocabEntry } from '@inking/shared-types'
import { apiFetch } from '../lib/apiClient'

export function useVocabEntries() {
  const [entries, setEntries] = useState<VocabEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await apiFetch<VocabEntry[]>('/api/vocab'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load vocab entries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, loading, error, refresh }
}

export function useVocabEntry(id: string | undefined) {
  const [entry, setEntry] = useState<VocabEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!id) return
    setLoading(true)
    return apiFetch<VocabEntry>(`/api/vocab/${id}`)
      .then(setEntry)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entry, loading, refresh }
}

interface AddVocabEntryInput {
  term: string
  articleId: string | null
  definition?: string
  contextQuote?: string
}

export function useAddVocabEntry() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addVocabEntry(input: AddVocabEntryInput): Promise<VocabEntry | null> {
    setSubmitting(true)
    setError(null)
    try {
      return await apiFetch<VocabEntry>('/api/vocab', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save vocab entry')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return { addVocabEntry, submitting, error }
}

export function useUpdateVocabEntry() {
  const [saving, setSaving] = useState(false)

  async function updateVocabEntry(id: string, patch: { definition?: string; notes?: string }) {
    setSaving(true)
    try {
      return await apiFetch<VocabEntry>(`/api/vocab/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
    } finally {
      setSaving(false)
    }
  }

  return { updateVocabEntry, saving }
}
