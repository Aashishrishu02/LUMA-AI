import { useState, useRef, useEffect } from 'react'

const suggestions = [
  "I'm feeling anxious today",
  "Help me calm down",
  "I need to talk",
  "Give me a breathing exercise",
  "I'm feeling overwhelmed",
]

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
]

export default function Chatbot({ token, user }) {
  const [language, setLanguage] = useState(user?.preferences?.language || 'en-IN')
  const languageRef = useRef(language)

  useEffect(() => {
    languageRef.current = language
  }, [language])

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${user?.name || ''} 🌙 I'm Luma. I'm here to listen, support, and help you find your calm. How are you feeling right now?`,
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [crisisAlert, setCrisisAlert] = useState(false)
  
  // Advanced Voice Call Mode State
  const [isCallMode, setIsCallMode] = useState(false)
  const callModeRef = useRef(false)
  const recognitionRef = useRef(null)
  const voiceMessagesRef = useRef([])

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    window.speechSynthesis.getVoices()
    return () => {
      window.speechSynthesis.cancel()
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch(e) {}
      }
    }
  }, [])

  // Crisis detection filter
  const detectCrisis = (text) => {
    const crisisKeywords = [
      'want to die',
      'kill myself',
      'hurt myself',
      'self harm',
      'suicide',
      'end my life',
      'don\'t want to live',
      'wanna die'
    ]
    return crisisKeywords.some(kw => text.toLowerCase().includes(kw))
  }

  // ── Standard Text Send ──
  const send = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    // Check crisis
    if (detectCrisis(userText)) {
      setCrisisAlert(true)
    }

    const userMsg = { role: 'user', content: userText }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/chat', {
        method : 'POST',
        headers: headers,
        body   : JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

      // If crisis, we append a safe supportive advice directly
      let finalReply = data.reply
      if (detectCrisis(userText)) {
        finalReply = "I hear how much pain you're in, and I want to support you, but I'm an AI companion and cannot replace professional care. Please reach out to someone who can help. You are not alone. 🛡️"
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalReply }])
    } catch (err) {
      console.error('LUMA chat error:', err)
      setError(err.message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a quiet moment — something went wrong on my end. Please try again. 🌙",
        isError: true,
      }])
    }
    setLoading(false)
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hello ${user?.name || ''} 🌙 I'm Luma. I'm here to listen, support, and help you find your calm. How are you feeling right now?`,
    }])
    setError(null)
    setCrisisAlert(false)
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // ── Advanced Voice Call Mode Logic ──
  const startCallMode = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't natively support Speech Recognition. Try Chrome.")
      return
    }
    callModeRef.current = true
    setIsCallMode(true)
    setIsMuted(false)
    voiceMessagesRef.current = []
    window.speechSynthesis.cancel() 
    
    speakTextCallMode(`Hello ${user?.name || ''}, I am listening. How can I help you find peace today?`)
  }

  const endCallMode = () => {
    callModeRef.current = false
    setIsCallMode(false)
    setIsListening(false)
    setIsSpeaking(false)
    setLoading(false)
    if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch(e) {}
    }
    window.speechSynthesis.cancel()
  }

  const handleVoiceTurn = () => {
    if (!callModeRef.current || isMuted) return
    
    if (!recognitionRef.current) {
       const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
       recognitionRef.current = new SpeechRecognitionAPI()
       recognitionRef.current.continuous = false
       recognitionRef.current.interimResults = true // allows listening for interruptions
    }

    const rec = recognitionRef.current
    rec.lang = languageRef.current
    
    rec.onstart = () => { 
      if (callModeRef.current) setIsListening(true) 
    }
    
    rec.onresult = async (event) => {
      if (!callModeRef.current) return
      
      const transcript = event.results[0][0].transcript.trim()
      
      // User Interruption: if AI is speaking and user speaks, cut off AI immediately
      if (isSpeaking && transcript.length > 2) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }

      if (event.results[0].isFinal) {
        setIsListening(false)
        if (!transcript) {
          setTimeout(handleVoiceTurn, 300)
          return
        }

        // Check crisis in spoken text
        if (detectCrisis(transcript)) {
          setCrisisAlert(true)
          speakTextCallMode("I hear you, and I want you to be safe. Please know you are not alone. I am showing crisis numbers on your dashboard screen.")
          return
        }

        setLoading(true)
        const updatedMessages = [...voiceMessagesRef.current, { role: 'user', content: transcript }]
        voiceMessagesRef.current = updatedMessages
        
        try {
          const headers = { 'Content-Type': 'application/json' }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const res = await fetch('/api/chat', {
            method : 'POST',
            headers: headers,
            body   : JSON.stringify({ messages: updatedMessages }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error()
          
          voiceMessagesRef.current = [...updatedMessages, { role: 'assistant', content: data.reply }]
          
          if (callModeRef.current) speakTextCallMode(data.reply)
        } catch (err) {
          setLoading(false)
          if (callModeRef.current) speakTextCallMode("I lost connection. Please speak again.")
        }
      }
    }
    
    rec.onerror = (event) => {
      if (!callModeRef.current) return
      setIsListening(false)
      if (event.error === 'no-speech') {
        setTimeout(handleVoiceTurn, 300)
      } else if (event.error !== 'aborted') {
        setTimeout(handleVoiceTurn, 1000)
      }
    }

    rec.onend = () => {
      if (!callModeRef.current) return
      setIsListening(false)
    }

    try { rec.start() } catch(e) {}
  }

  const speakTextCallMode = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    
    const cleanText = text.replace(/[*#_`~]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = window.speechSynthesis.getVoices()
    
    const langPrefix = languageRef.current.split('-')[0]
    let preferredVoice = voices.find(v => v.lang === languageRef.current && v.name.includes('Female'))
      || voices.find(v => v.lang === languageRef.current)
      || voices.find(v => v.lang.startsWith(langPrefix))

    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female') || v.name.includes('Samantha'))
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
      utterance.lang = preferredVoice.lang
    } else {
      utterance.lang = languageRef.current
    }

    utterance.rate = 0.95
    utterance.onstart = () => { 
       if (callModeRef.current) { 
         setIsSpeaking(true)
         setLoading(false) 
       } 
    }
    utterance.onend = () => { 
      setIsSpeaking(false)
      if (callModeRef.current) {
         setTimeout(handleVoiceTurn, 200) 
      }
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (callModeRef.current) setTimeout(handleVoiceTurn, 200) 
    }
    
    window.speechSynthesis.speak(utterance)
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setTimeout(handleVoiceTurn, 100)
    } else {
      setIsMuted(true)
      setIsListening(false)
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch(e) {}
      }
    }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div>
          <span className="section-tag">AI Companion</span>
          <h2 className="section-title">Talk to Luma</h2>
          <p className="section-sub">A warm, safe place to explore your feelings.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          
          <select 
            value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={isCallMode}
            style={{
               background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)',
               border: '1px solid var(--border)', borderRadius: 100, padding: '7px 12px',
               fontFamily: 'var(--font-body)', fontSize: '0.75rem', outline: 'none',
               cursor: isCallMode ? 'not-allowed' : 'pointer',
               opacity: isCallMode ? 0.5 : 1
            }}
          >
             {SUPPORTED_LANGUAGES.map(lang => (
               <option key={lang.code} value={lang.code} style={{ background: 'var(--bg2)', color: 'var(--text)' }}>{lang.label}</option>
             ))}
          </select>

          {!isCallMode && (
            <button
              onClick={startCallMode}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', borderRadius: 100,
                padding: '8px 20px', color: '#fff', fontWeight: 600,
                fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 0 15px var(--accent-glow)'
              }}
            >📞 Voice Call</button>
          )}
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)', borderRadius: 100,
              padding: '7px 16px', color: 'var(--text-dim)',
              fontFamily: 'var(--font-heading)', fontSize: '0.65rem',
              letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >Clear ✕</button>
        </div>
      </div>

      {/* Crisis Warning Block */}
      {crisisAlert && (
        <div style={{
          background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.3)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 16,
          animation: 'fadeUp 0.4s ease'
        }}>
          <h4 style={{ color: 'var(--rose)', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6 }}>🛡️ Support & Helplines Available</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
            You are not alone. Please consider reaching out to a professional or a local crisis line:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.75rem', color: 'var(--text)' }}>
            <span>• India AASRA: 91-9820466726</span>
            <span>• India Vandrevala: 91-9999666555</span>
            <span>• US/Canada Helpline: Dial 988</span>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && !isCallMode && (
        <div style={{
          background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--rose)' }}>{error}</span>
        </div>
      )}

      {/* ── Call Mode OR Chat window ── */}
      {isCallMode ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 'var(--radius)', height: 460, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          boxShadow: 'inset 0 0 50px rgba(167,139,250,0.05)', position: 'relative'
        }}>
           
           {/* Waveform Visualization */}
           <div style={{ display: 'flex', gap: 6, height: 60, alignItems: 'center', marginBottom: 30 }}>
             {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
               const anim = isSpeaking 
                 ? `breathe 0.5s ease infinite alternate ${i * 0.08}s` 
                 : (isListening ? `breathe 1.2s ease infinite alternate ${i * 0.15}s` : 'none')
               const height = isSpeaking ? 50 : (isListening ? 25 : 8)
               return (
                 <div key={i} style={{
                   width: 5,
                   height: height,
                   background: isSpeaking ? 'var(--accent)' : (isListening ? 'var(--teal)' : 'var(--text-dim)'),
                   borderRadius: 4,
                   animation: anim,
                   transition: 'height 0.3s, background-color 0.3s'
                 }} />
               )
             })}
           </div>

           <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: isSpeaking ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(255,255,255,0.04)',
              boxShadow: isSpeaking ? '0 0 40px var(--accent-glow)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isListening ? '2px solid var(--teal)' : '1px solid var(--border)',
           }}>
              <span style={{ fontSize: 40 }}>
                {isSpeaking ? '🔮' : (isListening ? '🎙️' : '🌙')}
              </span>
           </div>

           <div style={{ marginTop: 32, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em', fontSize: '1.1rem', color: isListening ? 'var(--teal)' : 'var(--text)' }}>
              {isMuted ? 'Microphone Muted' : (isSpeaking ? 'Luma is speaking...' : (loading ? 'Thinking...' : (isListening ? 'Listening...' : 'Connected')))}
           </div>
           
           <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', maxWidth: 260 }}>
              Speak naturally. Luma detects speech & pauses. Cuts in if you interrupt.
           </p>

           <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 14 }}>
             <button onClick={toggleMute} style={{
               padding: '12px 24px', borderRadius: 30, background: isMuted ? 'var(--teal)' : 'rgba(255,255,255,0.06)',
               color: '#fff', border: '1px solid var(--border)', fontSize: '0.8rem', cursor: 'pointer',
               fontFamily: 'var(--font-heading)', fontWeight: 600, transition: 'all 0.3s'
             }}>
               {isMuted ? 'Unmute Mic 🎙️' : 'Mute Mic 🔇'}
             </button>
             <button onClick={endCallMode} style={{
               padding: '12px 28px', borderRadius: 30, background: 'linear-gradient(135deg, #fb7185, #e11d48)',
               color: '#fff', border: 'none', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(251,113,133,0.4)',
               fontFamily: 'var(--font-heading)', fontWeight: 600,
             }}>End Call</button>
           </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          height: 460, display: 'flex', flexDirection: 'column',
          marginBottom: 16, overflow: 'hidden',
        }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fadeUp 0.3s ease',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: msg.isError
                      ? 'linear-gradient(135deg, #fb7185, #e11d48)'
                      : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, marginRight: 12, marginTop: 2,
                    boxShadow: msg.isError ? '0 0 12px rgba(251,113,133,0.4)' : '0 0 12px var(--accent-glow)',
                  }}>{msg.isError ? '!' : '✦'}</div>
                )}
                <div style={{
                  maxWidth: '72%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent2), #4c1d95)'
                    : msg.isError ? 'rgba(251,113,133,0.08)' : 'rgba(255,255,255,0.04)',
                  border: msg.role === 'user' ? 'none'
                    : msg.isError ? '1px solid rgba(251,113,133,0.2)' : '1px solid var(--border)',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '14px 18px',
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  lineHeight: 1.75, fontWeight: 400,
                  boxShadow: msg.role === 'user' ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
                }}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 0.3s ease' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, boxShadow: '0 0 12px var(--accent-glow)',
                }}>✦</div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '18px 18px 18px 4px', padding: '14px 20px',
                  display: 'flex', gap: 6, alignItems: 'center',
                }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                      animation: `breathe 1.2s ease ${d * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: '16px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 12, alignItems: 'flex-end',
            background: 'var(--surface)',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Share what's on your mind…"
              rows={1}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)', borderRadius: 14,
                padding: '12px 18px', color: 'var(--text)',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                lineHeight: 1.6, resize: 'none', outline: 'none',
                maxHeight: 100, overflowY: 'auto', transition: 'border-color 0.2s ease',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 46, height: 46,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : 'rgba(255,255,255,0.04)',
                border: 'none', borderRadius: 12,
                color: input.trim() && !loading ? '#fff' : 'var(--text-dim)',
                fontSize: 20, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                flexShrink: 0, transition: 'all 0.25s ease',
                boxShadow: input.trim() && !loading ? '0 0 20px var(--accent-glow)' : 'none',
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* ── Suggestion chips ── */}
      {!isCallMode && (
         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
           {suggestions.map(s => (
             <button key={s} onClick={() => send(s)} disabled={loading}
               style={{
                 background: 'var(--surface)', border: '1px solid var(--border)',
                 borderRadius: 100, padding: '8px 18px', color: 'var(--text-muted)',
                 fontFamily: 'var(--font-body)', fontSize: '0.76rem',
                 cursor: loading ? 'not-allowed' : 'pointer',
                 transition: 'all 0.2s ease', opacity: loading ? 0.5 : 1,
               }}
             >{s}</button>
           ))}
         </div>
      )}
    </div>
  )
}
