import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Settings() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    const { error } = await supabase.auth.updateUser({ email })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setPasswordError('パスワードが一致しません。')
      setPasswordStatus('error')
      return
    }
    setPasswordStatus('saving')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPasswordError(error.message)
      setPasswordStatus('error')
    } else {
      setPassword('')
      setPasswordConfirm('')
      setPasswordStatus('saved')
    }
  }

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Settings</div>
        <h1 className="stage-title">設定</h1>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div className="detail-body">
          <div className="settings-section">
            <div className="field-label">メールアドレスの変更</div>
            <form className="settings-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="新しいメールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'saving'}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
                {status === 'saving' ? '送信中…' : '変更'}
              </button>
            </form>
            {status === 'sent' && (
              <p className="empty-state" style={{ padding: 0 }}>
                確認メールを送信しました。新しいメールアドレス宛のリンクをクリックすると変更が反映されます。
              </p>
            )}
            {status === 'error' && <p style={{ color: 'var(--redpen)', fontSize: '12.5px' }}>{error}</p>}
          </div>

          <div className="settings-section">
            <div className="field-label">パスワードの設定</div>
            <form className="settings-form stacked" onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="新しいパスワード(9文字以上)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={passwordStatus === 'saving'}
                minLength={9}
                required
              />
              <input
                type="password"
                placeholder="新しいパスワード(確認)"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={passwordStatus === 'saving'}
                minLength={6}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={passwordStatus === 'saving'}>
                {passwordStatus === 'saving' ? '設定中…' : 'パスワードを設定'}
              </button>
            </form>
            {passwordStatus === 'saved' && (
              <p className="empty-state" style={{ padding: 0 }}>
                パスワードを設定しました。次回からメールとパスワードでもログインできます。
              </p>
            )}
            {passwordStatus === 'error' && (
              <p style={{ color: 'var(--redpen)', fontSize: '12.5px' }}>{passwordError}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
