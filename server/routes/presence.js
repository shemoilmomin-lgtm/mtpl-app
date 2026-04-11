const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const authenticate = require('../middleware/auth')

// In-memory presence store: userId -> { lastSeen, status }
const presence = new Map()

const OFFLINE_THRESHOLD_MS  = 10 * 60 * 1000  // 10 minutes
const IDLE_THRESHOLD_MS     = 2  * 60 * 1000  //  2 minutes

function effectiveStatus(entry) {
  if (!entry) return 'offline'
  const ageMs = Date.now() - new Date(entry.lastSeen).getTime()
  if (ageMs > OFFLINE_THRESHOLD_MS) return 'offline'
  if (ageMs > IDLE_THRESHOLD_MS)    return 'idle'
  return entry.status || 'active'
}

// Heartbeat — called every 30s by all logged-in clients
router.post('/ping', authenticate, (req, res) => {
  const { status = 'active' } = req.body
  presence.set(req.user.id, {
    lastSeen: new Date().toISOString(),
    status,
  })
  res.json({ ok: true })
})

// Explicit offline — called on logout
router.post('/offline', authenticate, (req, res) => {
  presence.delete(req.user.id)
  res.json({ ok: true })
})

// Get all users with presence status — superadmin only
router.get('/', authenticate, async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' })
  try {
    const result = await pool.query('SELECT id, name, role FROM users ORDER BY name ASC')
    const users = result.rows.map(u => {
      const entry = presence.get(u.id)
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        status: effectiveStatus(entry),
        lastSeen: entry?.lastSeen || null,
      }
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
