import { useState, useEffect } from 'react'

const moods = [
  { emoji: '😔', label: 'Low', value: 1, color: '#6366f1' },
  { emoji: '😕', label: 'Meh', value: 2, color: '#8b5cf6' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#a78bfa' },
  { emoji: '🙂', label: 'Good', value: 4, color: '#2dd4bf' },
  { emoji: '😄', label: 'Great', value: 5, color: '#34d399' },
]

const feelings = ['Anxious', 'Calm', 'Focused', 'Tired', 'Motivated', 'Grateful', 'Overwhelmed', 'Content', 'Hopeful', 'Sad']

export default function MoodTracker() {
  const [selected, setSelected] = useState(null)
  const [selectedFeelings, setSelectedFeelings] = useState([])
  const [note, setNote] = useState('')
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('luma_moods')
    if (stored) setHistory(JSON.parse(stored))
  }, [])

  const toggleFeeling = (f) => {
    setSelectedFeelings(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const save = () => {
    if (!selected) return
    const entry = {
      id: Date.now(),
      mood: selected,
      feelings: selectedFeelings,
      note,
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [entry, ...history].slice(0, 30)
    setHistory(updated)
    localStorage.setItem('luma_moods', JSON.stringify(updated))
    setSaved(true)
    setSelected(null)
    setSelectedFeelings([])
    setNote('')
    setTimeout(() => setSaved(false), 3000)
  }

  const accentColor = selected ? moods.find(m => m.value === selected)?.color : 'var(--accent)'

  return (
    <div>
      <span className="section-tag">Mood Tracker</span>
      <h2 className="section-title">How are you feeling?</h2>
      <p className="section-sub">Check in with yourself. No judgment, just awareness.</p>

      {saved && (
        <div style={{
          background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 32,
          color: 'var(--teal)', fontSize: '0.82rem', letterSpacing: '0.05em',
          animation: 'fadeUp 0.4s ease',
        }}>
          ✓ Mood saved successfully
        </div>
      )}

      {/* Mood selector */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '36px', marginBottom: 20,
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
          Select your mood
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {moods.map(mood => (
            <button
              key={mood.value}
              onClick={() => setSelected(mood.value)}
              style={{
                background: selected === mood.value ? `${mood.color}22` : 'rgba(255,255,255,0.03)',
                border: selected === mood.value ? `1px solid ${mood.color}66` : '1px solid var(--border)',
                borderRadius: 16,
                padding: '20px 24px',
                cursor: 'pointer',
                flex: '1 1 80px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all 0.25s ease',
                boxShadow: selected === mood.value ? `0 0 30px ${mood.color}33` : 'none',
                transform: selected === mood.value ? 'translateY(-3px)' : 'none',
              }}
              onMouseEnter={e => {
                if (selected !== mood.value) {
                  e.currentTarget.style.borderColor = mood.color + '44'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (selected !== mood.value) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                }
              }}
            >
              <span style={{ fontSize: 32 }}>{mood.emoji}</span>
              <span style={{
                fontSize: '0.68rem', fontFamily: 'var(--font-body)', letterSpacing: '0.08em',
                color: selected === mood.value ? mood.color : 'var(--text-muted)',
                fontWeight: selected === mood.value ? 600 : 300,
              }}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feelings tags */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '32px', marginBottom: 20,
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          What are you feeling?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {feelings.map(f => (
            <button
              key={f}
              onClick={() => toggleFeeling(f)}
              style={{
                background: selectedFeelings.includes(f) ? 'rgba(167,139,250,0.15)' : 'transparent',
                border: selectedFeelings.includes(f) ? '1px solid rgba(167,139,250,0.5)' : '1px solid var(--border)',
                borderRadius: 100,
                padding: '7px 16px',
                color: selectedFeelings.includes(f) ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '32px', marginBottom: 24,
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Quick note (optional)
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What's on your mind right now..."
          rows={3}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '14px 18px', color: 'var(--text)',
            fontSize: '0.85rem', lineHeight: 1.7, resize: 'vertical',
            outline: 'none', fontFamily: 'var(--font-body)', fontWeight: 300,
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <button
        onClick={save}
        disabled={!selected}
        style={{
          background: selected
            ? `linear-gradient(135deg, ${accentColor}, rgba(124,58,237,0.8))`
            : 'rgba(255,255,255,0.05)',
          border: 'none', borderRadius: 100,
          padding: '13px 36px',
          color: selected ? '#fff' : 'var(--text-dim)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem', fontWeight: 500,
          letterSpacing: '0.08em',
          cursor: selected ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          boxShadow: selected ? `0 0 30px ${accentColor}44` : 'none',
          marginBottom: 60,
        }}
      >Save Mood Check-in</button>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
            Recent Check-ins
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.slice(0, 7).map(entry => {
              const moodData = moods.find(m => m.value === entry.mood)
              return (
                <div key={entry.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <span style={{ fontSize: 24 }}>{moodData?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', color: moodData?.color, fontWeight: 500 }}>{moodData?.label}</span>
                      {entry.feelings.slice(0, 3).map(f => (
                        <span key={f} style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--surface2)', borderRadius: 100, padding: '2px 10px' }}>{f}</span>
                      ))}
                    </div>
                    {entry.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{entry.note}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{entry.date}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{entry.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
