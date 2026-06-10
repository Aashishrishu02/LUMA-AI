import { useState, useEffect } from 'react'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [viewing, setViewing] = useState(null)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('luma_journal')
    if (stored) setEntries(JSON.parse(stored))
  }, [])

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length

  const save = () => {
    if (!body.trim()) return
    const entry = {
      id: Date.now(),
      title: title.trim() || 'Untitled',
      body,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      words: wordCount,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('luma_journal', JSON.stringify(updated))
    setTitle('')
    setBody('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem('luma_journal', JSON.stringify(updated))
    if (viewing?.id === id) setViewing(null)
  }

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.body.toLowerCase().includes(search.toLowerCase())
  )

  if (viewing) {
    return (
      <div style={{ animation: 'fadeUp 0.4s ease' }}>
        <button
          onClick={() => setViewing(null)}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 100,
            padding: '8px 18px', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            cursor: 'pointer', marginBottom: 32,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >← Back to Journal</button>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          {viewing.date} · {viewing.time} · {viewing.words} words
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2vw, 1.4rem)', marginBottom: 32, lineHeight: 1.4 }}>
          {viewing.title}
        </h2>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '36px',
          fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--text-muted)',
          whiteSpace: 'pre-wrap', fontWeight: 300,
        }}>
          {viewing.body}
        </div>
        <button
          onClick={() => deleteEntry(viewing.id)}
          style={{
            background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)',
            borderRadius: 100, padding: '9px 20px',
            color: 'var(--rose)', fontFamily: 'var(--font-body)',
            fontSize: '0.75rem', cursor: 'pointer', marginTop: 20,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,113,133,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,113,133,0.08)'}
        >Delete Entry</button>
      </div>
    )
  }

  return (
    <div>
      <span className="section-tag">Journal</span>
      <h2 className="section-title">Your private space</h2>
      <p className="section-sub">Write freely. Your entries are stored only on this device.</p>

      {saved && (
        <div style={{
          background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 28,
          color: 'var(--teal)', fontSize: '0.82rem', animation: 'fadeUp 0.4s ease',
        }}>✓ Entry saved</div>
      )}

      {/* Write area */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '32px', marginBottom: 32,
      }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Entry title..."
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1px solid var(--border)',
            padding: '0 0 16px', marginBottom: 20,
            color: 'var(--text)', fontFamily: 'var(--font-display)',
            fontSize: '0.8rem', letterSpacing: '0.05em', outline: 'none',
          }}
          onFocus={e => e.target.style.borderBottomColor = 'rgba(167,139,250,0.4)'}
          onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What's on your mind today? Write without filters..."
          rows={10}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-body)',
            fontSize: '0.9rem', lineHeight: 1.85, resize: 'none',
            outline: 'none', fontWeight: 300,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{wordCount} words</span>
          <button
            onClick={save}
            disabled={!body.trim()}
            style={{
              background: body.trim()
                ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 100,
              padding: '10px 28px',
              color: body.trim() ? '#fff' : 'var(--text-dim)',
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              fontWeight: 500, letterSpacing: '0.08em',
              cursor: body.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: body.trim() ? '0 0 24px var(--accent-glow)' : 'none',
            }}
          >Save Entry</button>
        </div>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
              style={{
                width: '100%', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 100,
                padding: '12px 20px 12px 44px',
                color: 'var(--text)', fontFamily: 'var(--font-body)',
                fontSize: '0.82rem', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 14 }}>⌕</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(entry => (
              <div
                key={entry.id}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '24px 28px',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                }}
                onClick={() => setViewing(entry)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'
                  e.currentTarget.style.background = 'var(--surface2)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--text)', letterSpacing: '0.05em' }}>
                    {entry.title}
                  </h3>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{entry.date}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{entry.words} words</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {entry.body}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
