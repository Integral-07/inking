import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/auth'

// Checks login state before rendering the protected page at all, instead of
// rendering it optimistically and reacting only once an API call 401s —
// that reactive approach flashes the page's own error state for a moment
// before the redirect kicks in.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()

  if (loading) return null
  if (!user) return <Navigate to="/welcome" replace />

  return <>{children}</>
}
