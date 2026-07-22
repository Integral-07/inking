import { useCallback, useEffect, useRef, useState } from 'react'
import type { Writing, WritingListItem } from '@inking/shared-types'
import { apiFetch } from '../lib/apiClient'

export function useWritingList() {
  const [writings, setWritings] = useState<WritingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setWritings(await apiFetch<WritingListItem[]>('/api/writings'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load writings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { writings, loading, error, refresh }
}

export function useWriting(articleId: string | undefined) {
  const [writing, setWriting] = useState<Writing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!articleId) return
    setLoading(true)
    apiFetch<Writing | null>(`/api/writings/${articleId}`)
      .then(setWriting)
      .finally(() => setLoading(false))
  }, [articleId])

  return { writing, loading }
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DELAY_MS = 1200

export function useAutosaveWriting(articleId: string | undefined) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const scheduleSave = useCallback(
    (contentMarkdown: string) => {
      if (!articleId) return
      setStatus('saving')
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        try {
          await apiFetch(`/api/writings/${articleId}`, {
            method: 'PUT',
            body: JSON.stringify({ contentMarkdown }),
          })
          setStatus('saved')
        } catch {
          setStatus('error')
        }
      }, AUTOSAVE_DELAY_MS)
    },
    [articleId],
  )

  return { scheduleSave, status }
}
