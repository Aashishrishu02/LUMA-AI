/* ============================================================
   Register.jsx
   Matches LUMA aesthetic:
   - Glassmorphic form with subtle border
   - Press Start 2P heading, Trispace labels, Monda body
   - Purple accent colors with glow effects
   - Smooth transitions & animations
   - Multi-field signup form
   ============================================================ */
import { useState } from 'react'

export default function Register({ setActivePage }) {
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

  const handleSubmit = (e) => {
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
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess('Account created successfully! Welcome to LUMA. ✨')
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      setTimeout(() => setActivePage('home'), 1500)
    }, 1200)
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
        position: 'absolute',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent)',
        borderRadius: '50%',
        top: '-10%', right: '-5%',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(45,212,191,0.08), transparent)',
        borderRadius: '50%',
        bottom: '10%', left: '-8%',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />

      {/* Main form container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 480,
        animation: 'fadeUp 0.7s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
            letterSpacing: '0.15em',
            color: 'var(--text)',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            Join LUMA
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.03em',
          }}>
            Start your wellness journey today
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '48px 36px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(167,139,250,0.08)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name field */}
            <div>
              <label style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                  e.target.style.borderColor = 'rgba(167,139,250,0.4)'
                  e.target.style.boxShadow = '0 0 20px rgba(167,139,250,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)'
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Email field */}
            <div>
              <label style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                  e.target.style.borderColor = 'rgba(167,139,250,0.4)'
                  e.target.style.boxShadow = '0 0 20px rgba(167,139,250,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)'
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password field */}
            <div>
              <label style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                  letterSpacing: '0.1em',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                  e.target.style.borderColor = 'rgba(167,139,250,0.4)'
                  e.target.style.boxShadow = '0 0 20px rgba(167,139,250,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)'
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Confirm password field */}
            <div>
              <label style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: 8,
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                  letterSpacing: '0.1em',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                  e.target.style.borderColor = 'rgba(167,139,250,0.4)'
                  e.target.style.boxShadow = '0 0 20px rgba(167,139,250,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)'
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(251,113,133,0.1)',
                border: '1px solid rgba(251,113,133,0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                color: '#fb7185',
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                animation: 'fadeUp 0.3s ease',
              }}>
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div style={{
                background: 'rgba(45,212,191,0.1)',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                color: 'var(--teal)',
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                animation: 'fadeUp 0.3s ease',
              }}>
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 12,
                padding: '14px 24px',
                background: loading
                  ? 'rgba(167,139,250,0.2)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: '1px solid rgba(167,139,250,0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: loading ? 'none' : '0 0 30px rgba(167,139,250,0.25)',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(167,139,250,0.35)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(167,139,250,0.25)'
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '32px 0',
            opacity: 0.4,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Login link */}
          <button
            onClick={() => setActivePage('login')}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(167,139,250,0.08)'
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'
            }}
          >
            Already have an account? Sign In
          </button>
        </div>

        {/* Back to home */}
        <button
          onClick={() => setActivePage('home')}
          style={{
            marginTop: 24,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'color 0.25s ease',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          ← Back to Home
        </button>
      </div>
    </section>
  )
}
