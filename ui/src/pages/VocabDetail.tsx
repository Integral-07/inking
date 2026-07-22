import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUpdateVocabEntry, useVocabEntry } from '../hooks/vocab'

export function VocabDetail() {
  const { id } = useParams<{ id: string }>()
  const { entry, loading, refresh } = useVocabEntry(id)
  const { updateVocabEntry, saving } = useUpdateVocabEntry()

  const [definition, setDefinition] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (entry) {
      setDefinition(entry.definition ?? '')
      setNotes(entry.notes ?? '')
    }
  }, [entry])

  async function handleSave() {
    if (!id) return
    await updateVocabEntry(id, { definition, notes })
    await refresh()
  }

  return (
    <section>
      <div className="stage-header">
        <div className="eyebrow">Vocabulary / Word detail</div>
        <h1 className="stage-title">単語詳細</h1>
      </div>

      <div className="frame">
        <div className="frame-bar">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div className="detail-body">
          <Link className="back-link" to="/vocab">
            ← 単語帳
          </Link>

          {loading && <p className="empty-state">読み込み中…</p>}

          {entry && (
            <>
              <div className="detail-word">{entry.term}</div>

              {entry.contextQuote && <blockquote className="ctx">&ldquo;{entry.contextQuote}&rdquo;</blockquote>}

              <div className="field-label">意味・定義</div>
              <textarea
                className="field-box"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="意味を書く…"
              />

              <div className="field-label">メモ・使い方・関連表現</div>
              <textarea
                className="field-box"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="自由にメモを書く…"
              />

              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中…' : 'ink it'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
