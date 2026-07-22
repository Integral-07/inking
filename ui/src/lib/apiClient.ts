import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Thin fetch wrapper that injects the current Supabase access token as a Bearer header. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))

    // Purely cosmetic: Welcome.tsx checks this to show a one-time notice.
    // Real authorization is enforced server-side (JWT + RLS) regardless of
    // this flag, so there's nothing to gain by tampering with it.
    if (response.status === 401) {
      sessionStorage.setItem('unauthorized', '1')
      window.location.href = '/welcome'
    }

    throw new ApiError(response.status, body.error ?? `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}
