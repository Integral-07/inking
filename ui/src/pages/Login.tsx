import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function Login() {
  const [mode, setMode] = useState<'magic-link' | 'password'>('magic-link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleMagicLinkSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({ email })
    setStatus(error ? 'error' : 'sent')
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      navigate('/')
    }
  }

  function switchMode(next: 'magic-link' | 'password') {
    setMode(next)
    setStatus('idle')
    setError('')
  }

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Login</div>
        <h1 className="stage-title">ログイン</h1>
        <p className="stage-desc">
          {mode === 'magic-link' ? 'メールアドレスにマジックリンクを送ります。' : 'メールアドレスとパスワードでログインします。'}
        </p>
      </div>

      <div className="view-toggle" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`toggle-btn${mode === 'magic-link' ? ' on' : ''}`}
          onClick={() => switchMode('magic-link')}
        >
          マジックリンク
        </button>
        <button
          type="button"
          className={`toggle-btn${mode === 'password' ? ' on' : ''}`}
          onClick={() => switchMode('password')}
        >
          パスワード
        </button>
      </div>

      {mode === 'magic-link' ? (
        <>
          <form className="add-form" onSubmit={handleMagicLinkSubmit} style={{ maxWidth: 400 }}>
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
          {status === 'sent' && (
            <p className="empty-state" style={{ maxWidth: 400, textAlign: 'center' }}>
              メールを確認してください。
            </p>
          )}
          {status === 'error' && (
            <p style={{ color: 'var(--redpen)', maxWidth: 400, textAlign: 'center' }}>送信に失敗しました。</p>
          )}
        </>
      ) : (
        <>
          <form
            className="add-form"
            onSubmit={handlePasswordSubmit}
            style={{ maxWidth: 400, flexDirection: 'column', alignItems: 'stretch', gap: 8 }}
          >
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              ログイン
            </button>
          </form>
          {status === 'error' && (
            <p style={{ color: 'var(--redpen)', fontSize: '12.5px', maxWidth: 400, textAlign: 'center' }}>{error}</p>
          )}
        </>
      )}
    </section>
  )
}
