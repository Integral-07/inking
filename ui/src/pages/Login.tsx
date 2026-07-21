import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({ email })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Login</div>
        <h1 className="stage-title">ログイン</h1>
        <p className="stage-desc">メールアドレスにマジックリンクを送ります。</p>
      </div>

      <form className="add-form" onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          送信
        </button>
      </form>
      {status === 'sent' && <p className="empty-state">メールを確認してください。</p>}
      {status === 'error' && <p style={{ color: 'var(--redpen)' }}>送信に失敗しました。</p>}
    </section>
  )
}
