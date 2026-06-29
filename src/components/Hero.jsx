import { Suspense, lazy, useState } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

export default function Hero({ setActivePage }) {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const features = [
    { emoji: '💬', title: 'Empathetic AI Companion', desc: 'Talk to Luma in a safe, non-judgmental environment. Receive supportive guidance and mindful reframing.' },
    { emoji: '📞', title: 'Real-time Voice Calls', desc: 'Continuous, interruptible voice conversations powered by smart Voice Activity Detection for natural support.' },
    { emoji: '🌊', title: 'Mood Tracking & Analytics', desc: 'Monitor your emotional baseline. Explore weekly wellness scores, calendars, and trend graphs.' },
    { emoji: '📓', title: 'AI Journal Insights', desc: 'Write freely. Luma automatically outlines emotional themes, highlights positivity, and suggests coping tips.' },
    { emoji: '◎', title: 'Interactive Breathing', desc: 'Master Box Breathing and 4-7-8 routines with a live breathing circle and real-time audio prompts.' },
    { emoji: '🧘', title: 'Mindfulness Grounding', desc: 'Practice active 5-4-3-2-1 grounding, body scanning, and daily gratitude logs to reset stress.' },
  ]

  const testimonials = [
    { text: "Luma has completely changed how I deal with late-night anxiety. It feels like talking to a friend who actually listens.", author: "Sarah M.", role: "Burnout Recovery" },
    { text: "The journaling insights are incredible. It helped me realize that my stress levels were tied directly to my sleep schedule.", author: "David K.", role: "Overthinking & Stress" },
    { text: "The live voice companion has saved me during panic attacks. The box breathing guide is amazing.", author: "Aisha R.", role: "Anxiety Management" },
  ]

  const faqs = [
    { q: "Is my personal data safe and private?", a: "Absolutely. All your journal entries, mood records, and session history are stored locally and sent securely. Your data is private and only accessible by you." },
    { q: "Can Luma diagnose medical conditions?", a: "No, Luma is not a doctor or a licensed therapist and does not diagnose or treat mental health conditions. It is designed to be a companion for daily stress management and self-awareness." },
    { q: "How does the Voice companion work?", a: "Luma voice companion uses high-quality Speech-to-Text and Text-to-Speech loops. It features voice activity detection and interruption, so you can speak normally and even cut in while Luma is talking." },
    { q: "Is Luma free to use?", a: "Yes! The core wellness tools including mood tracking, journaling, breathing guides, and companion chats are fully available to support your wellness journey." },
  ]

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* ── HERO BANNER ── */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: 700,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Spline 3D Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Suspense fallback={<SplineFallback />}>
            <Spline
              scene="https://prod.spline.design/x6nLiiwUGYUEhKFF/scene.splinecode"
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            />
          </Suspense>
        </div>

        {/* Readability overlays */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(4,4,10,0.8) 0%, rgba(4,4,10,0.45) 60%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(4,4,10,0.7) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to top, var(--bg) 0%, rgba(4,4,10,0.6) 60%, transparent 100%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          padding: '0 clamp(24px, 6vw, 80px)', maxWidth: 820, width: '100%',
          animation: 'fadeUp 0.9s ease 0.2s both',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)',
            borderRadius: 100, padding: '7px 18px', marginBottom: 36, backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)',
              boxShadow: '0 0 10px var(--teal)', display: 'inline-block',
              animation: 'pulse-glow 2s ease infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.55rem', fontWeight: 600,
              letterSpacing: '0.2em', color: 'var(--accent)',
            }}>
              YOUR WELLNESS COMPANION
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 11vw, 6.5rem)', lineHeight: 1.1,
            letterSpacing: '0.08em', marginBottom: 20,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--teal) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', filter: 'drop-shadow(0 0 40px rgba(167,139,250,0.55))',
          }}>
            LUMA
          </h1>

          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.9rem, 2vw, 1.25rem)', fontWeight: 500,
            color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1.6, maxWidth: 580, marginBottom: 44,
          }}>
            Your mind matters. <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>Luma listens.</span>
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
            <button
              onClick={() => setActivePage('chat')}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', borderRadius: 100, padding: '15px 36px',
                color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: '0 0 40px var(--accent-glow)', transition: 'all 0.3s ease',
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
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2)',
                borderRadius: 100, padding: '15px 36px', color: 'var(--text)',
                fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 400,
                letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.3s ease',
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

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center',
            padding: '24px 44px', background: 'rgba(4,4,10,0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100,
          }}>
            {[['10K+', 'Users Support'], ['∞', 'Journals Saved'], ['24/7', 'Always Online']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)', color: 'var(--accent)',
                  marginBottom: 4, filter: 'drop-shadow(0 0 10px var(--accent-glow))',
                }}>{num}</div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.62rem', color: 'var(--text-dim)',
                  letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{ padding: '80px max(16px, 5vw) 120px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <span className="section-tag">Features</span>
          <h2 className="section-title">Nurturing Mindful Routines</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Empathetic structures and exercises designed to support you through emotional challenges.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '36px 28px', transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'none'
            }}
            >
              <div style={{ fontSize: 32, marginBottom: 18 }}>{f.emoji}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '0.04em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section style={{ padding: '80px max(16px, 5vw) 100px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Supportive feedback</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Stories of users finding emotional space with Luma.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '36px', position: 'relative'
              }}>
                <div style={{ fontSize: 44, color: 'rgba(167,139,250,0.1)', position: 'absolute', top: 20, left: 20 }}>“</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 28, position: 'relative', zIndex: 1 }}>
                  {t.text}
                </p>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--text)', marginBottom: 2 }}>{t.author}</h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent)' }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section style={{ padding: '100px max(16px, 5vw) 140px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>Things you might want to know about our sanctuary space.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden', transition: 'all 0.3s'
              }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '24px 28px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: 'left', outline: 'none'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                    {faq.q}
                  </span>
                  <span style={{ fontSize: 18, color: 'var(--accent)', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    ＋
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 28px 24px', fontSize: '0.8rem', color: 'var(--text-muted)',
                    lineHeight: 1.7, animation: 'fadeIn 0.3s ease'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

    </div>
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
