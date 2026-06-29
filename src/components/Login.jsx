import { useState } from 'react'

export default function Login({ setActivePage, setToken }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials')
      }

      setSuccess('Login successful! Welcome back. 🌙')
      setEmail('')
      setPassword('')
      
      // Update token in parent, which will auto-fetch profile and redirect
      setTimeout(() => {
        setToken(data.token)
      }, 1000)

    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'google.guest@luma.com',
          name: 'Google Companion',
          googleId: 'g_1029384756'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google login failed')

      setSuccess('Logged in via Google! ✨')
      setTimeout(() => {
        setToken(data.token)
      }, 1000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!forgotEmail) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await res.json()
      setSuccess(data.message)
      setForgotEmail('')
      setTimeout(() => setShowForgot(false), 3000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px clamp(16px, 5vw, 60px)',
      background: 'linear-gradient(135deg, rgba(167,139,250,0.04) 0%, rgba(45,212,191,0.02) 100%)',
    }}>
      {/* Decorative blur orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(167,139,250,0.1), transparent)',
        borderRadius: '50%', top: '-10%', right: '-5%', pointerEvents: 'none', filter: 'blur(80px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, animation: 'fadeUp 0.7s ease' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 4vw, 1.3rem)', letterSpacing: '0.15em', color: 'var(--text)', marginBottom: 12, textTransform: 'uppercase' }}>
            Welcome
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sign in to continue your sanctuary journey
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '40px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(167,139,250,0.06)',
        }}>
          {!showForgot ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block' }}>
                    Password
                  </label>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.68rem', cursor: 'pointer' }}>
                    Forgot?
                  </button>
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              {error && <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--rose)', fontSize: '0.78rem' }}>{error}</div>}
              {success && <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--teal)', fontSize: '0.78rem' }}>{success}</div>}

              <button
                type="submit" disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  border: 'none', borderRadius: 100, padding: '13px 24px', color: '#fff',
                  fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 0 20px var(--accent-glow)'
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 4 }}>Recover Password</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Enter your email address and Luma will send password recovery guidance instructions.
              </p>

              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                  Registered Email
                </label>
                <input
                  type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="you@example.com"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              {error && <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--rose)', fontSize: '0.78rem' }}>{error}</div>}
              {success && <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--teal)', fontSize: '0.78rem' }}>{success}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="submit" disabled={loading}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    border: 'none', borderRadius: 100, padding: '12px', color: '#fff',
                    fontFamily: 'var(--font-heading)', fontSize: '0.68rem', cursor: 'pointer'
                  }}
                >
                  Send recovery email
                </button>
                <button
                  type="button" onClick={() => { setShowForgot(false); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 100, padding: '12px 20px',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontSize: '0.68rem', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', opacity: 0.4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google SSO simulated */}
          <button
            onClick={handleGoogleLogin} disabled={loading}
            style={{
              width: '100%', padding: '12px 24px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text)', fontFamily: 'var(--font-heading)', fontSize: '0.72rem',
              fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20
            }}
          >
            <span style={{ fontSize: 16 }}>🌐</span> Continue with Google
          </button>

          {/* Signup Link */}
          <button
            onClick={() => setActivePage('register')}
            style={{
              width: '100%', padding: '12px 24px', background: 'transparent',
              border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '0.72rem',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.25s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Create Account
          </button>

        </div>

        <button
          onClick={() => setActivePage('home')}
          style={{ marginTop: 24, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ← Back to Home
        </button>

      </div>
    </section>
  )
}
