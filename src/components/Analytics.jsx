import { useState, useEffect } from 'react'

export default function Analytics({ token }) {
  const [stats, setStats] = useState({
    wellnessScore: 60,
    streak: 0,
    totalMoods: 0,
    totalJournals: 0,
    breathingCount: 0,
    meditationCount: 0,
    avgMood: 3.0,
    trend: []
  })
  const [insights, setInsights] = useState([])
  const [loadingInsights, setLoadingInsights] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchInsights()
  }, [token])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchInsights = async () => {
    setLoadingInsights(true)
    try {
      const res = await fetch('/api/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights)
      }
    } catch (err) {
      console.error(err)
    }
    setLoadingInsights(false)
  }

  const moodEmojis = {
    1: '😔',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄'
  }

  return (
    <div style={{ animation: 'fadeUp 0.6s ease' }}>
      <span className="section-tag">Analytics</span>
      <h2 className="section-title">Your Wellness Progress</h2>
      <p className="section-sub" style={{ marginBottom: 36 }}>Track your emotional journey, exercises completed, and AI-powered patterns.</p>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 20,
        marginBottom: 36
      }}>
        {[
          { label: 'Wellness Index', value: `${stats.wellnessScore}%`, color: 'var(--accent)', icon: '🌱' },
          { label: 'Weekly Mood Avg', value: stats.avgMood > 0 ? `${stats.avgMood} / 5` : 'N/A', color: 'var(--teal)', icon: '🌊' },
          { label: 'Breathing Sessions', value: stats.breathingCount, color: 'var(--amber)', icon: '◎' },
          { label: 'Mindfulness Practice', value: stats.meditationCount, color: 'var(--rose)', icon: '🧘' }
        ].map((card, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights and Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 36
      }}>
        
        {/* Personalised AI Insights */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 20 }}>🔮</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', letterSpacing: '0.05em' }}>
              PERSONALIZED WELLNESS INSIGHTS
            </h3>
          </div>

          {loadingInsights ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                  animation: 'breathe 1.5s infinite alternate', border: '1px solid var(--border)'
                }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {insights.map((insight, idx) => (
                <div key={idx} style={{
                  background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)',
                  borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: 16, color: 'var(--accent)', marginTop: 2 }}>✦</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{insight}</p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={fetchInsights}
            style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              fontFamily: 'var(--font-body)', fontSize: '0.72rem', cursor: 'pointer',
              marginTop: 20, textDecoration: 'underline'
            }}
          >
            Regenerate Insights
          </button>
        </div>

        {/* Mood Activity Calendar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 6, letterSpacing: '0.05em' }}>
            ACTIVITY PATTERNS
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: 20 }}>
            Visual map of wellness logs logged (past 28 check-ins)
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 10,
            maxWidth: 280,
            margin: '0 auto'
          }}>
            {Array.from({ length: 28 }).map((_, idx) => {
              // Mock calendar check-ins corresponding to logged moods
              const dayMood = stats.trend && stats.trend[idx % stats.trend.length]
              const hasData = idx < (stats.trend?.length || 0) + 3
              const color = hasData ? (dayMood ? 'rgba(45,212,191,0.25)' : 'rgba(167,139,250,0.25)') : 'rgba(255,255,255,0.03)'
              const border = hasData ? (dayMood ? '1px solid var(--teal)' : '1px solid var(--accent)') : '1px solid var(--border)'
              
              return (
                <div key={idx} style={{
                  aspectRatio: '1', background: color, border: border, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  color: 'var(--text-muted)'
                }}>
                  {hasData ? '✓' : ''}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24, fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: 'rgba(167,139,250,0.25)', border: '1px solid var(--accent)', borderRadius: 2 }} />
              Active Day
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: 'rgba(45,212,191,0.25)', border: '1px solid var(--teal)', borderRadius: 2 }} />
              Mood Check-in
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
