/* ============================================================
   Navbar.jsx — UPDATED
   - Logo / brand text: Press Start 2P (--font-display)
   - Nav links: Trispace (--font-heading)
   - CTA button: Trispace (--font-heading)
   ============================================================ */
import { useState, useEffect } from 'react'

const navLinks = [
  { id: 'mood',       label: 'Mood'    },
  { id: 'journal',    label: 'Journal' },
  { id: 'chat',       label: 'Chat'    },
  { id: 'quotes',     label: 'Quotes'  },
  { id: 'meditation', label: 'Breathe' },
]

export default function Navbar({ activePage, setActivePage }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 clamp(16px, 5vw, 60px)',
      height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(4,4,10,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.4s ease',
    }}>

      {/* Brand */}
      <button
        onClick={() => setActivePage('home')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{
          width: 34, height: 34,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px var(--accent-glow)',
          fontSize: 15, color: '#fff',
        }}>✦</div>
        {/* Press Start 2P for brand name */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          color: 'var(--text)',
        }}>LUMA</span>
      </button>

      {/* Nav links — Trispace */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setActivePage(link.id)}
            style={{
              background: activePage === link.id ? 'rgba(167,139,250,0.12)' : 'none',
              border: activePage === link.id ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
              borderRadius: 100,
              padding: '7px 16px',
              color: activePage === link.id ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',      /* ← Trispace */
              fontSize: '0.72rem',
              fontWeight: activePage === link.id ? 600 : 400,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              if (activePage !== link.id) {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'var(--border2)'
              }
            }}
            onMouseLeave={e => {
              if (activePage !== link.id) {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.borderColor = 'transparent'
              }
            }}
          >{link.label}</button>
        ))}
      </div>

      {/* Auth buttons + CTA — Trispace */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setActivePage('login')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 100,
            padding: '8px 16px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)'
            e.currentTarget.style.background = 'rgba(167,139,250,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
            e.currentTarget.style.background = 'transparent'
          }}
        >Sign In</button>

        <button
          onClick={() => setActivePage('register')}
          style={{
            background: 'linear-gradient(135deg, var(--accent2), #4c1d95)',
            border: 'none', borderRadius: 100,
            padding: '9px 22px',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.7)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.4)'}
        >Start Now</button>
      </div>
    </nav>
  )
}
