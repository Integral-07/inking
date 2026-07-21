import { createMiddleware } from 'hono/factory'
import { createSupabaseClient } from '../lib/supabaseClient'
import type { AppEnv } from '../env'

/**
 * Verifies the caller's Supabase access token and stashes both the user id
 * and a Supabase client (bound to that same token) on the context, so route
 * handlers never see raw headers and repositories never need a service role
 * key — RLS does the row-level filtering.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const supabase = createSupabaseClient(c.env, authHeader)
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('supabase', supabase)
  c.set('userId', data.user.id)
  await next()
})
