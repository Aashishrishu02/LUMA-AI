import { useState, useEffect } from 'react'
import './styles/global.css'
import Navbar      from './components/Navbar'
import Hero        from './components/Hero'
import MoodTracker from './components/MoodTracker'
import Journal     from './components/Journal'
import Chatbot     from './components/Chatbot'
import Quotes      from './components/Quotes'
import Meditation  from './components/Meditation'
import Login       from './components/Login'
import Register    from './components/Register'
import Footer      from './components/Footer'
import Dashboard   from './components/Dashboard'
import UserProfile from './components/UserProfile'
import Analytics   from './components/Analytics'
import Notifications from './components/Notifications'

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [token, setToken] = useState(localStorage.getItem('luma_token') || null)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('luma_theme') || 'dark')

  // Apply visual theme to html/body elements
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
    localStorage.setItem('luma_theme', theme)
  }, [theme])

  // Fetch current user details on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('luma_token', token)
      fetchUserProfile()
    } else {
      localStorage.removeItem('luma_token')
      setUser(null)
      if (activePage !== 'home' && activePage !== 'quotes' && activePage !== 'meditation' && activePage !== 'login' && activePage !== 'register') {
        setActivePage('home')
      }
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        // If theme or lang is saved in user preferences, set it
        if (data.user.preferences?.theme) {
          setTheme(data.user.preferences.theme)
        }
        // Redirect to dashboard if logged in and currently on home/login/register pages
        setActivePage(prev => (prev === 'home' || prev === 'login' || prev === 'register') ? 'dashboard' : prev)
      } else {
        // Clear expired token
        setToken(null)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setToken(null)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setActivePage('home')
  }

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser)
    if (updatedUser.preferences?.theme) {
      setTheme(updatedUser.preferences.theme)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        token={token} 
        user={user} 
        logout={logout}
        theme={theme}
        setTheme={setTheme}
      />
      
      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <>
            <Hero setActivePage={setActivePage} />
            <div style={{ padding: '0 clamp(16px, 5vw, 80px)', maxWidth: 1280, margin: '0 auto' }}>
              <QuickNav setActivePage={setActivePage} token={token} />
            </div>
            <Footer setActivePage={setActivePage} />
          </>
        )}
        
        {/* Logged in views */}
        {activePage === 'dashboard'  && <FeaturePage><Dashboard setActivePage={setActivePage} token={token} user={user} updateUserProfile={updateUserProfile} /></FeaturePage>}
        {activePage === 'mood'       && <FeaturePage><MoodTracker token={token} /></FeaturePage>}
        {activePage === 'journal'    && <FeaturePage><Journal token={token} /></FeaturePage>}
        {activePage === 'chat'       && <FeaturePage><Chatbot token={token} user={user} /></FeaturePage>}
        {activePage === 'profile'    && <FeaturePage><UserProfile token={token} user={user} updateUserProfile={updateUserProfile} setActivePage={setActivePage} logout={logout} /></FeaturePage>}
        {activePage === 'analytics'  && <FeaturePage><Analytics token={token} /></FeaturePage>}
        {activePage === 'notifications' && <FeaturePage><Notifications setActivePage={setActivePage} /></FeaturePage>}

        {/* Guest access allowed views */}
        {activePage === 'quotes'     && <FeaturePage><Quotes /></FeaturePage>}
        {activePage === 'meditation' && <FeaturePage><Meditation token={token} /></FeaturePage>}
        {activePage === 'login'      && <Login setActivePage={setActivePage} setToken={setToken} />}
        {activePage === 'register'   && <Register setActivePage={setActivePage} setToken={setToken} />}
      </main>
    </div>
  )
}

function QuickNav({ setActivePage, token }) {
  const cards = [
    { id: 'mood',       icon: '🌊', label: 'Mood Tracker', desc: 'Track how you feel, day by day',    color: '#7c3aed' },
    { id: 'journal',    icon: '📓', label: 'Journal',      desc: 'Write your thoughts freely',        color: '#0e7490' },
    { id: 'chat',       icon: '✦',  label: 'AI Companion', desc: 'Talk to LUMA anytime',              color: '#6d28d9' },
    { id: 'quotes',     icon: '❋',  label: 'Inspiration',  desc: 'Curated words of wisdom',           color: '#b45309' },
    { id: 'meditation', icon: '◎',  label: 'Breathe',      desc: 'Guided breathing exercises',        color: '#065f46' },
  ]

  const handleNav = (id) => {
    if (!token && (id === 'mood' || id === 'journal' || id === 'chat')) {
      setActivePage('login')
    } else {
      setActivePage(id)
    }
  }

  return (
    <section style={{ padding: '40px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="section-tag">Your Space</span>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Everything you need</h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Tools crafted for your inner peace
        </p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleNav(card.id)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px 24px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = card.color + '66'
              e.currentTarget.style.boxShadow = `0 20px 60px ${card.color}22`
              e.currentTarget.style.background = 'var(--surface2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <div style={{
              width: 48, height: 48,
              background: card.color + '22',
              border: `1px solid ${card.color}44`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 20,
            }}>{card.icon}</div>

            {/* Card label — Trispace */}
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--text)',
              marginBottom: 8,
            }}>
              {card.label}
            </div>

            {/* Card desc — body font */}
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>{card.desc}</div>

            <div style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 12, color: card.color, opacity: 0.7 }}>→</div>
          </button>
        ))}
      </div>
    </section>
  )
}

function FeaturePage({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(90px, 10vw, 120px) clamp(16px, 5vw, 80px) 60px',
      maxWidth: 1100,
      margin: '0 auto',
      animation: 'fadeUp 0.5s ease',
    }}>
      {children}
    </div>
  )
}
