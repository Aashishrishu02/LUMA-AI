import { useState } from 'react'

export default function Register({ setActivePage, setToken }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess('Account created successfully! Welcome to Luma. ✨')
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      
      // Update token in parent, which will auto-fetch profile and redirect
      setTimeout(() => {
        setToken(data.token)
      }, 1000)

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

      {/* Main form container */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, animation: 'fadeUp 0.7s ease' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 4vw, 1.3rem)', letterSpacing: '0.15em', color: 'var(--text)', marginBottom: 12, textTransform: 'uppercase' }}>
            Join Luma
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Start your wellness journey today
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '40px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(167,139,250,0.06)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Name */}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                Full Name
              </label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                Password (min 6 chars)
              </label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
                Confirm Password
              </label>
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {error && <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--rose)', fontSize: '0.78rem' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--teal)', fontSize: '0.78rem' }}>{success}</div>}

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 10, padding: '14px 24px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', borderRadius: 100, color: '#fff',
                fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.25s ease',
                boxShadow: '0 0 30px rgba(167,139,250,0.25)',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0', opacity: 0.4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            onClick={() => setActivePage('login')}
            style={{
              width: '100%', padding: '12px 24px', background: 'transparent',
              border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontSize: '0.72rem',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Already have an account? Sign In
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
