export default function Footer({ setActivePage }) {
  const links = [
    { id: 'mood', label: 'Mood Tracker' },
    { id: 'journal', label: 'Journal' },
    { id: 'chat', label: 'AI Companion' },
    { id: 'quotes', label: 'Inspiration' },
    { id: 'meditation', label: 'Breathe' },
  ]

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '60px clamp(24px, 6vw, 100px)',
      background: 'rgba(255,255,255,0.01)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: '#fff',
              }}>✦</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text)' }}>LUMA</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', maxWidth: 260, lineHeight: 1.7 }}>
              Your private sanctuary for mental clarity and inner peace.
            </p>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Features</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(link => (
                <button
                  key={link.id}
                  onClick={() => setActivePage(link.id)}
                  style={{
                    background: 'none', border: 'none', textAlign: 'left',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem', cursor: 'pointer', padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{link.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            © 2025 LUMA. Your data stays on your device.
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Built with care ✦
          </span>
        </div>
      </div>
    </footer>
  )
}
