/* ============================================================
   Hero.jsx — UPDATED
   Changes:
   - Full-viewport centered layout (both axes)
   - Stronger gradient overlays so Spline never bleeds into text
   - Three-tier typography: Press Start 2P title → Trispace
     subheading → Monda body copy
   - Balanced spacing & visual hierarchy
   - Responsive at all breakpoints
   ============================================================ */
import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export default function Hero({ setActivePage }) {
  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      minHeight: 700,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',   /* ← horizontally centered */
    }}>

      {/* ── Spline 3D Background ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none',
      }}>
        <Suspense fallback={<SplineFallback />}>
          <Spline
            scene="https://prod.spline.design/x6nLiiwUGYUEhKFF/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          />
        </Suspense>
      </div>

      {/* ── Readability overlays ── */}
      {/* Radial dark centre so text area is always readable */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(4,4,10,0.78) 0%, rgba(4,4,10,0.45) 60%, transparent 100%)',
      }} />
      {/* Full dark vignette around edges */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(4,4,10,0.65) 100%)',
      }} />
      {/* Bottom fade into page bg */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '35%', zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to top, var(--bg) 0%, rgba(4,4,10,0.6) 60%, transparent 100%)',
      }} />
      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '18%', zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(4,4,10,0.7) 0%, transparent 100%)',
      }} />

      {/* ── Hero Content — centred ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 clamp(24px, 6vw, 80px)',
        maxWidth: 820,
        width: '100%',
        animation: 'fadeUp 0.9s ease 0.2s both',
      }}>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(167,139,250,0.08)',
          border: '1px solid rgba(167,139,250,0.22)',
          borderRadius: 100, padding: '7px 18px',
          marginBottom: 36,
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--teal)',
            boxShadow: '0 0 10px var(--teal)',
            display: 'inline-block',
            animation: 'pulse-glow 2s ease infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.55rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'var(--accent)',
          }}>
            YOUR WELLNESS COMPANION
          </span>
        </div>

        {/* ── Main title — LUMA in Press Start 2P, huge ── */}
        <h1 style={{
         // fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 12vw, 7rem)',
          lineHeight: 1.1,
          letterSpacing: '0.08em',
          marginBottom: 28,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--teal) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(167,139,250,0.55))',
        }}>
          LUMA
        </h1>

        {/* ── Subheading — "Your mind matters. Luma listens." in Trispace ── */}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(0.9rem, 2vw, 1.25rem)',
          fontWeight: 500,
          color: 'var(--text)',
          letterSpacing: '0.06em',
          lineHeight: 1.6,
          maxWidth: 560,
          marginBottom: 48,
          textShadow: '0 2px 24px rgba(4,4,10,0.9)',
        }}>
          Your mind matters.{' '}
          <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>Luma listens.</span>
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <button
            onClick={() => setActivePage('chat')}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', borderRadius: 100,
              padding: '15px 36px',
              color: '#fff',
             // fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 40px var(--accent-glow)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 8px 60px rgba(167,139,250,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 0 40px var(--accent-glow)'
            }}
          >
            Talk to LUMA ✦
          </button>
          <button
            onClick={() => setActivePage('meditation')}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border2)', borderRadius: 100,
              padding: '15px 36px',
              color: 'var(--text)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem', fontWeight: 400,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'
              e.currentTarget.style.background = 'rgba(167,139,250,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border2)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            Breathe with me ◎
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: 'flex', gap: 48, flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '28px 48px',
          background: 'rgba(4,4,10,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 100,
        }}>
          {[['10K+', 'Users'], ['∞', 'Journals'], ['24/7', 'Available']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
               // fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)',
                color: 'var(--accent)',
                marginBottom: 6,
                filter: 'drop-shadow(0 0 10px var(--accent-glow))',
              }}>{num}</div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.62rem',
                color: 'var(--text-dim)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SplineFallback() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)',
    }} />
  )
}
