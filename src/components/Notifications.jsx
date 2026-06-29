import { useState } from 'react'

export default function Notifications({ setActivePage }) {
  const [list, setList] = useState([
    { id: 1, type: 'mood', text: 'Time for your afternoon check-in. Wave goodbye to stress! 🌊', time: 'Just now', link: 'mood', read: false },
    { id: 2, type: 'breathe', text: 'Feeling tense? Take a 2-minute Box Breathing pause. ◎', time: '2 hours ago', link: 'meditation', read: false },
    { id: 3, type: 'journal', text: 'Reflect on a positive moment today. Write a brief journal entry. 📓', time: '1 day ago', link: 'journal', read: true },
    { id: 4, type: 'insights', text: 'Your Weekly Wellness insights report is ready for review! 🌱', time: '2 days ago', link: 'analytics', read: true }
  ])

  const markAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleAction = (item) => {
    // Mark read
    setList(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    // Redirect
    setActivePage(item.link)
  }

  const unreadCount = list.filter(n => !n.read).length

  return (
    <div style={{ animation: 'fadeUp 0.5s ease', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <span className="section-tag">Notifications</span>
          <h2 className="section-title" style={{ marginBottom: 4 }}>In-App Reminders</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>Daily cues to help you build healthy mindfulness habits.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 100, padding: '6px 16px', color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '0.72rem', cursor: 'pointer'
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map(item => (
          <div
            key={item.id}
            onClick={() => handleAction(item)}
            style={{
              background: 'var(--surface)',
              border: item.read ? '1px solid var(--border)' : '1px solid rgba(167,139,250,0.35)',
              borderRadius: 'var(--radius)', padding: '20px 24px', cursor: 'pointer',
              display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'all 0.25s',
              position: 'relative'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface2)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.borderColor = item.read ? 'var(--border)' : 'rgba(167,139,250,0.35)'
            }}
          >
            {!item.read && (
              <span style={{
                position: 'absolute', top: 22, left: 10, width: 6, height: 6,
                background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent)'
              }} />
            )}
            <span style={{ fontSize: 24, flexShrink: 0 }}>
              {item.type === 'mood' ? '🌊' : (item.type === 'breathe' ? '◎' : (item.type === 'journal' ? '📓' : '🌱'))}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.8rem', color: item.read ? 'var(--text-muted)' : 'var(--text)',
                lineHeight: 1.5, fontWeight: item.read ? 300 : 500, marginBottom: 6
              }}>
                {item.text}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{item.time}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent)', opacity: 0.7, alignSelf: 'center' }}>→</div>
          </div>
        ))}
      </div>
    </div>
  )
}
