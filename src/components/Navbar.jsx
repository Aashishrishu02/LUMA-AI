import { useState, useEffect } from 'react'

export default function Navbar({ activePage, setActivePage, token, user, logout, theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Dynamic links based on login state
  const links = token
    ? [
        { id: 'dashboard',   label: 'Home' },
        { id: 'mood',        label: 'Mood' },
        { id: 'journal',     label: 'Journal' },
        { id: 'chat',        label: 'AI Chat' },
        { id: 'meditation',  label: 'Breathe' },
        { id: 'analytics',   label: 'Stats' }
      ]
    : [
        { id: 'home',        label: 'Home' },
        { id: 'quotes',      label: 'Quotes' },
        { id: 'meditation',  label: 'Breathe' }
      ]

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleNav = (id) => {
    setActivePage(id)
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 clamp(16px, 5vw, 60px)',
      height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'var(--bg2)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.4s ease',
    }}>

      {/* Brand */}
      <button
        onClick={() => setActivePage(token ? 'dashboard' : 'home')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px var(--accent-glow)',
          fontSize: 14, color: '#fff',
        }}>✦</div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          color: 'var(--text)',
        }}>LUMA</span>
      </button>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => handleNav(link.id)}
            style={{
              background: activePage === link.id ? 'var(--surface2)' : 'none',
              border: activePage === link.id ? '1px solid var(--border2)' : '1px solid transparent',
              borderRadius: 100,
              padding: '6px 14px',
              color: activePage === link.id ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: activePage === link.id ? 700 : 400,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              if (activePage !== link.id) {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'var(--border)'
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

      {/* Controls & Auth Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        
        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '50%', width: 36, height: 36, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            fontSize: 16, transition: 'all 0.3s'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {token && (
          <button
            onClick={() => setActivePage('notifications')}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 36, height: 36, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              fontSize: 15, transition: 'all 0.3s', position: 'relative'
            }}
            title="Notifications"
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            🔔
            <span style={{
              position: 'absolute', top: 8, right: 8, width: 6, height: 6,
              background: 'var(--rose)', borderRadius: '50%', boxShadow: '0 0 6px var(--rose)'
            }} />
          </button>
        )}

        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setActivePage('profile')}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 100, padding: '7px 14px', color: 'var(--text-muted)',
                fontFamily: 'var(--font-heading)', fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              👤 {user?.name?.split(' ')[0] || 'Profile'}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setActivePage('login')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 100,
                padding: '8px 16px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.68rem', fontWeight: 600,
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
                padding: '9px 20px',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.7)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.4)'}
            >Start Now</button>
          </>
        )}
      </div>
    </nav>
  )
}
