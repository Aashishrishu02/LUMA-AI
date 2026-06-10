import { useState, useEffect } from 'react'

const quotes = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", author: "Lori Deschene" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "You are not your illness. You have an individual story to tell.", author: "Julian Seifter" },
  { text: "Breathe. You are doing better than you think.", author: "Unknown" },
  { text: "It's okay to not be okay, as long as you don't give up.", author: "Unknown" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the middle of winter, I at last discovered that there was in me an invincible summer.", author: "Albert Camus" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
  { text: "Healing is not linear. Trust the process.", author: "Unknown" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
  { text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", author: "Ralph Marston" },
]

const categories = ['All', 'Self-love', 'Healing', 'Resilience', 'Mindfulness']

export default function Quotes() {
  const [current, setCurrent] = useState(0)
  const [favorited, setFavorited] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('luma_favorites')
    if (stored) setFavorited(JSON.parse(stored))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      goNext()
    }, 8000)
    return () => clearInterval(interval)
  }, [current])

  const goNext = () => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(c => (c + 1) % quotes.length)
      setTransitioning(false)
    }, 300)
  }

  const goPrev = () => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(c => (c - 1 + quotes.length) % quotes.length)
      setTransitioning(false)
    }, 300)
  }

  const toggleFavorite = (idx) => {
    const updated = favorited.includes(idx)
      ? favorited.filter(f => f !== idx)
      : [...favorited, idx]
    setFavorited(updated)
    localStorage.setItem('luma_favorites', JSON.stringify(updated))
  }

  const quote = quotes[current]

  return (
    <div>
      <span className="section-tag">Inspiration</span>
      <h2 className="section-title">Words that heal</h2>
      <p className="section-sub">Curated quotes to guide you through the day.</p>

      {/* Featured Quote */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'clamp(36px, 6vw, 64px)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Quote mark */}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '4rem',
          color: 'rgba(167,139,250,0.15)', lineHeight: 1,
          marginBottom: 24, userSelect: 'none',
        }}>"</div>

        <blockquote
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1.05rem, 2.5vw, 1.45rem)',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'var(--text)',
            marginBottom: 32,
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(8px)' : 'none',
            transition: 'all 0.3s ease',
            letterSpacing: '0.01em',
          }}
        >
          {quote.text}
        </blockquote>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 32, height: 1,
              background: 'linear-gradient(to right, var(--accent), transparent)',
            }} />
            <span style={{
              fontSize: '0.78rem', color: 'var(--accent)',
              letterSpacing: '0.1em', fontWeight: 400,
              opacity: transitioning ? 0 : 1, transition: 'opacity 0.3s ease',
            }}>
              — {quote.author}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => toggleFavorite(current)}
              style={{
                background: favorited.includes(current) ? 'rgba(251,191,36,0.15)' : 'transparent',
                border: favorited.includes(current) ? '1px solid rgba(251,191,36,0.3)' : '1px solid var(--border)',
                borderRadius: 100, width: 38, height: 38,
                color: favorited.includes(current) ? 'var(--amber)' : 'var(--text-dim)',
                fontSize: 16, cursor: 'pointer', transition: 'all 0.2s',
              }}
              title={favorited.includes(current) ? 'Unfavorite' : 'Favorite'}
            >{favorited.includes(current) ? '★' : '☆'}</button>
            <button
              onClick={goPrev}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 100, width: 38, height: 38,
                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >←</button>
            <button
              onClick={goNext}
              style={{
                background: 'linear-gradient(135deg, var(--accent2), #4c1d95)',
                border: 'none', borderRadius: 100, width: 38, height: 38,
                color: '#fff', cursor: 'pointer', fontSize: 16,
                boxShadow: '0 0 16px var(--accent-glow)', transition: 'all 0.2s',
              }}
            >→</button>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false) }, 300) }}
              style={{
                width: i === current ? 24 : 6, height: 6,
                borderRadius: 100, border: 'none',
                background: i === current ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Favorites */}
      {favorited.length > 0 && (
        <div>
          <button
            onClick={() => setShowFavorites(f => !f)}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 100, padding: '10px 22px',
              color: 'var(--amber)', fontFamily: 'var(--font-body)',
              fontSize: '0.78rem', cursor: 'pointer',
              marginBottom: 20, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >★ Saved quotes ({favorited.length})</button>

          {showFavorites && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.4s ease' }}>
              {favorited.map(idx => (
                <div key={idx} style={{
                  background: 'var(--surface)', border: '1px solid rgba(251,191,36,0.15)',
                  borderRadius: 12, padding: '20px 24px',
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: 8, fontStyle: 'italic', fontWeight: 300 }}>
                    "{quotes[idx].text}"
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>— {quotes[idx].author}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
