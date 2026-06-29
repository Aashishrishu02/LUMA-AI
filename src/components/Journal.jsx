import { useState, useEffect } from 'react'

export default function Journal({ token }) {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [viewing, setViewing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchJournals()
  }, [token])

  const fetchJournals = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/journal', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length

  const save = async () => {
    if (!body.trim() || loading) return
    setLoading(true)
    setSaved(false)
    
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Entry',
          body: body,
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        })
      })
      const newEntry = await res.json()
      if (res.ok) {
        setEntries(prev => [newEntry, ...prev])
        setTitle('')
        setBody('')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Error saving journal:', err)
    }
    setLoading(false)
  }

  const deleteEntry = async (id) => {
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setEntries(prev => prev.filter(e => e.id !== id))
        if (viewing?.id === id) setViewing(null)
      }
    } catch (err) {
      console.error(err)
    }
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
          {viewing.date} · {viewing.words} words
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2vw, 1.4rem)', marginBottom: 28, lineHeight: 1.4 }}>
          {viewing.title}
        </h2>

        {/* AI Reflection Panel */}
        <div style={{
          background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24,
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✦</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--accent)', letterSpacing: '0.04em' }}>
              LUMA'S REFLECTION
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{viewing.summary}"
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {viewing.themes.map((theme, i) => (
              <span key={i} style={{ fontSize: '0.65rem', background: 'var(--surface2)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 4 }}>
                🏷️ {theme}
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: 4 }}>STRENGTHS REVEALED</div>
              {viewing.positives.map((p, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--teal)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span>✓</span> <span>{p}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: 4 }}>COPING STRATEGIES</div>
              {viewing.coping.map((c, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span>◆</span> <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Journal content body */}
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
            fontSize: '0.75rem', cursor: 'pointer', marginTop: 24,
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
      <h2 className="section-title">Your Private Sanctuary</h2>
      <p className="section-sub">Free-write your thoughts. Luma will analyze emotional patterns and coping suggestions.</p>

      {saved && (
        <div style={{
          background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 28,
          color: 'var(--teal)', fontSize: '0.82rem', animation: 'fadeUp 0.4s ease',
        }}>✓ Entry analyzed and saved successfully.</div>
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
          disabled={loading}
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
          placeholder="What is happening in your life? Describe your thoughts and emotions..."
          rows={10}
          disabled={loading}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-body)',
            fontSize: '0.9rem', lineHeight: 1.85, resize: 'none',
            outline: 'none', fontWeight: 300,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {loading ? 'Luma is reflecting...' : `${wordCount} words`}
          </span>
          <button
            onClick={save}
            disabled={!body.trim() || loading}
            style={{
              background: body.trim() && !loading
                ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 100,
              padding: '10px 28px',
              color: body.trim() && !loading ? '#fff' : 'var(--text-dim)',
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              fontWeight: 500, letterSpacing: '0.08em',
              cursor: body.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: body.trim() && !loading ? '0 0 24px var(--accent-glow)' : 'none',
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze & Save'}
          </button>
        </div>
      </div>

      {/* Search and List */}
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
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 10 }}>
                  {entry.body}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {entry.themes.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.62rem', background: 'var(--surface2)', color: 'var(--accent)', borderRadius: 4, padding: '2px 6px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
