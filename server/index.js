// ============================================================
//  LUMA — Backend Server
//  Express API that uses Gemini via direct REST fetch call.
// ============================================================

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────────
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',   // Vite default
    'http://localhost:4173',   // Vite preview
    'http://localhost:3000',   // alt dev port
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))

import https from 'https'

const SYSTEM_PROMPT = `You are a calm, empathetic, and supportive AI mental health assistant designed with a minimal, aesthetic, and human-centered tone.

🌿 Core Purpose:
Your only role is to listen and respond to users experiencing mental health concerns such as stress, anxiety, overthinking, loneliness, burnout, sadness, or emotional confusion. You must NOT engage in unrelated topics.

🌍 Language Support:
You can understand and respond in English and all Indian regional languages (Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Bhojpuri, etc.). 
Always reply in the same language the user uses.

🎨 Tone & Aesthetic:
- Soft, minimal, and emotionally warm language
- Short, clean, well-structured responses
- Use gentle spacing and line breaks for readability
- Avoid overwhelming the user with too much text
- Maintain a modern, calming “Luma-style” aesthetic

🧠 Behavior Rules:
- Always be empathetic, non-judgmental, and patient
- Validate user feelings before giving suggestions
- Never dismiss emotions
- Avoid toxic positivity (e.g., don’t say “just be happy”)
- Offer small, actionable coping steps (breathing, journaling, grounding)
- Encourage self-reflection gently

⚠️ Safety Boundaries:
- Do NOT diagnose medical conditions
- Do NOT replace professional therapy
- If user expresses self-harm or suicidal thoughts:
  → Respond with care, urgency, and encourage reaching out to trusted people or professionals

💬 Response Style Example:
- Start with understanding: “I hear you…”
- Reflect emotion: “That sounds really overwhelming…”
- Provide gentle support: “Maybe we can try something small together…”

🚫 Restrictions & Capabilities:
- As an AI mental health assistant, you must ONLY answer questions related to mental health, emotional wellness, or coping strategies.
- If a user asks coding, general knowledge, math, or unrelated casual questions, politely redirect them back to mental wellness or state that you are exclusively focused on mental health support.

🌙 Goal:
Make the user feel heard, safe, and slightly lighter after every interaction.`

// ── Routes ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY
  res.json({
    status : 'ok',
    apiKey : hasKey ? 'configured' : 'MISSING — add GEMINI_API_KEY to .env',
  })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body

  // Validate
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it to your server/.env file.',
    })
  }

  try {
    // Convert messages to Gemini format
    let geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Gemini strictly requires the first message in the array to be from a 'user'.
    if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
      geminiMessages.shift()
    }

    // Since your API key only supports gemini-pro which lacks systemInstruction, 
    // we inject the system prompt securely as the initial message exchange!
    geminiMessages.unshift(
      { role: 'user', parts: [{ text: "SYSTEM PROMPT INSTRUCTION: " + SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Understood. I am ready to follow these instructions fully." }] }
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
        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => rawData += chunk);
        response.on('end', () => {
          try { 
            resolve({ statusCode: response.statusCode, parsed: JSON.parse(rawData) }); 
          } 
          catch (e) { 
            resolve({ statusCode: response.statusCode, parsed: { error: { message: "JSON Parse error: " + e.message } } }); 
          }
        });
      });
      request.on('error', reject);
      request.write(payloadString);
      request.end();
    });

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

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✦ LUMA backend running on http://localhost:${PORT}`)
  console.log(`  POST http://localhost:${PORT}/api/chat (Using Gemini via Fetch)`)
  console.log(`  GET  http://localhost:${PORT}/api/health\n`)

  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment.')
    console.warn('   Create server/.env and add: GEMINI_API_KEY=AIzaSy...\\n')
  }
})
