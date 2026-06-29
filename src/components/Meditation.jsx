import { useState, useEffect, useRef } from 'react'

const exercises = [
  {
    id: 'box',
    name: 'Box Breathing',
    desc: 'Used by Navy SEALs to stay calm under pressure.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.3)',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    desc: 'Calms the nervous system and reduces anxiety.',
    color: '#0e7490',
    glow: 'rgba(14,116,144,0.3)',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
  },
  {
    id: 'belly',
    name: 'Deep Belly Breathing',
    desc: 'Simple, gentle rhythm for everyday stress relief.',
    color: '#065f46',
    glow: 'rgba(6,95,70,0.3)',
    phases: [
      { label: 'Inhale', duration: 5 },
      { label: 'Exhale', duration: 5 },
    ],
  },
]

export default function Meditation({ token }) {
  const [activeTab, setActiveTab] = useState('breathing') // 'breathing' | 'mindfulness'
  
  // Breathing States
  const [selected, setSelected] = useState(exercises[0])
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(exercises[0].phases[0].duration)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const currentPhase = selected.phases[phaseIdx]

  // Mindfulness Exercise Selection
  const [selectedMindfulEx, setSelectedMindfulEx] = useState(null) // null | 'grounding' | 'gratitude' | 'bodyscan' | 'pause'

  // Voice Guidance Phase speech
  const speakPhase = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (!running) return
    
    // Speak first phase immediately on start
    if (secondsLeft === currentPhase.duration) {
      speakPhase(currentPhase.label)
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setPhaseIdx(p => {
            const next = (p + 1) % selected.phases.length
            if (next === 0) setCycles(c => c + 1)
            setSecondsLeft(selected.phases[next].duration)
            speakPhase(selected.phases[next].label)
            return next
          })
          return selected.phases[(phaseIdx + 1) % selected.phases.length].duration
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running, phaseIdx, selected])

  const start = () => {
    setPhaseIdx(0)
    setSecondsLeft(selected.phases[0].duration)
    setCycles(0)
    setRunning(true)
  }

  const stop = async () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    window.speechSynthesis.cancel()
    
    // Log breathing session completed
    if (cycles > 0 && token) {
      try {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'breathing',
            exerciseId: selected.id,
            duration: cycles * selected.phases.reduce((acc, p) => acc + p.duration, 0)
          })
        })
      } catch (err) {
        console.error(err)
      }
    }

    setPhaseIdx(0)
    setSecondsLeft(selected.phases[0].duration)
  }

  const selectExercise = (ex) => {
    stop()
    setSelected(ex)
    setSecondsLeft(ex.phases[0].duration)
  }

  const progress = 1 - (secondsLeft / currentPhase.duration)
  const circleSize = 200
  const strokeWidth = 4
  const radius = (circleSize - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  const isInhale = currentPhase.label === 'Inhale'
  const isExhale = currentPhase.label === 'Exhale'
  const breathScale = running
    ? isInhale ? 1 + (progress * 0.35)
    : isExhale ? 1.35 - (progress * 0.35)
    : 1
  : 1

  return (
    <div>
      <span className="section-tag">Meditation</span>
      <h2 className="section-title">Mindfulness Center</h2>
      <p className="section-sub">Take a deep breath and ground yourself in the present moment.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <button
          onClick={() => { stop(); setSelectedMindfulEx(null); setActiveTab('breathing') }}
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'breathing' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'breathing' ? 'var(--text)' : 'var(--text-dim)',
            padding: '12px 24px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
            fontWeight: activeTab === 'breathing' ? 700 : 400, cursor: 'pointer'
          }}
        >
          Breathing Guides ◎
        </button>
        <button
          onClick={() => { stop(); setActiveTab('mindfulness') }}
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'mindfulness' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'mindfulness' ? 'var(--text)' : 'var(--text-dim)',
            padding: '12px 24px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
            fontWeight: activeTab === 'mindfulness' ? 700 : 400, cursor: 'pointer'
          }}
        >
          Mindfulness Center 🧘
        </button>
      </div>

      {activeTab === 'breathing' ? (
        <div>
          {/* Exercise selector */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => selectExercise(ex)}
                style={{
                  background: selected.id === ex.id ? `${ex.color}15` : 'var(--surface)',
                  border: selected.id === ex.id ? `1px solid ${ex.color}` : '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 22px',
                  flex: '1 1 160px', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: selected.id === ex.id ? `0 0 20px ${ex.color}22` : 'none',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.62rem',
                  color: selected.id === ex.id ? ex.color : 'var(--text)',
                  marginBottom: 8, letterSpacing: '0.05em',
                }}>{ex.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{ex.desc}</div>
              </button>
            ))}
          </div>

          {/* Breathing visualization */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '48px 32px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at center, ${selected.color}08, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* SVG circle progress */}
            <div style={{ position: 'relative', width: circleSize, height: circleSize, marginBottom: 36 }}>
              <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx={circleSize / 2} cy={circleSize / 2} r={radius}
                  fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth}
                />
                {running && (
                  <circle
                    cx={circleSize / 2} cy={circleSize / 2} r={radius}
                    fill="none" stroke={selected.color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${selected.color})` }}
                  />
                )}
              </svg>

              {/* Inner breathing orb */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 100, height: 100, marginTop: -50, marginLeft: -50,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${selected.color}66, ${selected.color}15)`,
                boxShadow: `0 0 ${running ? 40 : 20}px ${selected.glow}`,
                transform: `scale(${breathScale})`,
                transition: 'transform 1s ease, box-shadow 1s ease',
              }} />

              {/* Timer text */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                {running && (
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                    color: selected.color, lineHeight: 1,
                  }}>{secondsLeft}</div>
                )}
              </div>
            </div>

            {/* Phase label */}
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: running ? '0.72rem' : '0.62rem',
              letterSpacing: '0.15em', color: running ? selected.color : 'var(--text-dim)',
              marginBottom: 8, transition: 'all 0.3s ease', textAlign: 'center',
            }}>
              {running ? currentPhase.label.toUpperCase() : 'READY'}
            </div>

            {running && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 28 }}>
                Cycle {cycles + 1}
              </div>
            )}

            {/* Phases preview */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
              {selected.phases.map((phase, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px 14px', borderRadius: 100,
                    border: `1px solid ${running && phaseIdx === i ? selected.color : 'var(--border)'}`,
                    background: running && phaseIdx === i ? `${selected.color}10` : 'transparent',
                    fontSize: '0.7rem', color: running && phaseIdx === i ? selected.color : 'var(--text-dim)',
                    transition: 'all 0.4s ease', display: 'flex', gap: 6, alignItems: 'center',
                  }}
                >
                  <span>{phase.label}</span>
                  <span style={{ opacity: 0.6 }}>{phase.duration}s</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            {!running ? (
              <button
                onClick={start}
                style={{
                  background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
                  border: 'none', borderRadius: 100, padding: '14px 48px',
                  color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
                  letterSpacing: '0.1em', cursor: 'pointer', boxShadow: `0 0 30px ${selected.glow}`,
                  transition: 'all 0.3s ease',
                }}
              >Begin</button>
            ) : (
              <button
                onClick={stop}
                style={{
                  background: 'transparent', border: '1px solid var(--border2)',
                  borderRadius: 100, padding: '14px 48px', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--rose)'
                  e.currentTarget.style.color = 'var(--rose)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border2)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >Stop & Log</button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Mindfulness Center Menu */}
          {!selectedMindfulEx ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { id: 'grounding', title: '5-4-3-2-1 Grounding', desc: 'Observe physical surroundings to quiet overthinking.', emoji: '🧭' },
                { id: 'gratitude', title: 'Gratitude Reflection', desc: 'Note three things you feel thankful for today.', emoji: '🙏' },
                { id: 'bodyscan', title: 'Guided Body Scan', desc: 'Release somatic stress, part by part (2 mins).', emoji: '🧘' },
                { id: 'pause', title: 'Mindful Pause', desc: 'A quick 60-second breathing space reset.', emoji: '⏳' }
              ].map(ex => (
                <button
                  key={ex.id} onClick={() => setSelectedMindfulEx(ex.id)}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '28px 24px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, transition: 'all 0.25s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <span style={{ fontSize: 32 }}>{ex.emoji}</span>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: 6 }}>{ex.title}</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{ex.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedMindfulEx(null)}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 100,
                  padding: '6px 14px', color: 'var(--text-dim)', fontSize: '0.72rem',
                  cursor: 'pointer', marginBottom: 24
                }}
              >
                ← Back to Mindfulness Menu
              </button>

              {/* grounding wizard */}
              {selectedMindfulEx === 'grounding' && <GroundingWizard token={token} onComplete={() => setSelectedMindfulEx(null)} />}
              
              {/* gratitude log */}
              {selectedMindfulEx === 'gratitude' && <GratitudeForm token={token} onComplete={() => setSelectedMindfulEx(null)} />}

              {/* body scan */}
              {selectedMindfulEx === 'bodyscan' && <BodyScanGuide token={token} onComplete={() => setSelectedMindfulEx(null)} />}

              {/* mindful pause */}
              {selectedMindfulEx === 'pause' && <MindfulPauseGuide token={token} onComplete={() => setSelectedMindfulEx(null)} />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Subcomponents for Mindfulness Center
function GroundingWizard({ token, onComplete }) {
  const [step, setStep] = useState(1)
  const [inputs, setInputs] = useState({ see: '', touch: '', hear: '', smell: '', taste: '' })

  const next = async () => {
    if (step < 5) {
      setStep(s => s + 1)
    } else {
      // Log session
      if (token) {
        try {
          await fetch('/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'mindfulness', exerciseId: 'grounding-54321', duration: 180 })
          })
        } catch(e){}
      }
      alert("Grounding session complete. Well done!")
      onComplete()
    }
  }

  const prompts = {
    1: { count: 5, category: 'SEE', desc: '5 things you can visually see in your environment (e.g. lamp, window, keyboard)', key: 'see' },
    2: { count: 4, category: 'TOUCH', desc: '4 things you feel physically (e.g. chair under you, breeze, warm cup)', key: 'touch' },
    3: { count: 3, category: 'HEAR', desc: '3 sounds reaching your ears (e.g. fan hum, traffic, birds chirping)', key: 'hear' },
    4: { count: 2, category: 'SMELL', desc: '2 scents or aromas you can perceive (e.g. coffee, fresh laundry)', key: 'smell' },
    5: { count: 1, category: 'TASTE', desc: '1 taste note in your mouth (e.g. mint, water, breakfast)', key: 'taste' }
  }

  const current = prompts[step]

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', animation: 'fadeUp 0.4s' }}>
      <span className="section-tag" style={{ color: 'var(--teal)', borderColor: 'var(--teal)' }}>STEP {step} OF 5</span>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--text)', margin: '12px 0 6px' }}>
        Identify {current.count} things you can {current.category}
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>{current.desc}</p>
      
      <input
        type="text" value={inputs[current.key]} onChange={e => setInputs({ ...inputs, [current.key]: e.target.value })}
        placeholder="Type here..."
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 16px', color: 'var(--text)', fontSize: '0.88rem', outline: 'none', marginBottom: 24
        }}
      />

      <button
        onClick={next} disabled={!inputs[current.key].trim()}
        style={{
          background: inputs[current.key].trim() ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(255,255,255,0.04)',
          border: 'none', borderRadius: 100, padding: '12px 36px', color: '#fff',
          fontFamily: 'var(--font-body)', fontSize: '0.8rem', cursor: inputs[current.key].trim() ? 'pointer' : 'not-allowed'
        }}
      >
        {step === 5 ? 'Finish Grounding' : 'Next Step →'}
      </button>
    </div>
  )
}

