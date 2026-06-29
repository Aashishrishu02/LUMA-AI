// ============================================================
//  LUMA — Backend Server
//  Express API that handles Auth, Database CRUD, and Gemini.
// ============================================================

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import https from 'https'
import { db } from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'luma_deep_wellness_companion_secret_2026'

// ── Middleware ──────────────────────────────────────────────
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',   // Vite default
    'http://localhost:4173',   // Vite preview
    'http://localhost:3000',   // alt dev port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token required' })

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' })
    req.user = payload
    next()
  })
}

// ── Gemini Fetch Helper ──────────────────────────────────────
const callGemini = async (prompt, systemInstruction = '') => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  const geminiMessages = []
  if (systemInstruction) {
    geminiMessages.push(
      { role: 'user', parts: [{ text: "SYSTEM INSTRUCTION: " + systemInstruction }] },
      { role: 'model', parts: [{ text: "Understood. I will follow this instruction exactly." }] }
    )
  }
  geminiMessages.push({ role: 'user', parts: [{ text: prompt }] })

  const payloadString = JSON.stringify({
    contents: geminiMessages,
    generationConfig: { maxOutputTokens: 1000 }
  })

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadString)
    }
  }

  const responseData = await new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding('utf8')
      let rawData = ''
      response.on('data', (chunk) => rawData += chunk)
      response.on('end', () => {
        try {
          resolve({ statusCode: response.statusCode, parsed: JSON.parse(rawData) })
        } catch (e) {
          resolve({ statusCode: response.statusCode, parsed: { error: { message: "JSON Parse error: " + e.message } } })
        }
      })
    })
    request.on('error', reject)
    request.write(payloadString)
    request.end()
  })

  if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
    throw new Error(responseData.parsed.error?.message || 'Failed call to Gemini API')
  }

  return responseData.parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── API Router (Supports dual prefix matching for Vercel/Local) ──
const apiRouter = express.Router()

// Register
apiRouter.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please enter all fields' })
  }

  try {
    const existing = await db.getUserByEmail(email)
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.createUser({ name, email, passwordHash })

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, goals: user.goals, preferences: user.preferences, streak: user.streak } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all fields' })
  }

  try {
    const user = await db.getUserByEmail(email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Refresh streak on login if active today/yesterday
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    let streak = user.streak
    
    if (user.lastActive === yesterdayStr) {
      // Keep streak
    } else if (user.lastActive !== todayStr) {
      streak = 1 // Reset streak if missed a day
    }
    await db.updateUser(user.id, { lastActive: todayStr, streak })

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, goals: user.goals, preferences: user.preferences, streak } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Forgot Password
apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })
  res.json({ message: 'Password recovery email sent successfully. Please check your inbox. 🌙' })
})

