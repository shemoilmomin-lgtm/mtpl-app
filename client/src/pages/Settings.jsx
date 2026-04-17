import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Pencil, Trash2, UserPlus, Sun, Moon, RefreshCw, Paperclip, X, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = '/api'

function useToken() {
  return localStorage.getItem('mtpl_token')
}

const ROLES = ['executive', 'admin', 'superadmin']
const ROLE_LABELS = { executive: 'Executive', admin: 'Admin', superadmin: 'Superadmin' }

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span className={`inline-block size-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab({ token, currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', username: '', role: 'executive', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  async function loadUsers() {
    try {
      const data = await fetch(`${API}/users`, { headers }).then(r => r.json())
      setUsers(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ name: '', username: '', role: 'executive', password: '' })
    setError('')
    setDialogOpen(true)
  }

  function openEdit(user) {
    setEditing(user)
    setForm({ name: user.name, username: user.username, role: user.role, password: '' })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.username.trim()) {
      setError('Name and username are required.')
      return
    }
    if (!editing && !form.password.trim()) {
      setError('Password is required for new users.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = { name: form.name.trim(), username: form.username.trim(), role: form.role }
      if (form.password.trim()) body.password = form.password
      const url = editing ? `${API}/users/${editing.id}` : `${API}/users`
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); return }
      setDialogOpen(false)
      loadUsers()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API}/users/${id}`, { method: 'DELETE', headers })
    } catch {}
    setDeleteConfirm(null)
    loadUsers()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Team Members</p>
          <p className="text-xs text-muted-foreground mt-0.5">Manage user accounts and permissions</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <UserPlus size={14} className="mr-2" />
          Add User
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-sm">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono text-xs">{u.username}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === 'superadmin' ? 'bg-primary/10 text-primary' :
                      u.role === 'admin' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>{ROLE_LABELS[u.role] || u.role}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        disabled={u.id === currentUserId}
                        onClick={() => setDeleteConfirm(u.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Username</label>
              <Input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Username or email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Role</label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Password{editing && <span className="text-muted-foreground font-normal ml-1">(leave blank to keep current)</span>}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={editing ? 'New password' : 'Password'}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-1">
            This cannot be undone. Are you sure?
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Preferences Tab ───────────────────────────────────────────────────────────

function PreferencesTab({ token, isSuperadmin }) {
  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('mtpl_theme') || 'light')

  // Feed open
  const [feedOpen, setFeedOpen] = useState(false)
  const [savingFeed, setSavingFeed] = useState(false)
  const [savedFeed, setSavedFeed] = useState(false)

  // Numbering (superadmin only)
  const [numbering, setNumbering] = useState({
    manualOrderNumberEnabled: false,
    manualQuotationNumberEnabled: false,
  })
  const [savingNum, setSavingNum] = useState(false)
  const [savedNum, setSavedNum] = useState(false)

  const authHeaders = { Authorization: `Bearer ${token}` }
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch(`${API}/settings`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (typeof data !== 'object' || data.error) return
        setFeedOpen(data.activityFeedOpen === 'true')
        if (isSuperadmin) {
          setNumbering({
            manualOrderNumberEnabled:     data.manualOrderNumberEnabled     === 'true',
            manualQuotationNumberEnabled: data.manualQuotationNumberEnabled === 'true',
          })
        }
      })
      .catch(() => {})
  }, [])

  function applyTheme(value) {
    setTheme(value)
    localStorage.setItem('mtpl_theme', value)
    document.documentElement.classList.toggle('dark', value === 'dark')
  }

  async function saveSetting(key, value) {
    await fetch(`${API}/settings/save`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ key, value: String(value) }),
    })
  }

  async function saveFeed() {
    setSavingFeed(true)
    setSavedFeed(false)
    try {
      await saveSetting('activityFeedOpen', feedOpen)
      localStorage.setItem('activityFeedOpen', String(feedOpen))
      window.dispatchEvent(new CustomEvent('activityFeedSetting', { detail: feedOpen }))
      setSavedFeed(true)
      setTimeout(() => setSavedFeed(false), 2000)
    } finally {
      setSavingFeed(false)
    }
  }

  async function saveNumbering() {
    setSavingNum(true)
    setSavedNum(false)
    try {
      await Promise.all([
        saveSetting('manualOrderNumberEnabled', numbering.manualOrderNumberEnabled),
        saveSetting('manualQuotationNumberEnabled', numbering.manualQuotationNumberEnabled),
      ])
      setSavedNum(true)
      setTimeout(() => setSavedNum(false), 2000)
    } finally {
      setSavingNum(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Appearance */}
      <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Appearance</p>
          <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</p>
        </div>
        <Separator />
        <div className="flex gap-3">
          <button
            onClick={() => applyTheme('light')}
            className={cn(
              'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-foreground/20'
            )}
          >
            <div className="size-10 rounded-full bg-white border border-border/60 flex items-center justify-center shadow-sm">
              <Sun size={18} className="text-amber-500" />
            </div>
            <span className={cn(
              'text-xs font-medium',
              theme === 'light' ? 'text-primary' : 'text-muted-foreground'
            )}>Light</span>
          </button>
          <button
            onClick={() => applyTheme('dark')}
            className={cn(
              'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-foreground/20'
            )}
          >
            <div className="size-10 rounded-full bg-zinc-900 border border-border flex items-center justify-center">
              <Moon size={18} className="text-sky-400" />
            </div>
            <span className={cn(
              'text-xs font-medium',
              theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
            )}>Dark</span>
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Display</p>
          <p className="text-xs text-muted-foreground mt-0.5">Layout and panel preferences</p>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-foreground">Keep Recent Comments Open</p>
            <p className="text-xs text-muted-foreground">Comments panel stays open by default on every page load</p>
          </div>
          <Toggle
            checked={feedOpen}
            onChange={v => setFeedOpen(v)}
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={saveFeed} disabled={savingFeed}>
            {savingFeed ? 'Saving...' : savedFeed ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Numbering — superadmin only */}
      {isSuperadmin && (
        <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Numbering</p>
            <p className="text-xs text-muted-foreground mt-0.5">Control whether IDs are auto-generated or entered manually</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">Manual Order Numbers</p>
                <p className="text-xs text-muted-foreground">Allow custom job IDs when creating orders</p>
              </div>
              <Toggle
                checked={numbering.manualOrderNumberEnabled}
                onChange={v => setNumbering(n => ({ ...n, manualOrderNumberEnabled: v }))}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">Manual Quotation Numbers</p>
                <p className="text-xs text-muted-foreground">Allow custom quotation IDs when creating quotations</p>
              </div>
              <Toggle
                checked={numbering.manualQuotationNumberEnabled}
                onChange={v => setNumbering(n => ({ ...n, manualQuotationNumberEnabled: v }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={saveNumbering} disabled={savingNum}>
              {savingNum ? 'Saving...' : savedNum ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* App update button — mobile only */}
      <AppUpdateSection />

    </div>
  )
}

// ── App update ────────────────────────────────────────────────────────────────

function AppUpdateSection() {
  return (
    <div className="lg:hidden pt-3 border-t border-border flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">App Version</p>
        <p className="text-xs text-muted-foreground">v3.2</p>
      </div>
      <Button className="w-full" variant="outline" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  )
}

// ── Live Tab ──────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  superadmin: 'bg-primary/10 text-primary',
  admin:      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  executive:  'bg-muted text-muted-foreground',
}

const STATUS_DOT = {
  active:  'bg-green-500',
  idle:    'bg-amber-400',
  offline: 'bg-muted-foreground/30',
}

const STATUS_LABEL = {
  active:  'Active',
  idle:    'Idle',
  offline: 'Offline',
}

const STATUS_ORDER = { active: 0, idle: 1, offline: 2 }

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Never logged in'
  const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000)
  if (diff < 10)  return 'Just now'
  if (diff < 60)  return `${diff}s ago`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

function LiveTab({ token }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [tick, setTick] = useState(0)
  const intervalRef = useRef(null)

  const headers = { Authorization: `Bearer ${token}` }

  async function loadPresence() {
    try {
      const data = await fetch(`${API}/presence`, { headers }).then(r => r.json())
      if (Array.isArray(data)) {
        setUsers([...data].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]))
        setUpdatedAt(Date.now())
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadPresence()
    intervalRef.current = setInterval(loadPresence, 15_000)
    // tick for "updated X seconds ago" display
    const tickInterval = setInterval(() => setTick(t => t + 1), 5000)
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(tickInterval)
    }
  }, [])

  const secondsSinceUpdate = updatedAt ? Math.floor((Date.now() - updatedAt) / 1000) : null

  const onlineCount  = users.filter(u => u.status === 'active').length
  const idleCount    = users.filter(u => u.status === 'idle').length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Live Users</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {onlineCount} active{idleCount > 0 ? `, ${idleCount} idle` : ''} right now
          </p>
        </div>
        <div className="flex items-center gap-2">
          {secondsSinceUpdate !== null && (
            <span className="text-[11px] text-muted-foreground">
              Updated {secondsSinceUpdate < 5 ? 'just now' : `${secondsSinceUpdate}s ago`}
            </span>
          )}
          <button
            onClick={loadPresence}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {users.map((u, i) => (
            <div
              key={u.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                i < users.length - 1 && 'border-b border-border'
              )}
            >
              {/* Avatar */}
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                {u.name?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5',
                  ROLE_COLORS[u.role] || 'bg-muted text-muted-foreground'
                )}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', STATUS_DOT[u.status])} />
                  <span className={cn(
                    'text-xs font-medium',
                    u.status === 'active'  ? 'text-green-600 dark:text-green-400' :
                    u.status === 'idle'    ? 'text-amber-500' :
                    'text-muted-foreground'
                  )}>
                    {STATUS_LABEL[u.status]}
                  </span>
                </div>
                {u.status !== 'active' && (
                  <span className="text-[10px] text-muted-foreground">{formatLastSeen(u.lastSeen)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Feedback Tab ──────────────────────────────────────────────────────────────

function FeedbackTab({ token }) {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const picked = Array.from(e.target.files || [])
    setFiles(prev => {
      const combined = [...prev, ...picked]
      return combined.slice(0, 3)
    })
    e.target.value = ''
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      const form = new FormData()
      form.append('message', message.trim())
      files.forEach(f => form.append('attachments', f))
      const res = await fetch(`${API}/feedbacks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error('Failed')
      setMessage('')
      setFiles([])
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError('Could not send feedback. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div>
        <p className="text-sm font-semibold text-foreground">Send Feedback</p>
        <p className="text-xs text-muted-foreground mt-1">Share a bug, suggestion, or anything on your mind.</p>
      </div>

      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Describe your feedback…"
        rows={5}
        className="resize-none"
      />

      {/* Attachments */}
      <div className="flex flex-col gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-muted/40 rounded-lg px-3 py-2">
            <Paperclip size={13} className="text-muted-foreground shrink-0" />
            <span className="truncate flex-1">{f.name}</span>
            <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground shrink-0">
              <X size={13} />
            </button>
          </div>
        ))}
        {files.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip size={13} />
            Attach file ({files.length}/3)
          </button>
        )}
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {sent ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle size={15} />
          Feedback sent. Thank you!
        </div>
      ) : (
        <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2 self-start">
          <Send size={14} />
          {sending ? 'Sending…' : 'Send Feedback'}
        </Button>
      )}
    </div>
  )
}

// ── Feedbacks Tab (admin/superadmin) ──────────────────────────────────────────

function FeedbacksTab({ token }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/feedbacks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  if (feedbacks.length === 0) return (
    <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
  )

  return (
    <div className="flex flex-col gap-4">
      {feedbacks.map(fb => (
        <div key={fb.id} className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{fb.user_name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(fb.created_at)}</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{fb.message}</p>
          {fb.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {fb.attachments.map((att, i) => (
                <a
                  key={i}
                  href={`/api/attachments/download/${encodeURIComponent(att.fileName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Paperclip size={11} />
                  {att.displayName}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────

function Settings() {
  const { user } = useAuth()
  const token = useToken()
  const isSuperadmin = user?.role === 'superadmin'

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const tabs = [
    { key: 'preferences', label: 'Preferences' },
    ...(isSuperadmin ? [{ key: 'users', label: 'Users' }] : []),
    ...(isSuperadmin ? [{ key: 'live', label: 'Live' }] : []),
    { key: 'feedback', label: 'Feedback' },
    ...(isAdmin ? [{ key: 'feedbacks', label: 'Feedbacks' }] : []),
  ]

  const [activeTab, setActiveTab] = useState('preferences')

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="hidden lg:block">
        <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences and app configuration</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'preferences' && <PreferencesTab token={token} isSuperadmin={isSuperadmin} />}
      {activeTab === 'users' && isSuperadmin && <UsersTab token={token} currentUserId={user?.id} />}
      {activeTab === 'live' && isSuperadmin && <LiveTab token={token} />}
      {activeTab === 'feedback' && <FeedbackTab token={token} />}
      {activeTab === 'feedbacks' && isAdmin && <FeedbacksTab token={token} />}

      <p className="text-xs text-muted-foreground/50 pt-2">v3.2</p>
    </div>
  )
}

export default Settings
