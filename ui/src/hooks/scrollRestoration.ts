import { useEffect, useRef } from 'react'

const SAVE_DEBOUNCE_MS = 200

// Restores a scrollable element's scroll position from localStorage once its
// content is ready, and persists it on scroll. `key` should be unique per
// scrollable instance (e.g. include the article id) so different articles
// don't share a saved position.
export function useScrollRestoration(key: string | undefined, ready: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !key || !ready) return

    const saved = localStorage.getItem(`scroll:${key}`)
    if (saved) el.scrollTop = Number(saved)
  }, [key, ready])

  useEffect(() => {
    const el = ref.current
    if (!el || !key) return

    let timer: ReturnType<typeof setTimeout>
    function handleScroll() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.setItem(`scroll:${key}`, String(el!.scrollTop))
      }, SAVE_DEBOUNCE_MS)
    }

    el.addEventListener('scroll', handleScroll)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [key])

  return ref
}
