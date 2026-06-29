import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'db.json')

// MongoDB lazy client cache
let mongoClient = null
let mongoDb = null

async function getMongoDb() {
  if (!process.env.MONGODB_URI) return null
  if (mongoDb) return mongoDb
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI)
    await mongoClient.connect()
    mongoDb = mongoClient.db()
    console.log('✦ Database: Connected successfully to cloud MongoDB')
    return mongoDb
  } catch (err) {
    console.error('✦ Database: MongoDB connection error. Falling back to local db.json:', err.message)
    return null
  }
}

// --- Local JSON fallback helpers ---
function loadLocalDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = { users: [], moods: [], journals: [], sessions: [] }
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8')
      return initialData
    }
    const content = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.error('Error loading local DB, resetting to defaults:', err)
    return { users: [], moods: [], journals: [], sessions: [] }
  }
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Error saving local DB:', err)
  }
}

export const db = {
  // --- Users Table ---
  getUsers: async () => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('users').find({}).toArray()
    }
    return loadLocalDb().users
  },
  
  getUserById: async (id) => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('users').findOne({ id })
    }
    return loadLocalDb().users.find(u => u.id === id)
  },

  getUserByEmail: async (email) => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('users').findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } })
    }
    return loadLocalDb().users.find(u => u.email.toLowerCase() === email.toLowerCase())
  },

  createUser: async (userData) => {
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name || 'Friend',
      goals: userData.goals || 'Manage stress and find daily peace',
      preferences: userData.preferences || { theme: 'dark', language: 'en-IN' },
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }

    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('users').insertOne(newUser)
      return newUser
    }

    const data = loadLocalDb()
    data.users.push(newUser)
    saveLocalDb(data)
    return newUser
  },

  updateUser: async (id, updates) => {
    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('users').updateOne({ id }, { $set: updates })
      return await mdb.collection('users').findOne({ id })
    }

    const data = loadLocalDb()
    const idx = data.users.findIndex(u => u.id === id)
    if (idx === -1) return null
    data.users[idx] = { ...data.users[idx], ...updates }
    saveLocalDb(data)
    return data.users[idx]
  },

  // --- Moods Table ---
  getMoodsByUserId: async (userId) => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('moods').find({ userId }).sort({ timestamp: -1 }).toArray()
    }
    const moods = loadLocalDb().moods
    return moods.filter(m => m.userId === userId).sort((a,b) => b.timestamp - a.timestamp)
  },

  addMood: async (userId, moodData) => {
    const newMood = {
      id: Date.now().toString(),
      userId,
      value: parseInt(moodData.value),
      feelings: moodData.feelings || [],
      note: moodData.note || '',
      date: moodData.date || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: moodData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    }

    // Streak check logic
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('moods').insertOne(newMood)
      
      const user = await mdb.collection('users').findOne({ id: userId })
      if (user) {
        let streak = user.streak || 1
        if (user.lastActive === yesterdayStr) {
          streak += 1
        } else if (user.lastActive !== todayStr) {
          streak = 1
        }
        await mdb.collection('users').updateOne({ id: userId }, { $set: { streak, lastActive: todayStr } })
      }
      return newMood
    }

    const data = loadLocalDb()
    data.moods.push(newMood)
    const user = data.users.find(u => u.id === userId)
    if (user) {
      if (user.lastActive === yesterdayStr) {
        user.streak += 1
      } else if (user.lastActive !== todayStr) {
        user.streak = 1
      }
      user.lastActive = todayStr
    }
    saveLocalDb(data)
    return newMood
  },

  // --- Journals Table ---
  getJournalsByUserId: async (userId) => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('journals').find({ userId }).sort({ timestamp: -1 }).toArray()
    }
    const journals = loadLocalDb().journals
    return journals.filter(j => j.userId === userId).sort((a,b) => b.timestamp - a.timestamp)
  },

  addJournal: async (userId, journalData) => {
    const newJournal = {
      id: Date.now().toString(),
      userId,
      title: journalData.title || 'Untitled Entry',
      body: journalData.body,
      date: journalData.date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      words: journalData.body.trim().split(/\s+/).filter(Boolean).length,
      summary: journalData.summary || 'A personal reflection.',
      themes: journalData.themes || ['Reflection'],
      positives: journalData.positives || [],
      coping: journalData.coping || ['Keep journaling to reflect on thoughts.'],
      timestamp: Date.now()
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('journals').insertOne(newJournal)
      const user = await mdb.collection('users').findOne({ id: userId })
      if (user) {
        let streak = user.streak || 1
        if (user.lastActive === yesterdayStr) {
          streak += 1
        } else if (user.lastActive !== todayStr) {
          streak = 1
        }
        await mdb.collection('users').updateOne({ id: userId }, { $set: { streak, lastActive: todayStr } })
      }
      return newJournal
    }

    const data = loadLocalDb()
    data.journals.push(newJournal)
    const user = data.users.find(u => u.id === userId)
    if (user) {
      if (user.lastActive === yesterdayStr) {
        user.streak += 1
      } else if (user.lastActive !== todayStr) {
        user.streak = 1
      }
      user.lastActive = todayStr
    }
    saveLocalDb(data)
    return newJournal
  },

  deleteJournal: async (userId, journalId) => {
    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('journals').deleteOne({ id: journalId, userId })
      return true
    }
    const data = loadLocalDb()
    data.journals = data.journals.filter(j => !(j.id === journalId && j.userId === userId))
    saveLocalDb(data)
    return true
  },

  // --- Sessions Table ---
  getSessionsByUserId: async (userId) => {
    const mdb = await getMongoDb()
    if (mdb) {
      return await mdb.collection('sessions').find({ userId }).sort({ timestamp: -1 }).toArray()
    }
    const sessions = loadLocalDb().sessions
    return sessions.filter(s => s.userId === userId).sort((a,b) => b.timestamp - a.timestamp)
  },

  addSession: async (userId, sessionData) => {
    const newSession = {
      id: Date.now().toString(),
      userId,
      type: sessionData.type,
      exerciseId: sessionData.exerciseId,
      duration: parseInt(sessionData.duration) || 60,
      date: sessionData.date || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const mdb = await getMongoDb()
    if (mdb) {
      await mdb.collection('sessions').insertOne(newSession)
      const user = await mdb.collection('users').findOne({ id: userId })
      if (user) {
        let streak = user.streak || 1
        if (user.lastActive === yesterdayStr) {
          streak += 1
        } else if (user.lastActive !== todayStr) {
          streak = 1
        }
        await mdb.collection('users').updateOne({ id: userId }, { $set: { streak, lastActive: todayStr } })
      }
      return newSession
    }

    const data = loadLocalDb()
    data.sessions.push(newSession)
    const user = data.users.find(u => u.id === userId)
    if (user) {
      if (user.lastActive === yesterdayStr) {
        user.streak += 1
      } else if (user.lastActive !== todayStr) {
        user.streak = 1
      }
      user.lastActive = todayStr
    }
    saveLocalDb(data)
    return newSession
  }
}