function GratitudeForm({ token, onComplete }) {
  const [items, setItems] = useState({ one: '', two: '', three: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!items.one.trim() || !items.two.trim() || !items.three.trim()) return
    setSaving(true)

    if (token) {
      try {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'mindfulness', exerciseId: 'gratitude', duration: 120 })
        })
      } catch(err){}
    }
    setSaving(false)
    alert("Gratitude notes recorded. Focusing on appreciation lights up positive pathways!")
    onComplete()
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', animation: 'fadeUp 0.4s' }}>
      <span className="section-tag" style={{ color: 'var(--amber)', borderColor: 'var(--amber)' }}>Reflection</span>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', margin: '12px 0 8px' }}>
        What are you grateful for today?
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        List three small things that brought you peace, comfort, or a smile.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {['one', 'two', 'three'].map((k, i) => (
          <input
            key={k} type="text" value={items[k]} onChange={e => setItems({ ...items, [k]: e.target.value })}
            placeholder={`${i + 1}. I am grateful for...`}
            required
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 16px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
            }}
          />
        ))}

        <button
          type="submit" disabled={saving || !items.one || !items.two || !items.three}
          style={{
            background: (items.one && items.two && items.three) ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(255,255,255,0.04)',
            border: 'none', borderRadius: 100, padding: '12px 36px', color: '#fff', marginTop: 10,
            fontFamily: 'var(--font-body)', fontSize: '0.8rem', cursor: 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Reflection'}
        </button>
      </form>
    </div>
  )
}

