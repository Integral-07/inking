import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Settings() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

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
          <div className="field-label">メールアドレスの変更</div>
          <form className="add-form" onSubmit={handleSubmit} style={{ marginBottom: 8 }}>
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
      </div>
    </section>
  )
}
