// Map of userId (number) -> Set of SSE response objects
// Multiple tabs from the same user each get their own entry in the Set
const sseClients = new Map()

function addClient(userId, res) {
  if (!sseClients.has(userId)) sseClients.set(userId, new Set())
  sseClients.get(userId).add(res)
}

function removeClient(userId, res) {
  const set = sseClients.get(userId)
  if (!set) return
  set.delete(res)
  if (set.size === 0) sseClients.delete(userId)
}

function pushToUser(userId, eventName, data) {
  const set = sseClients.get(userId)
  if (!set) return
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
  for (const res of set) {
    try { res.write(payload) } catch {}
  }
}

module.exports = { addClient, removeClient, pushToUser }
