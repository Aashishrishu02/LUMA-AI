import { useState, useEffect } from 'react'

const moods = [
  { emoji: '😔', label: 'Low', value: 1, color: '#6366f1' },
  { emoji: '😕', label: 'Meh', value: 2, color: '#8b5cf6' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#a78bfa' },
  { emoji: '🙂', label: 'Good', value: 4, color: '#2dd4bf' },
  { emoji: '😄', label: 'Great', value: 5, color: '#34d399' },
]

const feelings = ['Anxious', 'Calm', 'Focused', 'Tired', 'Motivated', 'Grateful', 'Overwhelmed', 'Content', 'Hopeful', 'Sad']

export default function MoodTracker({ token }) {
  const [selected, setSelected] = useState(null)
  const [selectedFeelings, setSelectedFeelings] = useState([])
  const [note, setNote] = useState('')
  const [history, setHistory] = useState([])
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ avgMood: 3, trend: [] })

  useEffect(() => {
    fetchMoodHistory()
  }, [token])

  const fetchMoodHistory = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/mood', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }

      const analyticsRes = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setStats({ avgMood: analyticsData.avgMood, trend: analyticsData.trend })
      }
    } catch (err) {
      console.error('Error fetching mood history:', err)
    }
  }

  const toggleFeeling = (f) => {
    setSelectedFeelings(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const save = async () => {
    if (!selected) return
    
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          value: selected,
          feelings: selectedFeelings,
          note: note,
          date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        })
      })

      if (res.ok) {
        setSaved(true)
        setSelected(null)
        setSelectedFeelings([])
        setNote('')
        setTimeout(() => setSaved(false), 3000)
        fetchMoodHistory()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const accentColor = selected ? moods.find(m => m.value === selected)?.color : 'var(--accent)'

  // Render SVG bars for mood values
  const renderWeeklyBarChart = () => {
    const data = stats.trend && stats.trend.length > 0 ? stats.trend : [
      { date: 'Mon', value: 3 },
      { date: 'Tue', value: 4 },
      { date: 'Wed', value: 2 },
      { date: 'Thu', value: 3 },
      { date: 'Fri', value: 5 },
      { date: 'Sat', value: 4 },
      { date: 'Sun', value: 4 }
    ]

    const width = 400
    const height = 150
    const barWidth = 30
    const gap = 15
    const chartHeight = height - 40 // space for labels
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', maxHeight: 150 }}>
        {/* Horizontal grid lines */}
        {[1, 2, 3, 4, 5].map(val => {
          // Map 1-5 to SVG coordinates
          const y = height - 25 - ((val - 1) / 4) * chartHeight
          return (
            <g key={val}>
              <line x1="30" y1={y} x2={width - 10} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray="3,3" />
              <text x="12" y={y + 3} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-body)">{val}</text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = 40 + i * (barWidth + gap)
          const barHeight = ((d.value - 1) / 4) * chartHeight + 10 // minimum 10px height
          const y = height - 25 - barHeight
          const moodObj = moods.find(m => m.value === d.value) || moods[2]

          return (
            <g key={i}>
              {/* Rounded top bar */}
              <rect
                x={x} y={y} width={barWidth} height={barHeight}
                fill={moodObj.color} rx="6" opacity="0.8"
                style={{ transition: 'all 0.3s' }}
              />
              <text x={x + barWidth / 2} y={height - 8} fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="var(--font-body)">
                {d.date.split(',')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

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

      {/* Grid of Check-in and Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        
        {/* Mood Selector Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Emojis check-in */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '28px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              Select today's mood
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {moods.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelected(mood.value)}
                  style={{
                    background: selected === mood.value ? `${mood.color}22` : 'rgba(255,255,255,0.02)',
                    border: selected === mood.value ? `1px solid ${mood.color}` : '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '16px 12px',
                    cursor: 'pointer',
                    flex: '1 1 60px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.25s ease',
                    boxShadow: selected === mood.value ? `0 0 20px ${mood.color}22` : 'none',
                    transform: selected === mood.value ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 26 }}>{mood.emoji}</span>
                  <span style={{
                    fontSize: '0.62rem', fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                    color: selected === mood.value ? mood.color : 'var(--text-dim)',
                    fontWeight: selected === mood.value ? 600 : 300,
                  }}>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feelings */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '28px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
              What specific feelings are active?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {feelings.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFeeling(f)}
                  style={{
                    background: selectedFeelings.includes(f) ? 'rgba(167,139,250,0.15)' : 'transparent',
                    border: selectedFeelings.includes(f) ? '1px solid rgba(167,139,250,0.5)' : '1px solid var(--border)',
                    borderRadius: 100,
                    padding: '6px 14px',
                    color: selectedFeelings.includes(f) ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.74rem',
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
            borderRadius: 'var(--radius)', padding: '28px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Check-in Reflection note
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What triggered this emotion? Write a brief detail..."
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 16px', color: 'var(--text)',
                fontSize: '0.82rem', lineHeight: 1.6, resize: 'none',
                outline: 'none', fontFamily: 'var(--font-body)', fontWeight: 300,
              }}
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
              fontSize: '0.8rem', fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: selected ? `0 0 30px ${accentColor}33` : 'none',
              alignSelf: 'flex-start'
            }}
          >Save Mood Check-in</button>

        </div>

        {/* Weekly Trend charts */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px', height: 'fit-content'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 6, letterSpacing: '0.05em' }}>
            WEEKLY TRENDS
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: 20 }}>
            Visual distribution of your ratings over the past week (Mon-Sun checkins).
          </p>
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderWeeklyBarChart()}
          </div>
        </div>

      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Recent Check-in Logs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.slice(0, 8).map(entry => {
              const moodData = moods.find(m => m.value === entry.value)
              return (
                <div key={entry.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <span style={{ fontSize: 24 }}>{moodData?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.76rem', color: moodData?.color, fontWeight: 500 }}>{moodData?.label}</span>
                      {entry.feelings.map(f => (
                        <span key={f} style={{ fontSize: '0.68rem', color: 'var(--text-dim)', background: 'var(--surface2)', borderRadius: 100, padding: '2px 8px' }}>{f}</span>
                      ))}
                    </div>
                    {entry.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300 }}>{entry.note}</div>}
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
