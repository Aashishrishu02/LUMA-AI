// ============================================================
//  Chatbot.jsx — UPDATED
//  Features Text Mode + Live Continuous Voice Agent Call Mode
// ============================================================
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
  { code: 'bho-IN', label: 'Bhojpuri (भोजपुरी)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
]

export default function Chatbot() {
  const [language, setLanguage] = useState('en-IN')
  const languageRef = useRef('en-IN')

  useEffect(() => {
    languageRef.current = language
  }, [language])

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello, I'm LUMA 🌙 I'm here to listen, support, and help you find your calm. How are you feeling right now?",
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  
  // Advanced Voice Call Mode State
  const [isCallMode, setIsCallMode] = useState(false)
  const callModeRef = useRef(false)
  const recognitionRef = useRef(null)
  
  // Independent history for Voice Mode to prevent leaking to Text UI
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

  // ── Standard Text Send ──
  const send = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    const userMsg = { role: 'user', content: userText }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
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
      content: "Hello, I'm LUMA 🌙 I'm here to listen, support, and help you find your calm. How are you feeling right now?",
    }])
    setError(null)
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
    // Clear voice history for a fresh call
    voiceMessagesRef.current = []
    window.speechSynthesis.cancel() 
    
    // Immediately greet the user
    speakTextCallMode("I am listening. How can I help you today?")
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
    if (!callModeRef.current) return
    
    if (!recognitionRef.current) {
       const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
       recognitionRef.current = new SpeechRecognitionAPI()
       recognitionRef.current.continuous = false
       recognitionRef.current.interimResults = false
       // Recognition language will be updated below
    }

    const rec = recognitionRef.current
    rec.lang = languageRef.current
    rec.onstart = () => { if (callModeRef.current) setIsListening(true) }
    
    rec.onresult = async (event) => {
      if (!callModeRef.current) return
      
      const transcript = event.results[0][0].transcript.trim()
      setIsListening(false)
      
      if (!transcript) {
        if (callModeRef.current) setTimeout(handleVoiceTurn, 300)
        return
      }
      
      setLoading(true)

      // Append to the isolated Voice history
      const updatedMessages = [...voiceMessagesRef.current, { role: 'user', content: transcript }]
      voiceMessagesRef.current = updatedMessages
      
      try {
        const res = await fetch('/api/chat', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ messages: updatedMessages }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error()
        
        // Save assistant reply to isolated history
        voiceMessagesRef.current = [...updatedMessages, { role: 'assistant', content: data.reply }]
        
        if (callModeRef.current) speakTextCallMode(data.reply)
      } catch (err) {
        setLoading(false)
        if (callModeRef.current) speakTextCallMode("I lost connection. Please try saying that again.")
      }
    }
    
    rec.onerror = (event) => {
      if (!callModeRef.current) return
      setIsListening(false)
      // Auto-loop if it times out with no speech
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
    
    // Clean markdown for seamless voice
    const cleanText = text.replace(/[*#_`~]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = window.speechSynthesis.getVoices()
    
    const langPrefix = languageRef.current.split('-')[0]
    let preferredVoice = voices.find(v => v.lang === languageRef.current && v.name.includes('Female'))
      || voices.find(v => v.lang === languageRef.current)
      || voices.find(v => v.lang.startsWith(langPrefix))

    // Fallback if no regional voice pack natively installed
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Google US English'))
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
      utterance.lang = preferredVoice.lang
    } else {
      utterance.lang = languageRef.current
    }

    utterance.rate = 1.0
    utterance.onstart = () => { 
       if (callModeRef.current) { setIsSpeaking(true); setLoading(false) } 
    }
    utterance.onend = () => { 
      setIsSpeaking(false)
      if (callModeRef.current) {
         setTimeout(handleVoiceTurn, 50) 
      }
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (callModeRef.current) setTimeout(handleVoiceTurn, 50) 
    }
    
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div>
          <span className="section-tag">AI Companion</span>
          <h2 className="section-title">Talk to LUMA</h2>
          <p className="section-sub">A safe space to express yourself, anytime.</p>
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
               <option key={lang.code} value={lang.code} style={{ background: '#1e1e2d', color: '#fff' }}>{lang.label}</option>
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
            >📞 Voice Agent</button>
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
           <div style={{
              width: 140, height: 140, borderRadius: '50%',
              background: isSpeaking ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(255,255,255,0.05)',
              boxShadow: isSpeaking ? '0 0 60px rgba(167,139,250,0.6)' : (isListening ? '0 0 30px rgba(251,113,133,0.3)' : 'none'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.5s ease',
              animation: isListening || isSpeaking || loading ? 'breathe 1.5s ease infinite' : 'none',
              border: isListening ? '2px solid var(--rose)' : '1px solid var(--border)',
           }}>
              <span style={{ fontSize: 50, animation: loading ? 'breathe 0.5s infinite alternate' : 'none' }}>
                {isSpeaking ? '🔮' : (isListening ? '🎙️' : '🌙')}
              </span>
           </div>

           <div style={{ marginTop: 40, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em', fontSize: '1.2rem', color: isListening ? 'var(--rose)' : 'var(--text)', transition: 'color 0.3s' }}>
              {isSpeaking ? 'Luma is speaking...' : (loading ? 'Luma is thinking...' : (isListening ? 'Listening...' : 'Connecting...'))}
           </div>
           
           <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', maxWidth: 220 }}>
              Speak naturally. Luma will auto-detect when you stop and answer you.
           </p>

           <button onClick={endCallMode} style={{
             position: 'absolute', bottom: 30,
             padding: '12px 30px', borderRadius: 30, background: 'linear-gradient(135deg, #fb7185, #e11d48)',
             color: '#fff', border: 'none', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(251,113,133,0.4)',
             fontFamily: 'var(--font-heading)', fontWeight: 600,
           }}>End Live Call</button>
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
                    animation: (isSpeaking && !msg.isError && i === messages.length - 1) ? 'breathe 1.5s ease infinite' : 'none'
                  }}>{msg.isError ? '!' : (isSpeaking && i === messages.length - 1 ? '🔊' : '✦')}</div>
                )}
                <div style={{
                  maxWidth: '72%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent2), #4c1d95)'
                    : msg.isError ? 'rgba(251,113,133,0.08)' : 'rgba(255,255,255,0.05)',
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
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
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
            background: 'rgba(4,4,10,0.4)',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Share what's on your mind…"
              rows={1}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
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
                  : 'rgba(255,255,255,0.05)',
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
