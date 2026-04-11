import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetFooter,
} from '@/components/ui/sheet'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Plus, Search, MoreHorizontal, Check, X, Pencil, Trash2, Archive,
  AlignLeft, MessageSquare, ChevronsUpDown, GripVertical,
  Bell, ChevronLeft, ChevronRight, ChevronDown, CornerDownRight, Paperclip, Reply,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MentionInput, renderWithMentions } from '@/components/MentionInput'

const API = '/api'

function useToken() {
  return localStorage.getItem('mtpl_token')
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRelativeTime(str) {
  if (!str) return ''
  const diff = Date.now() - new Date(str).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(str)
}

function formatDateTime(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function parseMessage(msg) {
  if (!msg) return { text: '', attachments: [] }
  const attachments = []
  const text = msg.replace(/\[attachment:([^|]+)\|([^\]]+)\]/g, (_, fileName, displayName) => {
    attachments.push({ fileName, displayName })
    return ''
  }).trim()
  return { text, attachments }
}

// ─── Utility components ───────────────────────────────────────────────────────

function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
]

function avatarColor(name) {
  const code = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function UserAvatar({ name, size = 6 }) {
  const sizeClass = size === 5 ? 'size-5' : size === 7 ? 'size-7' : size === 8 ? 'size-8' : 'size-6'
  const textClass = size <= 5 ? 'text-[10px]' : 'text-xs'
  return (
    <div className={cn(sizeClass, textClass, 'rounded-full flex items-center justify-center font-semibold shrink-0', avatarColor(name))}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function AttachmentChip({ fileName, displayName, token }) {
  return (
    <a
      href={`${API}/attachments/download/${fileName}`}
      target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground hover:bg-muted transition-colors w-fit"
    >
      <Paperclip size={11} className="text-muted-foreground" />
      {displayName}
    </a>
  )
}

// ─── Client combobox ──────────────────────────────────────────────────────────

function ClientCombobox({ clients, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = clients.find(c => String(c.id) === String(value))

  const filtered = query
    ? clients.filter(c => {
        const q = query.toLowerCase()
        return (
          c.full_name?.toLowerCase().includes(q) ||
          c.company_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.contact_1_no?.toLowerCase().includes(q) ||
          c.contact_2_no?.toLowerCase().includes(q)
        )
      })
    : clients

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring">
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>
            {selected ? `${selected.full_name}${selected.company_name ? ` — ${selected.company_name}` : ''}` : 'Select client'}
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(String(c.id)); setOpen(false); setQuery('') }}
                className={cn('flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                  String(value) === String(c.id) && 'text-primary')}>
                <div className="min-w-0">
                  <p className="truncate">{c.full_name}</p>
                  {c.company_name && <p className="text-xs text-muted-foreground truncate">{c.company_name}</p>}
                </div>
                {String(value) === String(c.id) && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left hover:bg-muted rounded">
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Order combobox ───────────────────────────────────────────────────────────

function OrderCombobox({ orders, clientMap, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = orders.find(o => String(o.id) === String(value))

  const filtered = query
    ? orders.filter(o => {
        const q = query.toLowerCase()
        return (
          o.job_id?.toLowerCase().includes(q) ||
          clientMap[o.client_id]?.full_name?.toLowerCase().includes(q) ||
          clientMap[o.client_id]?.company_name?.toLowerCase().includes(q)
        )
      })
    : orders

  const label = selected
    ? `${selected.job_id}${clientMap[selected.client_id] ? ` — ${clientMap[selected.client_id].company_name || clientMap[selected.client_id].full_name}` : ''}`
    : 'Select order (optional)'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring">
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>{label}</span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by Job ID or client…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(o => {
              const client = clientMap[o.client_id]
              return (
                <button key={o.id} type="button"
                  onClick={() => { onChange(String(o.id)); setOpen(false); setQuery('') }}
                  className={cn('flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                    String(value) === String(o.id) && 'text-primary')}>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs">{o.job_id}</p>
                    {client && <p className="text-xs text-muted-foreground truncate">{client.company_name || client.full_name}</p>}
                  </div>
                  {String(value) === String(o.id) && <Check size={14} className="shrink-0 ml-2" />}
                </button>
              )
            })
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left hover:bg-muted rounded">
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── User multi-select ────────────────────────────────────────────────────────

function UserMultiSelect({ users, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = users.filter(u => value.includes(u.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className="flex min-h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-1.5 text-sm text-left focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring">
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-sm">Assign to…</span>
            ) : (
              selected.map(u => (
                <span key={u.id}
                  className="inline-flex items-center gap-1 bg-muted text-foreground text-xs px-2 py-0.5 rounded-full">
                  {u.name}
                  <button type="button"
                    onClick={e => { e.stopPropagation(); onChange(value.filter(id => id !== u.id)) }}
                    className="text-muted-foreground hover:text-foreground">
                    <X size={10} />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1 backdrop-blur-sm bg-popover/65" align="start">
        {users.map(u => (
          <button key={u.id} type="button"
            onClick={() => {
              onChange(value.includes(u.id) ? value.filter(id => id !== u.id) : [...value, u.id])
            }}
            className="flex items-center justify-between w-full px-2 py-1.5 text-sm hover:bg-muted/60 rounded-md text-left">
            <div className="flex items-center gap-2">
              <UserAvatar name={u.name} size={5} />
              <span>{u.name}</span>
            </div>
            {value.includes(u.id) && <Check size={13} className="text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ─── Task comments tab ────────────────────────────────────────────────────────

function TaskCommentsTab({ task, userMap, token, currentUser }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)

  async function load() {
    try {
      const data = await fetch(`${API}/comments/task/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setComments(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [task.id])

  async function sendComment() {
    if (!message.trim() && !pendingFile) return
    setSending(true)
    try {
      let attachmentRef = ''
      if (pendingFile) {
        const fd = new FormData()
        fd.append('file', pendingFile)
        const up = await fetch(`${API}/attachments/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }).then(r => r.json())
        if (up.success) attachmentRef = `\n[attachment:${up.fileName}|${pendingFile.name}]`
      }
      const fullMessage = message.trim() + attachmentRef
      if (!fullMessage.trim()) { setSending(false); return }
      const res = await fetch(`${API}/comments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entity_type: 'task',
          entity_id: task.id,
          user_id: currentUser.id,
          message: fullMessage,
          parent_id: replyTo?.id ?? null,
        }),
      })
      if (res.ok) { setMessage(''); setPendingFile(null); setReplyTo(null); load() }
    } catch {}
    setSending(false)
  }

  const threads = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_id)
    const replies = comments.filter(c => c.parent_id)
    return topLevel.map(c => ({ ...c, replies: replies.filter(r => r.parent_id === c.id) }))
  }, [comments])

  function CommentCard({ comment, isReply }) {
    const author = userMap[comment.user_id]
    const { text, attachments } = parseMessage(comment.message)
    return (
      <div className={cn('rounded-xl border border-border p-3.5 flex flex-col gap-2', isReply && 'bg-muted/20')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar name={author?.name} />
            <span className="text-xs font-semibold text-foreground">{author?.name || 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
          </div>
          {!isReply && (
            <button type="button"
              onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Reply size={11} />
              Reply
            </button>
          )}
        </div>
        {text && <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{renderWithMentions(text, Object.values(userMap))}</p>}
        {attachments.map((a, i) => (
          <AttachmentChip key={i} fileName={a.fileName} displayName={a.displayName} token={token} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          threads.map(thread => (
            <div key={thread.id} className="flex flex-col gap-2">
              <CommentCard comment={thread} isReply={false} />
              {thread.replies.length > 0 && (
                <div className="pl-4 flex flex-col gap-2">
                  {thread.replies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <CornerDownRight size={13} className="shrink-0 mt-3 text-muted-foreground/40" />
                      <div className="flex-1"><CommentCard comment={reply} isReply={true} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-border px-6 py-4 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <span>Replying to <span className="font-medium text-foreground">{userMap[replyTo.user_id]?.name || 'Unknown'}</span></span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground"><X size={12} /></button>
          </div>
        )}
        {pendingFile && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs w-fit">
            <Paperclip size={11} className="text-muted-foreground" />
            <span className="text-foreground">{pendingFile.name}</span>
            <button type="button" onClick={() => setPendingFile(null)} className="text-muted-foreground hover:text-foreground"><X size={11} /></button>
          </div>
        )}
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden"
            onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); e.target.value = '' }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach file"
            className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <Paperclip size={14} />
          </button>
          <MentionInput
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() } }}
            placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'}
            users={Object.values(userMap)}
            className="w-full bg-input/50 rounded-3xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
          />
          <Button size="sm" onClick={sendComment} disabled={sending || (!message.trim() && !pendingFile)}>
            {sending ? '…' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Task view ────────────────────────────────────────────────────────────────

function TaskView({ task, clientMap, orderMap, userMap, currentUser, onEdit, onClose, onArchive, onDelete, onStatusChange, token }) {
  const [activeTab, setActiveTab] = useState('details')
  const [reminder, setReminder] = useState(null)

  useEffect(() => {
    async function loadReminder() {
      try {
        const data = await fetch(`${API}/reminders/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json())
        const taskReminder = Array.isArray(data) ? data.find(r => r.task_id === task.id) : null
        setReminder(taskReminder || null)
      } catch {}
    }
    loadReminder()
  }, [task.id, currentUser.id])

  const client = clientMap[task.client_id]
  const order = orderMap[task.order_id]
  const canArchive = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const canTrash = currentUser?.role === 'superadmin'

  const tabs = [
    { key: 'details', label: 'Details', icon: AlignLeft },
    { key: 'comments', label: 'Comments', icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDate(task.created_at)}</span>
            <span className="text-muted-foreground/30 text-xs">·</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">by {userMap[task.created_by]?.name || '—'}</span>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-2">
            <X size={14} />
          </button>
        </div>

        {/* Title + actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground leading-tight">{task.title}</h2>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <TaskStatusSelect task={task} onStatusChange={onStatusChange} />
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
                <Pencil size={13} />
                Edit
              </Button>
              {(canArchive || canTrash) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="px-2">
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                    {canArchive && (
                      <DropdownMenuItem onClick={onArchive}>
                        <Archive size={13} />
                        Archive
                      </DropdownMenuItem>
                    )}
                    {canTrash && (
                      <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        <Trash2 size={13} />
                        Trash
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-border/60 px-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
                activeTab === t.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-5">

            {/* Assignees */}
            {task.assignees?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Assigned To</h3>
                <div className="flex flex-wrap gap-2">
                  {task.assignees.map(a => (
                    <div key={a.id} className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1 text-xs text-foreground">
                      <UserAvatar name={a.name} size={5} />
                      {a.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client / Order */}
            {(client || order) && (
              <div className="flex flex-col gap-2">
                {client && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Client</span>
                    <span className="text-sm text-foreground">{client.company_name || client.full_name}</span>
                  </div>
                )}
                {order && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Order</span>
                    <span className="text-sm font-mono text-foreground">{order.job_id}</span>
                  </div>
                )}
              </div>
            )}

            {/* Reminder */}
            {reminder && (
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
                <Bell size={14} className="text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Reminder set</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(reminder.remind_at)}</span>
                </div>
              </div>
            )}

            {/* Created by */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Created by</span>
              <span className="text-sm text-foreground">{userMap[task.created_by]?.name || '—'}</span>
            </div>

          </div>
        )}

        {activeTab === 'comments' && (
          <TaskCommentsTab task={task} userMap={userMap} token={token} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}

// ─── Task status select pill ──────────────────────────────────────────────────

function TaskStatusSelect({ task, onStatusChange }) {
  const cfg = STATUS_CONFIG[task.status]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" onClick={e => e.stopPropagation()} className="rounded-full focus:outline-none">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap',
            cfg?.badge || 'bg-muted text-muted-foreground'
          )}>
            {cfg?.label || task.status}
            <ChevronDown size={10} className="shrink-0 opacity-60" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={e => e.stopPropagation()} className="[&::before]:hidden backdrop-blur-sm bg-popover/65">
        {VALID_TASK_STATUSES.map(s => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(task, s)}>
            <span className={cn('size-2 rounded-full shrink-0', {
              'bg-muted-foreground': s === 'in_queue',
              'bg-blue-500': s === 'working',
              'bg-yellow-500': s === 'waiting',
              'bg-green-500': s === 'done',
            })} />
            <span>{STATUS_CONFIG[s].label}</span>
            {task.status === s && <Check size={11} className="ml-auto shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Task form ────────────────────────────────────────────────────────────────

const VALID_TASK_STATUSES = ['in_queue', 'working', 'waiting', 'done']

const STATUS_CONFIG = {
  in_queue: { label: 'In Queue', badge: 'bg-muted text-muted-foreground' },
  working:  { label: 'Working',  badge: 'bg-blue-500/10 text-blue-500 dark:text-blue-400' },
  waiting:  { label: 'Waiting',  badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  done:     { label: 'Done',     badge: 'bg-muted text-muted-foreground' },
}

function TaskForm({ task, clients, orders, users, clientMap, token, currentUser, onSave, onClose }) {
  const isEdit = Boolean(task?.id)
  const draftKey = isEdit ? `draft_task_edit_${task.id}` : 'draft_task'

  function initialState() {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (!VALID_TASK_STATUSES.includes(parsed.status)) parsed.status = 'in_queue'
        return parsed
      } catch {}
    }
    if (isEdit) {
      return {
        title: task.title ?? '',
        description: task.description ?? '',
        assignees: task.assignees?.map(a => a.id) ?? [],
        client_id: task.client_id ? String(task.client_id) : '',
        order_id: task.order_id ? String(task.order_id) : '',
        status: VALID_TASK_STATUSES.includes(task.status) ? task.status : 'in_queue',
        reminder_date: '',
        reminder_time: '',
        reminder_user_id: task.assignees?.[0]?.id ? String(task.assignees[0].id) : '',
      }
    }
    return {
      title: '',
      description: '',
      assignees: [],
      client_id: '',
      order_id: '',
      status: 'in_queue',
      reminder_date: '',
      reminder_time: '',
      reminder_user_id: '',
    }
  }

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(form)) }, [form, draftKey])

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleOrderChange(orderId) {
    set('order_id', orderId)
    if (orderId) {
      const order = orders.find(o => String(o.id) === orderId)
      if (order?.client_id) set('client_id', String(order.client_id))
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const body = {
        ...(isEdit ? { id: task.id } : {}),
        title: form.title,
        description: form.description,
        assignees: form.assignees,
        client_id: form.client_id ? Number(form.client_id) : null,
        order_id: form.order_id ? Number(form.order_id) : null,
        status: VALID_TASK_STATUSES.includes(form.status) ? form.status : 'in_queue',
        created_by: currentUser?.id,
      }
      const res = await fetch(`${API}/tasks/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || `Failed to save task (${res.status})`)
        return
      }
      const saved = await res.json()

      // Save reminder if set
      if (form.reminder_date && form.reminder_time) {
        const remindAt = `${form.reminder_date}T${form.reminder_time}:00`
        const remindUserId = form.reminder_user_id || form.assignees[0] || currentUser.id
        await fetch(`${API}/reminders/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            task_id: saved.id ?? task?.id,
            user_id: Number(remindUserId),
            remind_at: remindAt,
          }),
        })
      }

      localStorage.removeItem(draftKey)
      onSave()
    } catch {
      setError('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  const hasReminder = form.reminder_date || form.reminder_time

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

        <SectionLabel label="Task Details" />

        <Field label="Title" required>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
        </Field>

        <Field label="Description">
          <Textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Details about this task…" rows={3} className="resize-none" />
        </Field>

        <Field label="Assigned To">
          <UserMultiSelect users={users} value={form.assignees} onChange={v => set('assignees', v)} />
        </Field>

        <Field label="Status">
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in_queue">In Queue</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <SectionLabel label="Links" />

        <Field label="Order">
          <OrderCombobox orders={orders} clientMap={clientMap} value={form.order_id} onChange={handleOrderChange} />
        </Field>

        <Field label="Client">
          <ClientCombobox clients={clients} value={form.client_id} onChange={v => set('client_id', v)} />
        </Field>

        <SectionLabel label="Reminder" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input type="date" value={form.reminder_date} onChange={e => set('reminder_date', e.target.value)} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.reminder_time} onChange={e => set('reminder_time', e.target.value)} />
          </Field>
        </div>

        {hasReminder && form.assignees.length > 1 && (
          <Field label="Remind">
            <Select value={form.reminder_user_id} onValueChange={v => set('reminder_user_id', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select user…" /></SelectTrigger>
              <SelectContent>
                {users.filter(u => form.assignees.includes(u.id)).map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <SheetFooter className="border-t border-border px-4 sm:px-6 py-4 flex-row justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </SheetFooter>
    </>
  )
}

// ─── Main Tasks page ──────────────────────────────────────────────────────────

const TAB_LABELS = {
  all:      'All Tasks',
  in_queue: 'In Queue',
  working:  'Working',
  waiting:  'Waiting',
  done:     'Done',
}

function Tasks({ tab = 'all' }) {
  const { user: currentUser } = useAuth()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const isExecutive = currentUser?.role === 'executive'
  const [search, setSearch] = useState('')
  const statusFilter = tab === 'all' ? 'all' : tab
  const [userFilter, setUserFilter] = useState(isExecutive ? 'mine' : 'all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const [doneCollapsed, setDoneCollapsed] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('view')
  const [selectedTask, setSelectedTask] = useState(null)

  // Drag state
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchAll() {
    try {
      const [t, c, o, u] = await Promise.all([
        fetch(`${API}/tasks`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/clients`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/orders`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeaders }).then(r => r.json()),
      ])
      setTasks(Array.isArray(t) ? t.filter(x => !x.is_archived) : [])
      setClients(Array.isArray(c) ? c : [])
      setOrders(Array.isArray(o) ? o : [])
      setUsers(Array.isArray(u) ? u : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSearch(''); setPage(1) }, [tab])

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const orderMap = useMemo(() => Object.fromEntries(orders.map(o => [o.id, o])), [orders])
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const canReorderAll = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const filtered = useMemo(() => {
    let list = [...tasks]

    // User filter
    if (userFilter === 'mine') {
      list = list.filter(t => t.assignees?.some(a => a.id === currentUser?.id))
    } else if (userFilter !== 'all') {
      list = list.filter(t => t.assignees?.some(a => String(a.id) === userFilter))
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        clientMap[t.client_id]?.full_name?.toLowerCase().includes(q) ||
        clientMap[t.client_id]?.company_name?.toLowerCase().includes(q)
      )
    }

    return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [tasks, userFilter, statusFilter, search, currentUser, clientMap])

  // When explicitly filtering to 'done', show everything normally (no grouping)
  const showDoneGroup = statusFilter !== 'done'
  const activeFiltered = useMemo(
    () => showDoneGroup ? filtered.filter(t => t.status !== 'done') : filtered,
    [filtered, showDoneGroup]
  )
  const doneFiltered = useMemo(
    () => showDoneGroup ? filtered.filter(t => t.status === 'done') : [],
    [filtered, showDoneGroup]
  )

  useEffect(() => { setPage(1) }, [activeFiltered])

  const paginated = useMemo(
    () => activeFiltered.slice((page - 1) * perPage, page * perPage),
    [activeFiltered, page, perPage]
  )

  // Can drag-reorder: only when showing a specific user's tasks and current user has permission
  const canReorder = !search.trim() && statusFilter === 'all' &&
    (canReorderAll || userFilter === 'mine')

  async function handleStatusChange(task, newStatus) {
    await fetch(`${API}/tasks/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description,
        client_id: task.client_id || null,
        order_id: task.order_id || null,
        status: newStatus,
        assignees: task.assignees?.map(a => a.id) ?? [],
      }),
    })
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    if (selectedTask?.id === task.id) setSelectedTask(prev => ({ ...prev, status: newStatus }))
  }

  async function handleArchive(task) {
    await fetch(`${API}/tasks/archive/${task.id}`, { method: 'POST', headers: authHeaders })
    setTasks(prev => prev.filter(t => t.id !== task.id))
    setDrawerOpen(false)
  }

  async function handleDelete(task) {
    await fetch(`${API}/tasks/trash/${task.id}`, { method: 'POST', headers: authHeaders })
    setTasks(prev => prev.filter(t => t.id !== task.id))
    setDrawerOpen(false)
  }

  // Drag handlers
  function handleDragStart(e, id) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== draggingId) setDragOverId(id)
  }

  async function handleDrop(e, targetId) {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return }

    const ids = filtered.map(t => t.id)
    const fromIdx = ids.indexOf(draggingId)
    const toIdx = ids.indexOf(targetId)
    const reordered = [...ids]
    reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, draggingId)

    // Optimistic update sort_order
    setTasks(prev => {
      const updated = [...prev]
      reordered.forEach((id, idx) => {
        const t = updated.find(x => x.id === id)
        if (t) t.sort_order = idx
      })
      return [...updated]
    })

    setDraggingId(null)
    setDragOverId(null)

    await fetch(`${API}/tasks/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ orderedIds: reordered }),
    })
  }

  function openView(task) {
    setSelectedTask(task)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      setSelectedTask(null)
      setDrawerMode('edit')
      setDrawerOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Header — mobile only; desktop header is in AppShell */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-xl font-semibold text-foreground">{TAB_LABELS[tab]}</h1>
        <Button size="sm" onClick={() => { setSelectedTask(null); setDrawerMode('edit'); setDrawerOpen(true) }} className="gap-1.5">
          <Plus size={15} />
          New Task
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-8 w-52" />
          </div>

          {/* User filter — hidden for executives */}
          {!isExecutive && (
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My Tasks</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Pagination controls */}
        {(activeFiltered.length > 0 || doneFiltered.length > 0) && (
          <div className="flex items-center gap-2 shrink-0">
            {activeFiltered.length > perPage && (
              <>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="flex items-center justify-center size-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">{page} / {Math.ceil(activeFiltered.length / perPage)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(activeFiltered.length / perPage)}
                  className="flex items-center justify-center size-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <ChevronRight size={14} />
                </button>
              </>
            )}
            <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1) }}>
              <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="20">Show 20</SelectItem>
                <SelectItem value="50">Show 50</SelectItem>
                <SelectItem value="100">Show 100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden rounded-2xl ring-1 ring-foreground/5 divide-y divide-border overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No tasks found.</p>
        ) : (
          paginated.map(task => {
            const client = clientMap[task.client_id]
            return (
              <div key={task.id} className="flex items-stretch gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openView(task)}>
                  <p className={cn('text-sm font-semibold text-foreground truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {task.assignees?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {task.assignees.slice(0, 2).map(a => (
                            <div key={a.id} title={a.name}
                              className="size-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                              {a.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                          {task.assignees.slice(0, 2).map(a => a.name?.split(' ')[0]).join(', ')}
                          {task.assignees.length > 2 && ` +${task.assignees.length - 2}`}
                        </span>
                      </div>
                    )}
                    {client && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {client.company_name || client.full_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                  <div onClick={e => e.stopPropagation()}>
                    <TaskStatusSelect task={task} onStatusChange={handleStatusChange} />
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                        <DropdownMenuItem onClick={() => { setSelectedTask(task); setDrawerMode('edit'); setDrawerOpen(true) }}>
                          <Pencil size={13} /> Edit
                        </DropdownMenuItem>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                          <DropdownMenuItem onClick={() => handleArchive(task)}>
                            <Archive size={13} /> Archive
                          </DropdownMenuItem>
                        )}
                        {currentUser?.role === 'superadmin' && (
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(task)}>
                            <Trash2 size={13} /> Trash
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl ring-1 ring-foreground/5 overflow-x-auto">
        <Table className="table-fixed min-w-[640px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {canReorder && <TableHead className="w-[3%]" />}
              <TableHead className="text-xs font-medium text-muted-foreground">Title</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[18%]">Assigned To</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[15%]">Client</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[10%]">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[10%]">Date</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canReorder ? 7 : 6} className="text-center text-muted-foreground text-sm py-12">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(task => {
                const client = clientMap[task.client_id]
                const isDragging = draggingId === task.id
                const isDragOver = dragOverId === task.id
                return (
                  <TableRow
                    key={task.id}
                    draggable={canReorder}
                    onDragStart={canReorder ? e => handleDragStart(e, task.id) : undefined}
                    onDragOver={canReorder ? e => handleDragOver(e, task.id) : undefined}
                    onDrop={canReorder ? e => handleDrop(e, task.id) : undefined}
                    onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                    onClick={() => openView(task)}
                    className={cn(
                      'cursor-pointer hover:bg-muted/30 align-middle transition-colors',
                      isDragging && 'opacity-40',
                      isDragOver && 'border-t-2 border-primary'
                    )}
                  >
                    {canReorder && (
                      <TableCell className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab"
                        onClick={e => e.stopPropagation()}>
                        <GripVertical size={14} />
                      </TableCell>
                    )}
                    <TableCell>
                      <p className={cn('text-sm font-medium text-foreground truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignees?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {task.assignees.slice(0, 3).map(a => (
                            <div key={a.id} title={a.name}
                              className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                              {a.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{task.assignees.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate">
                        {client?.company_name || client?.full_name || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <TaskStatusSelect task={task} onStatusChange={handleStatusChange} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(task.created_at)}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                          <DropdownMenuItem onClick={() => { setSelectedTask(task); setDrawerMode('edit'); setDrawerOpen(true) }}>
                            <Pencil size={13} />
                            Edit
                          </DropdownMenuItem>
                          {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                            <DropdownMenuItem onClick={() => handleArchive(task)}>
                              <Archive size={13} />
                              Archive
                            </DropdownMenuItem>
                          )}
                          {currentUser?.role === 'superadmin' && (
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(task)}>
                              <Trash2 size={13} />
                              Trash
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Side drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-[560px] flex flex-col p-0">
          {drawerOpen && drawerMode === 'view' && selectedTask && (
            <TaskView
              task={selectedTask}
              clientMap={clientMap}
              orderMap={orderMap}
              userMap={userMap}
              currentUser={currentUser}
              token={token}
              onEdit={() => setDrawerMode('edit')}
              onClose={() => setDrawerOpen(false)}
              onArchive={() => handleArchive(selectedTask)}
              onDelete={() => handleDelete(selectedTask)}
              onStatusChange={newStatus => handleStatusChange(selectedTask, newStatus)}
            />
          )}
          {drawerOpen && drawerMode === 'edit' && (
            <TaskForm
              task={selectedTask}
              clients={clients}
              orders={orders}
              users={users}
              clientMap={clientMap}
              token={token}
              currentUser={currentUser}
              onSave={() => { setDrawerOpen(false); fetchAll() }}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Tasks
