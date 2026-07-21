import type { Bindings } from '../src/env'

// Matches the `vars` in wrangler.jsonc — this is the local Supabase stack
// started by `supabase start`, not a secret (anon key is safe to expose).
export const testEnv: Bindings = {
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
}

export async function signUpTestUser(email: string): Promise<string> {
  const res = await fetch(`${testEnv.SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: testEnv.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  })

  if (!res.ok) {
    throw new Error(
      `Could not sign up a test user against the local Supabase stack at ${testEnv.SUPABASE_URL}. ` +
        `Is it running? (npx supabase start)`,
    )
  }

  const body = (await res.json()) as { access_token: string }
  return body.access_token
}
