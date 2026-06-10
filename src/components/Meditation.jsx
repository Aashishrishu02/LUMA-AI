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
    id: 'calm',
    name: 'Calm Breath',
    desc: 'Simple, gentle rhythm for everyday stress relief.',
    color: '#065f46',
    glow: 'rgba(6,95,70,0.3)',
    phases: [
      { label: 'Inhale', duration: 5 },
      { label: 'Exhale', duration: 5 },
    ],
  },
]

export default function Meditation() {
  const [selected, setSelected] = useState(exercises[0])
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(exercises[0].phases[0].duration)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const currentPhase = selected.phases[phaseIdx]

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setPhaseIdx(p => {
            const next = (p + 1) % selected.phases.length
            if (next === 0) setCycles(c => c + 1)
            setSecondsLeft(selected.phases[next].duration)
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

  const stop = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
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
      <h2 className="section-title">Breathe with LUMA</h2>
      <p className="section-sub">Let your breath guide you back to the present moment.</p>

      {/* Exercise selector */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
        {exercises.map(ex => (
          <button
            key={ex.id}
            onClick={() => selectExercise(ex)}
            style={{
              background: selected.id === ex.id ? `${ex.color}22` : 'var(--surface)',
              border: selected.id === ex.id ? `1px solid ${ex.color}55` : '1px solid var(--border)',
              borderRadius: 12, padding: '16px 22px',
              flex: '1 1 160px', textAlign: 'left',
              cursor: 'pointer', transition: 'all 0.25s ease',
              boxShadow: selected.id === ex.id ? `0 0 20px ${ex.color}22` : 'none',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.48rem',
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
        {/* Background ambient glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${selected.color}10, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* SVG circle progress */}
        <div style={{ position: 'relative', width: circleSize, height: circleSize, marginBottom: 36 }}>
          <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={circleSize / 2} cy={circleSize / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth}
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
            position: 'absolute',
            top: '50%', left: '50%',
            width: 100, height: 100,
            marginTop: -50, marginLeft: -50,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${selected.color}88, ${selected.color}22)`,
            boxShadow: `0 0 ${running ? 40 : 20}px ${selected.glow}`,
            transform: `scale(${breathScale})`,
            transition: 'transform 1s ease, box-shadow 1s ease',
          }} />

          {/* Timer text */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
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
          fontFamily: 'var(--font-display)',
          fontSize: running ? '0.7rem' : '0.52rem',
          letterSpacing: '0.15em',
          color: running ? selected.color : 'var(--text-dim)',
          marginBottom: 8,
          transition: 'all 0.3s ease',
          textAlign: 'center',
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
                padding: '6px 14px',
                borderRadius: 100,
                border: `1px solid ${running && phaseIdx === i ? selected.color + '66' : 'var(--border)'}`,
                background: running && phaseIdx === i ? selected.color + '15' : 'transparent',
                fontSize: '0.7rem', color: running && phaseIdx === i ? selected.color : 'var(--text-dim)',
                transition: 'all 0.4s ease',
                display: 'flex', gap: 6, alignItems: 'center',
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
              border: 'none', borderRadius: 100,
              padding: '14px 48px',
              color: '#fff', fontFamily: 'var(--font-body)',
              fontSize: '0.85rem', fontWeight: 500,
              letterSpacing: '0.1em', cursor: 'pointer',
              boxShadow: `0 0 30px ${selected.glow}`,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 50px ${selected.glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 30px ${selected.glow}`}
          >Begin</button>
        ) : (
          <button
            onClick={stop}
            style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              borderRadius: 100, padding: '14px 48px',
              color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
              fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(251,113,133,0.4)'
              e.currentTarget.style.color = 'var(--rose)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border2)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >Stop</button>
        )}
      </div>

      {/* Tips */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px 32px',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Tips for best results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Find a comfortable position, sitting or lying down',
            'Breathe through your nose when inhaling',
            'Let your belly expand before your chest',
            'Practice for at least 5 minutes for full effect',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: selected.color, fontSize: 14, marginTop: 2, flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
