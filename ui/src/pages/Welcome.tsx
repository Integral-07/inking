import { Link } from 'react-router-dom'

export function Welcome() {
  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Welcome</div>
        <h1 className="stage-title">Inkling</h1>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div className="detail-body" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div className="wordmark" style={{ fontSize: '42px' }}>
            Inkling
          </div>
          <p className="wordmark-sub" style={{ marginBottom: '32px' }}>
            a hunch, inked in
          </p>

          <div className="article-text" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
            <p>
              英文記事を読みながら気になった単語や表現をその場で拾い、書き留め、育てていくためのアプリです。まだ確信はないけれど気になったこと——inkling——を、少しずつ自分の言葉にしていきます。
            </p>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link className="btn btn-primary" to="/">
              はじめる
            </Link>
            <Link className="btn btn-ghost" to="/help">
              使い方を見る
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
