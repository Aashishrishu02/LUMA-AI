import { useState, useEffect } from 'react'

export default function Dashboard({ setActivePage, token, user, updateUserProfile }) {
  const [stats, setStats] = useState({
    wellnessScore: 75,
    streak: user?.streak || 0,
    totalMoods: 0,
    totalJournals: 0,
    breathingCount: 0,
    meditationCount: 0,
    trend: []
  })
  const [recentJournals, setRecentJournals] = useState([])
  const [stressLevel, setStressLevel] = useState(40)
  const [stressSaved, setStressSaved] = useState(false)
  const [dashboardMood, setDashboardMood] = useState(null)
  const [moodSaved, setMoodSaved] = useState(false)

  const moodsList = [
    { emoji: '😔', label: 'Low', value: 1, color: 'var(--accent)' },
    { emoji: '😐', label: 'Neutral', value: 3, color: 'var(--teal)' },
    { emoji: '😊', label: 'Happy', value: 5, color: 'var(--amber)' },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    if (!token) return
    try {
      // Fetch stats & analytics
      const statsRes = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch recent journals
      const journalsRes = await fetch('/api/journal', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (journalsRes.ok) {
        const journalsData = await journalsRes.json()
        setRecentJournals(journalsData.slice(0, 2))
      }
    } catch (err) {
      console.error('Error fetching dashboard info:', err)
    }
  }

  const saveStress = async () => {
    // Mock save or log exercise session representing stress rating
    setStressSaved(true)
    setTimeout(() => setStressSaved(false), 2000)
    try {
      await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'mindfulness',
          exerciseId: `stress-checkin-${stressLevel}`,
          duration: 0
        })
      })
    } catch(e) {}
  }

  const saveMoodFromDashboard = async (value) => {
    setDashboardMood(value)
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      })
      if (res.ok) {
        setMoodSaved(true)
        setTimeout(() => setMoodSaved(false), 2500)
        fetchDashboardData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate SVG line parameters
  const renderTrendChart = () => {
    const data = stats.trend && stats.trend.length > 0 ? stats.trend : [
      { date: 'Mon', value: 3 },
      { date: 'Tue', value: 4 },
      { date: 'Wed', value: 2 },
      { date: 'Thu', value: 3 },
      { date: 'Fri', value: 5 },
      { date: 'Sat', value: 4 },
      { date: 'Sun', value: 4 },
    ]

    const width = 500
    const height = 150
    const padding = 25
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth
      // Mood is 1 to 5, map to height
      const y = padding + chartHeight - ((d.value - 1) / 4) * chartHeight
      return { x, y, label: d.date, value: d.value }
    })

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
    }, '')

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map(idx => {
          const y = padding + (idx / 4) * chartHeight
          return (
            <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} 
              stroke="var(--border)" strokeWidth={1} strokeDasharray="4,4" />
          )
        })}

        {/* Fill Area */}
        {points.length > 0 && (
          <path d={`${pathD} L ${points[points.length-1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`} 
            fill="url(#chartGrad)" />
        )}

        {/* The Line */}
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {/* Points circles */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} />
            <text x={p.x} y={padding + chartHeight + 16} fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="var(--font-body)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  return (
    <div style={{ animation: 'fadeUp 0.6s ease' }}>
      {/* Welcome banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        <div>
          <span className="section-tag">Dashboard</span>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Welcome back, {user?.name || 'Friend'} 🌙</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>Here is your personal emotional sanctuary for today.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 24 }}>🌱</span>
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wellness Score</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--teal)' }}>
                {stats.wellnessScore}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Widgets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        marginBottom: 36
      }}>
        {/* Mood Check-In Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 8, letterSpacing: '0.05em' }}>
              TODAY'S MOOD
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              How is your energy state right now?
            </p>
            {moodSaved && (
              <div style={{ color: 'var(--teal)', fontSize: '0.75rem', marginBottom: 12, transition: 'all 0.3s' }}>
                ✓ Mood checked in! Streak maintained.
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {moodsList.map(m => (
                <button
                  key={m.value}
                  onClick={() => saveMoodFromDashboard(m.value)}
                  style={{
                    flex: 1,
                    background: dashboardMood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.03)',
                    border: dashboardMood === m.value ? `1px solid ${m.color}` : '1px solid var(--border)',
                    borderRadius: 12, padding: '12px', fontSize: 13,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    cursor: 'pointer', transition: 'all 0.25s'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActivePage('mood')}
            style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', textAlign: 'left',
              marginTop: 20, cursor: 'pointer', display: 'inline-block'
            }}
          >
            Detailed Mood Check-In →
          </button>
        </div>

        {/* Stress Level Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 8, letterSpacing: '0.05em' }}>
            STRESS TRACKER
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 24 }}>
            Rate your stress load dynamically.
          </p>

          <div style={{ margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 8 }}>
              <span>Calm (0%)</span>
              <span style={{ color: stressLevel > 70 ? 'var(--rose)' : (stressLevel > 40 ? 'var(--amber)' : 'var(--teal)'), fontWeight: 600 }}>
                {stressLevel}%
              </span>
              <span>Overwhelmed (100%)</span>
            </div>
            <input
              type="range" min="0" max="100"
              value={stressLevel}
              onChange={e => setStressLevel(parseInt(e.target.value))}
              style={{
                width: '100%', accentColor: 'var(--accent)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 6
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {stressSaved ? '✓ Level logged' : 'Check stress level daily'}
            </span>
            <button
              onClick={saveStress}
              style={{
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 100, padding: '6px 16px', color: 'var(--accent)',
                fontFamily: 'var(--font-body)', fontSize: '0.72rem', cursor: 'pointer'
              }}
            >
              Log Level
            </button>
          </div>
        </div>

        {/* Weekly Trend Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px', gridColumn: 'span 1'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 4, letterSpacing: '0.05em' }}>
            WEEKLY PROGRESS
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 12 }}>
            Your mood fluctuations over the past week
          </p>
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderTrendChart()}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          Quick Wellness Exercises
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}>
          {[
            { id: 'chat', label: 'Empathetic Chat', icon: '💬', color: 'var(--accent)', desc: 'Share your thoughts' },
            { id: 'journal', label: 'Write Journal', icon: '📓', color: 'var(--teal)', desc: 'Reflect privately' },
            { id: 'meditation', label: 'Box Breathing', icon: '◎', color: 'var(--amber)', desc: 'SEAL grounding (4s)' },
            { id: 'quotes', label: 'Inspirations', icon: '❋', color: 'var(--rose)', desc: 'Healing quotes' }
          ].map(action => (
            <button
              key={action.id}
              onClick={() => setActivePage(action.id)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '20px 16px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'flex-start', gap: 14
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ fontSize: 24 }}>{action.icon}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity lists */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24
      }}>
        {/* Recent Journal Entries */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 16, letterSpacing: '0.05em' }}>
            RECENT JOURNAL INSIGHTS
          </h3>
          {recentJournals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 14 }}>No journals logged yet today.</p>
              <button
                onClick={() => setActivePage('journal')}
                style={{
                  background: 'rgba(167,139,250,0.1)', border: 'none', borderRadius: 100,
                  padding: '8px 20px', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer'
                }}
              >
                Write Entry
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentJournals.map(j => (
                <div key={j.id} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{j.title}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{j.date}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8, fontStyle: 'italic' }}>
                    "{j.summary}"
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {j.themes.map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.62rem', background: 'var(--surface2)', color: 'var(--accent)', borderRadius: 4, padding: '2px 6px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Resource Helpline Quickcard */}
        <div style={{
          background: 'var(--surface)', border: '1px solid rgba(251,113,133,0.2)',
          borderRadius: 'var(--radius)', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🛡️</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--rose)', letterSpacing: '0.05em' }}>
                SAFETY & CRISIS CENTER
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
              Luma is a compassionate wellness companion, not a replacement for clinical therapy. If you are experiencing overwhelming distress, please know that you are not alone and help is always available.
            </p>
            <div style={{ background: 'rgba(4,4,10,0.3)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Helpline Resources:</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span>• India (AASRA): 91-9820466726</span>
                <span>• India (Vandrevala): 91-9999666555</span>
                <span>• Global (US/Canada): Dial 988 Lifeline</span>
              </div>
            </div>
          </div>
          <a
            href="https://findahelpline.com" target="_blank" rel="noopener noreferrer"
            style={{
              background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)',
              borderRadius: 100, padding: '10px', color: 'var(--rose)',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', cursor: 'pointer',
              textAlign: 'center', display: 'block', marginTop: 16
            }}
          >
            Find a Local Helpline (Global)
          </a>
        </div>
      </div>
    </div>
  )
}
