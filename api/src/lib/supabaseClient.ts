import { createClient } from '@supabase/supabase-js'
import type { Bindings } from '../env'

/**
 * Creates a request-scoped Supabase client that forwards the caller's own
 * access token. PostgREST evaluates auth.uid() from this token, so Row Level
 * Security enforces per-user access without ever needing a service role key
 * inside the Worker.
 */
export function createSupabaseClient(env: Bindings, authHeader: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
}