function BodyScanGuide({ token, onComplete }) {
  const parts = [
    { name: 'Toes & Feet', focus: 'Wiggle your toes. Let them drop heavy. Feel the connection with the floor. Release any tightness in the soles.' },
    { name: 'Lower Legs & Knees', focus: 'Observe calf muscles. Gently relax knees. Release any bracing holding your lower legs tense.' },
    { name: 'Thighs & Hips', focus: 'Feel thighs sinking into the support underneath. Soften hip joints. Release physical grip.' },
    { name: 'Abdomen & Chest', focus: 'Observe rises/falls. Release muscle hold around stomach. Let breathing expand deeply.' },
    { name: 'Hands & Arms', focus: 'Unclench fingers. Let palms drop open. Relax wrist joints. Feel arm weight drop.' },
    { name: 'Shoulders & Neck', focus: 'Roll shoulders back. Drop them low away from ears. Let neck rest straight and relaxed.' },
    { name: 'Jaw & Face', focus: 'Part lips slightly. Drop lower jaw. Soften skin around eyes and brow line.' }
  ]

  const [partIdx, setPartIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (partIdx < parts.length - 1) {
            setPartIdx(p => p + 1)
            return 12
          } else {
            // Complete scan
            clearInterval(timer)
            finish()
            return 0
          }
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [partIdx, running])

  const finish = async () => {
    setRunning(false)
    if (token) {
      try {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'mindfulness', exerciseId: 'body-scan', duration: 90 })
        })
      } catch(e){}
    }
    alert("Body scan complete. Reconnecting mind and body helps quiet circular thoughts.")
    onComplete()
  }

  const current = parts[partIdx]

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '36px', textAlign: 'center', animation: 'fadeUp 0.4s' }}>
      <span className="section-tag" style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>BODY SCAN · PART {partIdx + 1} OF 7</span>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text)', margin: '20px 0 12px' }}>
        Focus on: {current.name}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
        {current.focus}
      </p>

      <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--rose)', marginBottom: 32 }}>
        {timeLeft}s
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {parts.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i === partIdx ? 'var(--rose)' : (i < partIdx ? 'var(--border2)' : 'var(--border)')
          }} />
        ))}
      </div>

      <button
        onClick={finish}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 100, padding: '10px 24px', color: 'var(--text-dim)', fontSize: '0.72rem', cursor: 'pointer'
        }}
      >
        Skip Scan
      </button>
    </div>
  )
}

function MindfulPauseGuide({ token, onComplete }) {
  const [seconds, setSeconds] = useState(60)
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(timer)
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [active])

  const finish = async () => {
    setActive(false)
    if (token) {
      try {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'mindfulness', exerciseId: 'mindful-pause-1m', duration: 60 })
        })
      } catch(e){}
    }
    alert("Pause complete. Return to your day with a calm presence.")
    onComplete()
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '36px', textAlign: 'center', animation: 'fadeUp 0.4s' }}>
      <span className="section-tag">Mindful Pause</span>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--text)', margin: '16px 0 8px' }}>
        Just Pause. Breathe.
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>
        Step away from notifications and worries. Close your eyes. Focus only on the air entering and leaving your nostrils.
      </p>

      <div style={{
        width: 120, height: 120, borderRadius: '50%', background: 'rgba(167,139,250,0.06)',
        border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px', animation: 'breathe 2s ease infinite'
      }}>
        <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
          {seconds}
        </span>
      </div>

      <button
        onClick={finish}
        style={{
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 100, padding: '10px 24px', color: 'var(--text-dim)', fontSize: '0.72rem', cursor: 'pointer'
        }}
      >
        Skip Pause
      </button>
    </div>
  )
}
