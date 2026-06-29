import { useState } from 'react'

export default function UserProfile({ token, user, updateUserProfile, setActivePage, logout }) {
  const [name, setName] = useState(user?.name || '')
  const [goals, setGoals] = useState(user?.goals || '')
  const [language, setLanguage] = useState(user?.preferences?.language || 'en-IN')
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          goals,
          preferences: { language, theme }
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      
      updateUserProfile(data.user)
      setSuccess('Profile updated successfully! Luma remembers. 🌙')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease', maxWidth: 640, margin: '0 auto' }}>
      <span className="section-tag">Settings</span>
      <h2 className="section-title">Your Profile</h2>
      <p className="section-sub" style={{ marginBottom: 32 }}>Configure preferences and share goals to customize your Luma experience.</p>

      {success && (
        <div style={{
          background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 24,
          color: 'var(--teal)', fontSize: '0.8rem', animation: 'fadeUp 0.3s'
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 24,
          color: 'var(--rose)', fontSize: '0.8rem', animation: 'fadeUp 0.3s'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Name Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <label style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
            display: 'block', marginBottom: 10
          }}>
            Full Name / Nickname
          </label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            required placeholder="Name"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)',
              fontSize: '0.9rem', outline: 'none'
            }}
          />
        </div>

        {/* Goals Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px'
        }}>
          <label style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
            display: 'block', marginBottom: 10
          }}>
            Your Goals / Focus
          </label>
          <textarea
            value={goals} onChange={e => setGoals(e.target.value)}
            rows={3} placeholder="E.g. Manage work stress, practice self-compassion, reduce overthinking..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)',
              fontSize: '0.88rem', lineHeight: 1.6, outline: 'none', resize: 'none'
            }}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.4 }}>
            💡 Luma uses these goals to check in on you and suggest mindfulness techniques matching your intentions.
          </p>
        </div>

        {/* Preferences Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '28px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20
        }}>
          <div>
            <label style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
              display: 'block', marginBottom: 10
            }}>
              Voice Language Pack
            </label>
            <select
              value={language} onChange={e => setLanguage(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)',
                fontSize: '0.82rem', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
              <option value="bn-IN">Bengali (বাংলা)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
              <option value="te-IN">Telugu (తెలుగు)</option>
              <option value="mr-IN">Marathi (मराठी)</option>
            </select>
          </div>

          <div>
            <label style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
              display: 'block', marginBottom: 10
            }}>
              Visual Interface Theme
            </label>
            <select
              value={theme} onChange={e => setTheme(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)',
                fontSize: '0.82rem', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="dark">Dark Theme 🌙</option>
              <option value="light">Light Theme ☀️</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type="submit" disabled={loading}
            style={{
              flex: 1, padding: '14px 28px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', borderRadius: 100, color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
              letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: '0 0 20px var(--accent-glow)'
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            type="button" onClick={logout}
            style={{
              padding: '14px 28px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 100,
              color: 'var(--rose)', fontFamily: 'var(--font-body)',
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,113,133,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Logout Account ✕
          </button>
        </div>

      </form>
    </div>
  )
}