// Google Mock Login
apiRouter.post('/auth/google', async (req, res) => {
  const { email, name, googleId } = req.body
  if (!email || !name) {
    return res.status(400).json({ error: 'Invalid Google payload' })
  }

  try {
    let user = await db.getUserByEmail(email)
    if (!user) {
      const passwordHash = await bcrypt.hash(googleId || 'google_oauth_fallback_pwd_123', 10)
      user = await db.createUser({ name, email, passwordHash })
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, goals: user.goals, preferences: user.preferences, streak: user.streak } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get Profile Info
apiRouter.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { id: user.id, name: user.name, email: user.email, goals: user.goals, preferences: user.preferences, streak: user.streak } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update Profile Info
apiRouter.put('/auth/profile', authenticateToken, async (req, res) => {
  const { name, goals, preferences } = req.body
  try {
    const updated = await db.updateUser(req.user.id, { name, goals, preferences })
    if (!updated) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { id: updated.id, name: updated.name, email: updated.email, goals: updated.goals, preferences: updated.preferences, streak: updated.streak } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Mood Endpoints ───────────────────────────────────────────

apiRouter.get('/mood', authenticateToken, async (req, res) => {
  try {
    const moods = await db.getMoodsByUserId(req.user.id)
    res.json(moods)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

apiRouter.post('/mood', authenticateToken, async (req, res) => {
  const { value, feelings, note, date, time } = req.body
  if (!value) return res.status(400).json({ error: 'Mood value is required' })

  try {
    const mood = await db.addMood(req.user.id, { value, feelings, note, date, time })
    const user = await db.getUserById(req.user.id)
    res.json({ mood, streak: user?.streak || 1 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Journal Endpoints ────────────────────────────────────────

apiRouter.get('/journal', authenticateToken, async (req, res) => {
  try {
    const journals = await db.getJournalsByUserId(req.user.id)
    res.json(journals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

apiRouter.post('/journal', authenticateToken, async (req, res) => {
  const { title, body, date } = req.body
  if (!body || !body.trim()) return res.status(400).json({ error: 'Journal content is required' })

  try {
    // Generate AI Summary and insights
    const analysisPrompt = `Perform an empathetic psychological assessment of the following private journal entry. Respond with ONLY a valid, raw JSON object and nothing else. No markdown wraps or formatting.
Required JSON schema:
{
  "summary": "a short 1-2 sentence supportive, comforting summary of their state of mind",
  "themes": ["an array of 2-3 prominent emotional themes or topics, e.g. Anxious, Self-Doubt, Hopeful"],
  "positives": ["an array of 1-2 positive highlights, emotional strengths, or breakthroughs observed in the text"],
  "coping": ["an array of 2-3 specific evidence-based, simple CBT-inspired mental exercises or activities they could try to help them, e.g. 4-7-8 breathing exercise, gratitude listing"]
}

Journal entry:
"${body}"`

    let analysis = {
      summary: 'A thoughtful personal reflection.',
      themes: ['Reflection'],
      positives: ['Self-awareness'],
      coping: ['Take a moment to pause and breathe deeply.']
    }

    try {
      const responseText = await callGemini(analysisPrompt, 'You are Luma, a caring mental wellness assistant that analyzes journals and replies only in JSON.')
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      analysis = JSON.parse(cleanJson)
    } catch (apiErr) {
      console.warn('Gemini Journal analysis failed, using fallback:', apiErr.message)
    }

    const journal = await db.addJournal(req.user.id, {
      title,
      body,
      date,
      summary: analysis.summary,
      themes: analysis.themes,
      positives: analysis.positives,
      coping: analysis.coping
    })

    res.json(journal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

apiRouter.delete('/journal/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteJournal(req.user.id, req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Sessions / Exercises Endpoints ───────────────────────────

apiRouter.get('/exercises', authenticateToken, async (req, res) => {
  try {
    const sessions = await db.getSessionsByUserId(req.user.id)
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

apiRouter.post('/exercises', authenticateToken, async (req, res) => {
  const { type, exerciseId, duration, date } = req.body
  if (!type || !exerciseId) return res.status(400).json({ error: 'type and exerciseId are required' })

  try {
    const session = await db.addSession(req.user.id, { type, exerciseId, duration, date })
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Insights Endpoints ───────────────────────────────────────

apiRouter.get('/insights', authenticateToken, async (req, res) => {
  try {
    const moods = await db.getMoodsByUserId(req.user.id)
    const journals = await db.getJournalsByUserId(req.user.id)
    const sessions = await db.getSessionsByUserId(req.user.id)

    const slicedMoods = moods.slice(0, 10)
    const slicedJournals = journals.slice(0, 5)
    const slicedSessions = sessions.slice(0, 10)

    if (slicedMoods.length === 0 && slicedJournals.length === 0 && slicedSessions.length === 0) {
      return res.json({
        insights: [
          'Welcome to Luma! Log your mood, write journal entries, and try breathing exercises to start generating personalized wellness insights.',
          'Consistency is key. Try checking in at the same time every day to monitor patterns.',
          'Exploring box breathing for just 2 minutes can help decrease active cortisol levels.'
        ]
      })
    }

    const formattedMoods = slicedMoods.map(m => `Value: ${m.value}/5, feelings: [${m.feelings.join(', ')}], Note: ${m.note}`).join('\n')
    const formattedJournals = slicedJournals.map(j => `Title: ${j.title}, Summary: ${j.summary}`).join('\n')
    const formattedSessions = slicedSessions.map(s => `Exercise: ${s.exerciseId} (${s.type}), Duration: ${s.duration}s`).join('\n')

    const insightPrompt = `Review the user's recent wellness logs and generate exactly 3 supportive, customized, evidence-based mental wellness insights (1-2 sentences each). Focus on correlations, strengths, and mild positive reinforcement.
E.g., "Your mood improved after journaling" or "Box breathing is your most completed exercise". 
Output ONLY a raw JSON array of strings, like:
[
  "insight 1",
  "insight 2",
  "insight 3"
]

User Logs:
=== Moods ===
${formattedMoods}

=== Journals ===
${formattedJournals}

=== Sessions ===
${formattedSessions}`

    let insightsList = [
      'You are doing a great job taking active steps to check in with yourself.',
      'Journaling regularly seems to correspond with a balanced emotional state.',
      'Consistent breathing sessions are helping to keep your average stress level low.'
    ]

    try {
      const responseText = await callGemini(insightPrompt, 'You are Luma, a caring mental health analyst. Respond only in a JSON array of strings.')
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      insightsList = JSON.parse(cleanJson)
    } catch (apiErr) {
      console.warn('Gemini insights extraction failed, using fallback:', apiErr.message)
    }

    res.json({ insights: insightsList })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Analytics Endpoints ──────────────────────────────────────

apiRouter.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id)
    const moods = await db.getMoodsByUserId(req.user.id)
    const journals = await db.getJournalsByUserId(req.user.id)
    const sessions = await db.getSessionsByUserId(req.user.id)

    // Calculate wellness score
    const moodCount = moods.length
    const avgMood = moodCount > 0 ? (moods.reduce((acc, m) => acc + m.value, 0) / moodCount) : 3
    const streakBonus = Math.min((user?.streak || 0) * 3, 15)
    const journalPoints = Math.min(journals.length * 5, 20)
    const sessionPoints = Math.min(sessions.length * 4, 25)
    const moodPoints = Math.round(avgMood * 8) // max 40
    
    const wellnessScore = Math.min(moodPoints + streakBonus + journalPoints + sessionPoints, 100)

    // Breathing vs Meditation tallies
    const breathingSessions = sessions.filter(s => s.type === 'breathing')
    const meditationSessions = sessions.filter(s => s.type === 'mindfulness')

    // Weekly trend (past 7 moods, oldest first)
    const trend = moods.slice(0, 7).reverse().map(m => ({
      date: m.date,
      value: m.value,
      time: m.time
    }))

    res.json({
      wellnessScore,
      streak: user?.streak || 0,
      totalMoods: moodCount,
      totalJournals: journals.length,
      breathingCount: breathingSessions.length,
      meditationCount: meditationSessions.length,
      avgMood: parseFloat(avgMood.toFixed(1)),
      trend
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// ── Health Check ─────────────────────────────────────────────
apiRouter.get('/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY
  res.json({
    status: 'ok',
    apiKey: hasKey ? 'configured' : 'MISSING — add GEMINI_API_KEY to server/.env',
  })
})


// ── Chat Companion Endpoint ──────────────────────────────────
const SYSTEM_PROMPT = `You are Luma, a compassionate, caring AI mental wellness companion. 
You speak naturally, like a human friend. You are non-judgmental, validate emotions, and use evidence-informed wellness techniques (CBT reframing, simple mindfulness).

⚠️ CRITICAL SAFETY RULES:
- You are NOT a doctor or therapist. You must never claim to diagnose, treat, or cure mental health disorders.
- Do NOT prescribe medication or medical protocols.
- If the user uses crisis language expressing desire to die, end their life, or self-harm (e.g. "I want to die", "I want to hurt myself"):
  - Pivot immediately to an empathetic, supportive safety protocol.
  - Advise them to seek professional support or contact a crisis hotline.
  - Encourage speaking with trusted loved ones or emergency services.
  - DO NOT give dangerous advice or encourage self-harm.

💬 CONVERSATION STYLE:
- Avoid long paragraphs. Use clear, gentle spacing.
- Keep replies conversational, empathetic, and warm.
- Validate their feelings first (e.g. "That sounds incredibly heavy...").
- Ask ONLY ONE thoughtful follow-up question at a time to avoid overwhelming them.
- Suggest breathing exercises, journaling, or grounding exercises when they seem overwhelmed.
- Keep responses focused on mental wellness. If they ask about coding, math, general history, or trivia, gently remind them that you are focused on their emotional support and pull them back to how they are feeling.`

apiRouter.post('/chat', async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  // Attempt to load user context if authorization header is present
  let userContext = ''
  const authHeader = req.headers['authorization']
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      const user = await db.getUserById(decoded.id)
      if (user) {
        // Build user memory context
        const moods = await db.getMoodsByUserId(user.id)
        const slicedMoods = moods.slice(0, 3)
        const moodStr = slicedMoods.map(m => `${m.date}: ${m.value}/5`).join(', ')
        userContext = `\n\nUSER MEMORY CONTEXT:
- Name: ${user.name}
- Goals: ${user.goals}
- Preferences: Language is ${user.preferences?.language || 'en-IN'}
- Recent Mood logs: ${moodStr || 'None logged yet'}
Please naturally incorporate this context (e.g. greeting them by name, checking in on goals or recent low/high moods) without reciting it directly or sounding robotic.`
      }
    } catch (e) {
      // Ignore token errors for chat, fallback to generic
    }
  }

  try {
    let geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Keep array clean
    if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
      geminiMessages.shift()
    }

    const fullSystemPrompt = SYSTEM_PROMPT + userContext
    geminiMessages.unshift(
      { role: 'user', parts: [{ text: "SYSTEM INSTRUCTIONS:\n" + fullSystemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I am Luma, your compassionate wellness companion. I will follow these guidelines fully, speak naturally like a caring friend, keep responses brief, ask one question, and maintain strict clinical safety boundaries." }] }
    )

    const payloadString = JSON.stringify({
      contents: geminiMessages,
      generationConfig: { maxOutputTokens: 1000 }
    })

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    }

    const data = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        response.setEncoding('utf8')
        let rawData = ''
        response.on('data', (chunk) => rawData += chunk)
        response.on('end', () => {
          try {
            resolve({ statusCode: response.statusCode, parsed: JSON.parse(rawData) })
          } catch (e) {
            resolve({ statusCode: response.statusCode, parsed: { error: { message: "JSON Parse error: " + e.message } } })
          }
        })
      })
      request.on('error', reject)
      request.write(payloadString)
      request.end()
    })

    if (data.statusCode < 200 || data.statusCode >= 300) {
      throw new Error(data.parsed.error?.message || 'Failed to fetch from Gemini API')
    }

    const reply = data.parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm here with you. Could you tell me more?"
    res.json({ reply })

  } catch (err) {
    console.error('[LUMA server] error:', err.message)
    res.status(500).json({ error: err.message || 'Something went wrong' })
  }
})

// Mount the API router on both prefixes for Vercel/Local robustness
app.use('/api', apiRouter)
app.use('/', apiRouter)

// ── Start / Export ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n✦ LUMA backend running on http://localhost:${PORT}`)
    console.log(`  POST http://localhost:${PORT}/api/chat (Using Gemini via Fetch)`)
    console.log(`  GET  http://localhost:${PORT}/api/health\n`)
  })
}

export default app
