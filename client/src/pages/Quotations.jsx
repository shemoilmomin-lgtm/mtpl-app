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
  Plus, Search, MoreHorizontal, Copy, Check, X, Pencil, Trash2, Minus, Archive,
  AlignLeft, MessageSquare, Activity, Paperclip, CornerDownRight, Download,
  ChevronsUpDown, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MentionInput, renderWithMentions } from '@/components/MentionInput'
import { downloadQuotationPDF } from '@/lib/quotationPdf.jsx'

const API = '/api'
const GST_RATE = 0.18

function useToken() {
  return localStorage.getItem('mtpl_token')
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtQuotationNumber(quotation) {
  return quotation.quotation_id || `MTPLQ-${String(quotation.id).padStart(4, '0')}`
}

function formatAmount(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function calcTotals(items, discountType, discountAmount, taxMode) {
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const discAmt = parseFloat(discountAmount) || 0
  const discValue = discountType === 'percentage' ? subtotal * discAmt / 100 : discAmt
  const afterDiscount = Math.max(0, subtotal - discValue)
  let tax = 0
  let total = afterDiscount
  if (taxMode === 'exclusive') {
    tax = afterDiscount * GST_RATE
    total = afterDiscount + tax
  } else if (taxMode === 'inclusive') {
    tax = afterDiscount * GST_RATE / (1 + GST_RATE)
    total = afterDiscount
  }
  return { subtotal, discValue, tax, total }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value, title = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  function handleCopy(e) {
    e.stopPropagation()
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button type="button" onClick={handleCopy} title={title}
      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
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
          c.contact_2_no?.toLowerCase().includes(q) ||
          c.contact_3_no?.toLowerCase().includes(q) ||
          c.contact_4_no?.toLowerCase().includes(q) ||
          c.contact_accountant_no?.toLowerCase().includes(q)
        )
      })
    : clients

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left transition-colors focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring"
        >
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>
            {selected
              ? `${selected.full_name}${selected.company_name ? ` — ${selected.company_name}` : ''}`
              : 'Select client'}
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto overscroll-y-contain py-1" onWheel={e => e.stopPropagation()}>
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(String(c.id)); setOpen(false); setQuery('') }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                  String(value) === String(c.id) && 'text-primary'
                )}
              >
                <div className="min-w-0">
                  <p className="truncate">{c.full_name}</p>
                  {c.company_name && (
                    <p className="text-xs text-muted-foreground truncate">{c.company_name}</p>
                  )}
                </div>
                {String(value) === String(c.id) && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left hover:bg-muted rounded"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Lead combobox ────────────────────────────────────────────────────────────

function LeadCombobox({ leads, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = leads.find(l => String(l.id) === String(value))

  const filtered = query
    ? leads.filter(l => {
        const q = query.toLowerCase()
        return (
          l.lead_id?.toLowerCase().includes(q) ||
          l.client_manual_name?.toLowerCase().includes(q) ||
          l.subject?.toLowerCase().includes(q)
        )
      })
    : leads

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left transition-colors focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring"
        >
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>
            {selected
              ? `${selected.lead_id}${selected.client_manual_name ? ` — ${selected.client_manual_name}` : ''}`
              : 'None'}
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto overscroll-y-contain py-1" onWheel={e => e.stopPropagation()}>
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => { onChange(String(l.id)); setOpen(false); setQuery('') }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                  String(value) === String(l.id) && 'text-primary'
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{l.lead_id}</p>
                  {l.client_manual_name && (
                    <p className="text-xs text-muted-foreground truncate">{l.client_manual_name}</p>
                  )}
                </div>
                {String(value) === String(l.id) && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left hover:bg-muted rounded"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Order combobox ───────────────────────────────────────────────────────────

function OrderCombobox({ orders, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = orders.find(o => String(o.id) === String(value))

  const filtered = query
    ? orders.filter(o => {
        const q = query.toLowerCase()
        return (
          o.job_id?.toLowerCase().includes(q) ||
          o.project_name?.toLowerCase().includes(q)
        )
      })
    : orders

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left transition-colors focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring"
        >
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>
            {selected
              ? `${selected.job_id}${selected.project_name ? ` — ${selected.project_name}` : ''}`
              : 'None'}
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search orders…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto overscroll-y-contain py-1" onWheel={e => e.stopPropagation()}>
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(String(o.id)); setOpen(false); setQuery('') }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                  String(value) === String(o.id) && 'text-primary'
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{o.job_id}</p>
                  {o.project_name && (
                    <p className="text-xs text-muted-foreground truncate">{o.project_name}</p>
                  )}
                </div>
                {String(value) === String(o.id) && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left hover:bg-muted rounded"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

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

function SectionCard({ title, rows }) {
  const validRows = rows.filter(r => r.value)
  if (validRows.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {validRows.map(({ label, value }, i) => (
          <div key={i} className={cn('flex items-start gap-3 px-4 py-2.5', i < validRows.length - 1 && 'border-b border-border')}>
            <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
            <span className="text-sm text-foreground flex-1 break-words">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Comment helpers ──────────────────────────────────────────────────────────

function parseMessage(msg) {
  const attachments = []
  const regex = /\[attachment:([^|]+)\|([^\]]+)\]/g
  let match
  while ((match = regex.exec(msg)) !== null) {
    attachments.push({ fileName: match[1], displayName: match[2] })
  }
  const text = msg.replace(/\[attachment:[^\]]+\]/g, '').trim()
  return { text, attachments }
}

function AttachmentChip({ fileName, displayName }) {
  return (
    <a
      href={`${API}/attachments/download/${encodeURIComponent(fileName)}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-fit"
    >
      <Paperclip size={11} className="shrink-0 text-muted-foreground" />
      {displayName}
    </a>
  )
}

// ─── Comments tab ─────────────────────────────────────────────────────────────

function CommentsTab({ entityId, userMap, token, currentUser }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  function canDeleteComment(comment) {
    if (isAdmin) return true
    if (comment.user_id !== currentUser?.id) return false
    return (Date.now() - new Date(comment.created_at + 'Z').getTime()) < 30 * 60 * 1000
  }

  function canEditComment(comment) {
    if (isAdmin) return true
    if (comment.user_id !== currentUser?.id) return false
    return (Date.now() - new Date(comment.created_at + 'Z').getTime()) < 2 * 60 * 60 * 1000
  }

  async function deleteComment(id) {
    try {
      await fetch(`${API}/comments/delete/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  async function editComment(id, newMessage) {
    try {
      const res = await fetch(`${API}/comments/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage }),
      })
      if (res.ok) {
        const updated = await res.json()
        setComments(prev => prev.map(c => c.id === id ? { ...c, message: updated.message, edited_at: updated.edited_at } : c))
      }
    } catch {}
  }

  async function load() {
    try {
      const data = await fetch(`${API}/comments/quotation/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setComments(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [entityId])

  useEffect(() => {
    if (!token) return
    const es = new EventSource(`/api/comments/stream?token=${encodeURIComponent(token)}`)
    es.addEventListener('entity_comment', (e) => {
      try {
        const c = JSON.parse(e.data)
        if (c.entity_type === 'quotation' && String(c.entity_id) === String(entityId)) {
          setComments(prev => prev.some(x => x.id === c.id) ? prev : [c, ...prev])
        }
      } catch {}
    })
    return () => es.close()
  }, [token, entityId])

  async function sendComment() {
    if (!message.trim() && !pendingFile) return
    setSending(true)
    try {
      let attachmentRef = ''
      if (pendingFile) {
        const fd = new FormData()
        fd.append('file', pendingFile)
        const up = await fetch(`${API}/attachments/upload`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        }).then(r => r.json())
        if (up.success) attachmentRef = `\n[attachment:${up.fileName}|${pendingFile.name}]`
      }
      const fullMessage = message.trim() + attachmentRef
      if (!fullMessage.trim()) { setSending(false); return }
      const res = await fetch(`${API}/comments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entity_type: 'quotation', entity_id: entityId,
          user_id: currentUser.id, message: fullMessage,
          parent_id: replyTo?.id ?? null,
        }),
      })
      if (res.ok) { setMessage(''); setPendingFile(null); setReplyTo(null); load() }
    } catch {}
    setSending(false)
  }

  const threads = useMemo(() => {
    const top = comments.filter(c => !c.parent_id)
    return top.map(c => ({ ...c, replies: comments.filter(r => r.parent_id === c.id) }))
  }, [comments])

  function CommentCard({ comment, isReply = false }) {
    const author = userMap[comment.user_id]
    const { text, attachments } = parseMessage(comment.message)
    const canDelete = canDeleteComment(comment)
    const canEdit = canEditComment(comment)
    const [editing, setEditing] = useState(false)
    const [editText, setEditText] = useState(text)

    async function saveEdit() {
      if (!editText.trim()) return
      const attachmentPart = comment.message.match(/(\[attachment:[^\]]+\])/g)?.join(' ') || ''
      const newMessage = editText.trim() + (attachmentPart ? '\n' + attachmentPart : '')
      await editComment(comment.id, newMessage)
      setEditing(false)
    }

    return (
      <div className={cn('rounded-xl border border-border bg-muted/20 p-3 flex flex-col gap-2', isReply && 'ml-6')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground">{author?.name ?? 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
            {comment.edited_at && <span className="text-[10px] text-muted-foreground/60">(edited)</span>}
          </div>
          <div className="flex items-center gap-1">
            {!isReply && (
              <button onClick={() => setReplyTo(comment)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                <CornerDownRight size={10} />Reply
              </button>
            )}
            {canEdit && !editing && (
              <button
                type="button"
                onClick={() => { setEditText(text); setEditing(true) }}
                className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-0.5"
              >
                <Pencil size={11} />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => deleteComment(comment.id)}
                className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-0.5"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-input/50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted">Cancel</button>
              <button type="button" onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90">Save</button>
            </div>
          </div>
        ) : (
          <>
            {text && <p className="text-sm text-foreground whitespace-pre-wrap">{renderWithMentions(text, Object.values(userMap))}</p>}
            {attachments.map(a => <AttachmentChip key={a.fileName} fileName={a.fileName} displayName={a.displayName} />)}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
          : threads.length === 0 ? <p className="text-sm text-muted-foreground">No comments yet.</p>
          : threads.map(c => (
            <div key={c.id} className="flex flex-col gap-2">
              <CommentCard comment={c} />
              {c.replies.map(r => <CommentCard key={r.id} comment={r} isReply />)}
            </div>
          ))
        }
      </div>
      <div className="shrink-0 border-t border-border px-6 py-4 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
            <CornerDownRight size={11} />
            <span>Replying to {userMap[replyTo.user_id]?.name ?? 'comment'}</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto hover:text-foreground"><X size={11} /></button>
          </div>
        )}
        {pendingFile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
            <Paperclip size={11} />
            <span className="truncate">{pendingFile.name}</span>
            <button onClick={() => setPendingFile(null)} className="ml-auto hover:text-foreground"><X size={11} /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden"
            onChange={e => { setPendingFile(e.target.files[0] || null); e.target.value = '' }} />
          <button onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Paperclip size={15} />
          </button>
          <MentionInput
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendComment() } }}
            placeholder="Add a comment…"
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

// ─── Activity tab ─────────────────────────────────────────────────────────────

function ActivityTab({ entityId, userMap, token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/activity/quotation/${entityId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [entityId])

  return (
    <div className="px-6 py-5 flex flex-col gap-0">
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : logs.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p>
        : logs.map((log, i) => {
          const author = userMap[log.user_id]
          return (
            <div key={log.id} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="size-2 rounded-full bg-border shrink-0" />
                {i < logs.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
              </div>
              <div className={cn('flex-1 min-w-0', i < logs.length - 1 ? 'pb-4' : 'pb-0')}>
                <p className="text-sm text-foreground">{log.message}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {author && <><span className="text-[10px] text-muted-foreground">{author.name}</span><span className="text-[10px] text-muted-foreground">·</span></>}
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(log.created_at)}</span>
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

// ─── Quotation view ───────────────────────────────────────────────────────────

function QuotationView({ quotation, clientMap, userMap, onEdit, onClose, onDuplicate, onArchive, onDelete, token, currentUser }) {
  const [activeTab, setActiveTab] = useState('details')
  const [pdfLoading, setPdfLoading] = useState(false)
  const client = clientMap[quotation.client_id]
  const createdBy = userMap[quotation.created_by]

  const isExecutive = currentUser?.role === 'executive'
  const TABS = [
    { id: 'details',  label: 'Details',  Icon: AlignLeft },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
    ...(!isExecutive ? [{ id: 'activity', label: 'Activity', Icon: Activity }] : []),
  ]

  const { subtotal, discValue, tax, total } = calcTotals(
    quotation.items || [], quotation.discount_type, quotation.discount_amount, quotation.tax_mode
  )

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 border-b border-border">

        {/* Top strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="font-mono text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
              {fmtQuotationNumber(quotation)}
            </span>
            <CopyButton value={fmtQuotationNumber(quotation)} title="Copy Quotation Number" />
            <span className="text-muted-foreground/30 text-xs shrink-0">·</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(quotation.date)}</span>
            {createdBy && (
              <>
                <span className="text-muted-foreground/30 text-xs hidden sm:inline shrink-0">·</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">by {createdBy.name}</span>
              </>
            )}
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>

        {/* Client + subject + actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground leading-tight">
              {client?.company_name || client?.full_name || '—'}
            </h2>
            {quotation.subject && (
              <p className="text-sm text-muted-foreground mt-0.5">{quotation.subject}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"
              disabled={pdfLoading}
              onClick={async () => {
                setPdfLoading(true)
                await downloadQuotationPDF(quotation, client, createdBy)
                setPdfLoading(false)
              }}
              className="gap-1.5 text-[14px]">
              <Download className="size-[13px]" />
              {pdfLoading ? 'Generating…' : 'PDF'}
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 text-[14px]">
              <Pencil className="size-[13px]" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy size={13} className="mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive size={13} className="mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                {currentUser?.role === 'superadmin' && (
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 size={13} className="mr-2" />
                    Trash
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-border/60 px-2">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                activeTab === id
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-5">

            {/* Line items */}
            {quotation.items?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Line Items</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  {/* Desktop table */}
                  <table className="hidden sm:table w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 w-[45%]">Item</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Qty</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Rate</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items.map((item, i) => (
                        <tr key={i} className={cn(i < quotation.items.length - 1 && 'border-b border-border')}>
                          <td className="px-4 py-3">
                            {item.item_name && <p className="font-medium text-foreground">{item.item_name}</p>}
                            {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{formatAmount(item.rate)}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{formatAmount(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile card list */}
                  <div className="sm:hidden flex flex-col divide-y divide-border">
                    {quotation.items.map((item, i) => (
                      <div key={i} className="px-4 py-3 flex flex-col gap-1.5">
                        {item.item_name && (
                          <p className="text-sm font-medium text-foreground">{item.item_name}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {item.quantity} × {formatAmount(item.rate)}
                          </span>
                          <span className="text-sm font-semibold tabular-nums">{formatAmount(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex flex-col divide-y divide-border">
                {discValue > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Subtotal</span>
                    <span className="text-sm tabular-nums">{formatAmount(subtotal)}</span>
                  </div>
                )}
                {discValue > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      Discount{quotation.discount_type === 'percentage' ? ` (${quotation.discount_amount}%)` : ''}
                    </span>
                    <span className="text-sm tabular-nums text-destructive">-{formatAmount(discValue)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-base font-semibold tabular-nums">{formatAmount(total)}</span>
                </div>
              </div>
            </div>

            <SectionCard title="Details" rows={[
              { label: 'Notes', value: quotation.notes },
            ]} />

            {quotation.terms_and_conditions && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Terms & Conditions</h3>
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{quotation.terms_and_conditions}</p>
                </div>
              </div>
            )}

          </div>
        )}
        {activeTab === 'comments' && (
          <CommentsTab entityId={quotation.id} userMap={userMap} token={token} currentUser={currentUser} />
        )}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto">
            <ActivityTab entityId={quotation.id} userMap={userMap} token={token} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quotation form ───────────────────────────────────────────────────────────

function QuotationForm({ quotation, clients, users, leads = [], orders = [], token, currentUser, onSave, onClose }) {
  const isEdit = Boolean(quotation?.id)
  const [nextNumber, setNextNumber] = useState('')
  useEffect(() => {
    if (!isEdit) {
      fetch(`${API}/quotations/next-number`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setNextNumber(d.next || ''))
        .catch(() => {})
    }
  }, [isEdit, token])
  const draftKey = isEdit ? `draft_quotation_edit_${quotation.id}` : 'draft_quotation'

  function emptyItem() {
    return { item_name: '', description: '', quantity: '1', rate: '', amount: '0' }
  }

  function initialState() {
    const saved = localStorage.getItem(draftKey)
    if (saved) { try { return JSON.parse(saved) } catch {} }
    if (isEdit) {
      return {
        client_mode: 'select',
        client_id: quotation.client_id ? String(quotation.client_id) : '',
        manual_client_name: quotation.manual_client_name ?? '',
        manual_client_address: quotation.manual_client_address ?? '',
        manual_client_phone: quotation.manual_client_phone ?? '',
        manual_client_email: quotation.manual_client_email ?? '',
        lead_id: quotation.lead_id ? String(quotation.lead_id) : '',
        order_id: quotation.order_id ? String(quotation.order_id) : '',
        subject: quotation.subject ?? '',
        date: quotation.date ? quotation.date.split('T')[0] : new Date().toISOString().split('T')[0],
        tax_mode: quotation.tax_mode ?? 'none',
        show_tax_details: quotation.show_tax_details ?? false,
        hide_totals: quotation.hide_totals ?? false,
        discount_type: quotation.discount_type ?? 'fixed',
        discount_amount: quotation.discount_amount ?? '',
        notes: quotation.notes ?? '',
        terms_and_conditions: quotation.terms_and_conditions ?? '',
        items: quotation.items?.length > 0
          ? quotation.items.map(i => ({
              item_name: i.item_name ?? '',
              description: i.description ?? '',
              quantity: String(i.quantity ?? 1),
              rate: String(i.rate ?? ''),
              amount: String(i.amount ?? '0'),
            }))
          : [emptyItem()],
      }
    }
    return {
      client_mode: 'select',
      client_id: '', subject: '',
      manual_client_name: '', manual_client_address: '',
      manual_client_phone: '', manual_client_email: '',
      lead_id: '', order_id: '',
      date: new Date().toISOString().split('T')[0],
      tax_mode: 'none', show_tax_details: false, hide_totals: false,
      discount_type: 'fixed', discount_amount: '',
      notes: '', terms_and_conditions: '',
      items: [emptyItem()],
    }
  }

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [form, draftKey])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setItem(index, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      const item = { ...items[index], [field]: value }
      const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0
      const rate = parseFloat(field === 'rate' ? value : item.rate) || 0
      const amount = parseFloat(field === 'amount' ? value : item.amount) || 0
      if (field === 'quantity' || field === 'rate') {
        item.amount = String(qty * rate)
      } else if (field === 'amount') {
        if (qty > 0) item.rate = String(amount / qty)
        else if (rate > 0) item.quantity = String(amount / rate)
      }
      items[index] = item
      return { ...prev, items }
    })
  }

  function duplicateItem(index) {
    setForm(prev => {
      const items = [...prev.items]
      items.splice(index + 1, 0, { ...items[index] })
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(index) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const { subtotal, discValue, tax, total } = calcTotals(
    form.items, form.discount_type, form.discount_amount, form.tax_mode
  )

  async function handleSave() {
    if (form.client_mode === 'select' && !form.client_id) {
      setError('Client is required'); return
    }
    if (form.client_mode === 'manual' && !form.manual_client_name.trim()) {
      setError('Client name is required'); return
    }
    setSaving(true)
    setError('')
    try {
      const body = {
        ...(isEdit ? { id: quotation.id } : {}),
        client_id: form.client_mode === 'select' ? Number(form.client_id) : null,
        manual_client_name: form.client_mode === 'manual' ? form.manual_client_name : null,
        manual_client_address: form.client_mode === 'manual' ? form.manual_client_address : null,
        manual_client_phone: form.client_mode === 'manual' ? form.manual_client_phone : null,
        manual_client_email: form.client_mode === 'manual' ? form.manual_client_email : null,
        lead_id: form.lead_id ? Number(form.lead_id) : null,
        order_id: form.order_id ? Number(form.order_id) : null,
        subject: form.subject,
        date: form.date,
        tax_mode: form.tax_mode === 'none' ? null : form.tax_mode,
        show_tax_details: form.show_tax_details,
        hide_totals: form.hide_totals,
        discount_type: form.discount_type,
        discount_amount: parseFloat(form.discount_amount) || 0,
        notes: form.notes,
        terms_and_conditions: form.terms_and_conditions,
        created_by: currentUser?.id,
        items: form.items.map(i => ({
          item_name: i.item_name,
          description: i.description,
          quantity: parseFloat(i.quantity) || 0,
          rate: parseFloat(i.rate) || 0,
          amount: parseFloat(i.amount) || 0,
        })),
      }
      const res = await fetch(`${API}/quotations/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); setError(errData.error || 'Failed to save quotation'); return }
      localStorage.removeItem(draftKey)
      onSave()
    } catch {
      setError('Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {isEdit ? 'Edit Quotation' : 'New Quotation'}
            </h2>
            {isEdit
              ? <p className="text-xs text-muted-foreground mt-0.5">{quotation.quotation_id}</p>
              : nextNumber && <p className="text-xs text-muted-foreground mt-0.5">{nextNumber}</p>
            }
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

        {/* ── Basic Info ── */}
        <SectionLabel label="Basic Info" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Client<span className="text-destructive ml-0.5">*</span>
            </label>
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-xs">
              <button
                type="button"
                onClick={() => set('client_mode', 'select')}
                className={cn(
                  'px-2.5 py-0.5 rounded-full transition-colors',
                  form.client_mode === 'select'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Select
              </button>
              <button
                type="button"
                onClick={() => set('client_mode', 'manual')}
                className={cn(
                  'px-2.5 py-0.5 rounded-full transition-colors',
                  form.client_mode === 'manual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Enter manually
              </button>
            </div>
          </div>
          {form.client_mode === 'select' ? (
            <ClientCombobox clients={clients} value={form.client_id} onChange={v => set('client_id', v)} />
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                value={form.manual_client_name}
                onChange={e => set('manual_client_name', e.target.value)}
                placeholder="Name or company"
              />
              <Input
                value={form.manual_client_address}
                onChange={e => set('manual_client_address', e.target.value)}
                placeholder="Address"
              />
              <Input
                value={form.manual_client_phone}
                onChange={e => set('manual_client_phone', e.target.value)}
                placeholder="Phone number"
              />
              <Input
                value={form.manual_client_email}
                onChange={e => set('manual_client_email', e.target.value)}
                placeholder="Email address"
              />
            </div>
          )}
        </div>

        <Field label="Subject">
          <Input value={form.subject} onChange={e => set('subject', e.target.value)}
            placeholder="e.g. Printing & Design Services" />
        </Field>

        <Field label="Date">
          <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full max-w-full" />
        </Field>

        <Field label="Linked Lead">
          <LeadCombobox leads={leads} value={form.lead_id} onChange={v => set('lead_id', v)} />
        </Field>

        <Field label="Linked Order">
          <OrderCombobox orders={orders} value={form.order_id} onChange={v => set('order_id', v)} />
        </Field>

        {/* ── Line Items ── */}
        <SectionLabel label="Line Items" />

        {form.items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Item {i + 1}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => duplicateItem(i)} title="Duplicate item"
                  className="text-muted-foreground/50 hover:text-foreground transition-colors">
                  <Copy size={13} />
                </button>
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors">
                    <Minus size={13} />
                  </button>
                )}
              </div>
            </div>
            <Input value={item.item_name} onChange={e => setItem(i, 'item_name', e.target.value)}
              placeholder="Item name" />
            <textarea
              value={item.description}
              onChange={e => setItem(i, 'description', e.target.value)}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
              placeholder="Description (optional)"
              rows={4}
              className="w-full rounded-xl border border-transparent bg-input/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring resize-none overflow-hidden"
            />
            <div className="grid grid-cols-3 gap-2">
              <Field label="Qty">
                <Input type="number" min="0" value={item.quantity}
                  onChange={e => setItem(i, 'quantity', e.target.value)} placeholder="1" />
              </Field>
              <Field label="Rate (₹)">
                <Input type="number" min="0" value={item.rate}
                  onChange={e => setItem(i, 'rate', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Amount (₹)">
                <Input type="number" min="0" value={item.amount}
                  onChange={e => setItem(i, 'amount', e.target.value)} placeholder="0" />
              </Field>
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit">
          <Plus size={13} />
          Add item
        </button>

        {/* ── Financials ── */}
        <SectionLabel label="Financials" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount Type">
            <Select value={form.discount_type} onValueChange={v => set('discount_type', v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed (₹)</SelectItem>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Discount Amount">
            <Input type="number" min="0" value={form.discount_amount}
              onChange={e => set('discount_amount', e.target.value)}
              placeholder={form.discount_type === 'percentage' ? '0' : '0'} />
          </Field>
        </div>

        {/* Hide totals toggle */}
        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <div>
            <p className="text-sm font-medium text-foreground">Hide totals in PDF</p>
            <p className="text-xs text-muted-foreground">Subtotal and total will not be shown on the downloaded PDF</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.hide_totals}
            onClick={() => set('hide_totals', !form.hide_totals)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
              form.hide_totals ? 'bg-primary' : 'bg-input'
            )}
          >
            <span className={cn(
              'pointer-events-none inline-block size-4 rounded-full bg-background shadow ring-0 transition-transform',
              form.hide_totals ? 'translate-x-4' : 'translate-x-0'
            )} />
          </button>
        </label>

        {/* ── Terms ── */}
        <SectionLabel label="Notes & Terms" />

        <Field label="Terms & Conditions">
          <Textarea value={form.terms_and_conditions} onChange={e => set('terms_and_conditions', e.target.value)}
            placeholder="Terms and conditions…" rows={4} className="resize-none" />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Live total preview */}
      <div className="shrink-0 border-t border-border px-4 sm:px-6 py-3">
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {discValue > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm tabular-nums">{formatAmount(subtotal)}</span>
            </div>
          )}
          {discValue > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Discount</span>
              <span className="text-sm tabular-nums text-destructive">-{formatAmount(discValue)}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-base font-semibold tabular-nums">{formatAmount(total)}</span>
          </div>
        </div>
      </div>

      <SheetFooter className="border-t border-border px-4 sm:px-6 py-4 flex-row justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Quotation'}
        </Button>
      </SheetFooter>
    </>
  )
}

// ─── Main Quotations page ─────────────────────────────────────────────────────

function Quotations() {
  const { user } = useAuth()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const [quotations, setQuotations] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [leads, setLeads] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20) // null = show all

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('view')
  const [selected, setSelected] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchAll() {
    try {
      const [q, c, u, l, o] = await Promise.all([
        fetch(`${API}/quotations`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/clients`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/leads`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/orders`, { headers: authHeaders }).then(r => r.json()),
      ])
      setQuotations(Array.isArray(q) ? q.filter(x => !x.is_archived) : [])
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
      setLeads(Array.isArray(l) ? l.filter(x => !x.is_deleted) : [])
      setOrders(Array.isArray(o) ? o : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const filtered = useMemo(() => {
    let list = quotations
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(qt =>
        qt.quotation_id?.toLowerCase().includes(q) ||
        qt.subject?.toLowerCase().includes(q) ||
        clientMap[qt.client_id]?.company_name?.toLowerCase().includes(q) ||
        clientMap[qt.client_id]?.full_name?.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => b.id - a.id)
  }, [quotations, search, clientMap])

  useEffect(() => { setPage(1) }, [filtered])

  const paginated = useMemo(
    () => perPage === null ? filtered : filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  )

  async function handleDuplicate(quotation) {
    await fetch(`${API}/quotations/duplicate/${quotation.id}`, { method: 'POST', headers: authHeaders })
    setDrawerOpen(false)
    fetchAll()
  }

  async function handleArchive(quotation) {
    await fetch(`${API}/quotations/archive/${quotation.id}`, { method: 'POST', headers: authHeaders })
    setDrawerOpen(false)
    fetchAll()
  }

  async function handleDelete(quotation) {
    await fetch(`${API}/quotations/trash/${quotation.id}`, { method: 'POST', headers: authHeaders })
    setDrawerOpen(false)
    fetchAll()
  }

  function handleSaved() {
    setDrawerOpen(false)
    fetchAll()
  }

  const pendingOpenQuotationId = useRef(null)

  useEffect(() => {
    if (location.state?.openCreate) {
      setSelected(null)
      setDrawerMode('edit')
      setDrawerOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
    if (location.state?.openQuotationId) {
      const id = location.state.openQuotationId
      navigate(location.pathname, { replace: true, state: {} })
      const found = quotations.find(q => q.id === id)
      if (found) { setSelected(found); setDrawerMode('view'); setDrawerOpen(true) }
      else { pendingOpenQuotationId.current = id }
    }
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pendingOpenQuotationId.current && quotations.length > 0) {
      const found = quotations.find(q => q.id === pendingOpenQuotationId.current)
      if (found) { setSelected(found); setDrawerMode('view'); setDrawerOpen(true) }
      pendingOpenQuotationId.current = null
    }
  }, [quotations]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Header — mobile only; desktop header is in AppShell */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Quotations</h1>
        <Button size="sm" onClick={() => { setSelected(null); setDrawerMode('edit'); setDrawerOpen(true) }} className="gap-1.5">
          <Plus size={15} />
          New Quotation
        </Button>
      </div>

      {/* Search + Pagination controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-72 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotations…" className="pl-8" />
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {perPage !== null && filtered.length > perPage && (
              <>
                <button
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="flex items-center justify-center size-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {page} / {Math.ceil(filtered.length / perPage)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(filtered.length / perPage)}
                  className="flex items-center justify-center size-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <ChevronRight size={14} />
                </button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                  {perPage === null ? 'Show All' : `Show ${perPage}`}
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                {[20, 50, 100].map(n => (
                  <DropdownMenuItem key={n} onClick={() => { setPerPage(n); setPage(1) }}
                    className={cn('text-xs whitespace-nowrap', perPage === n && 'font-medium text-foreground')}>
                    Show {n}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => { setPerPage(null); setPage(1) }}
                  className={cn('text-xs whitespace-nowrap', perPage === null && 'font-medium text-foreground')}>
                  Show All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden rounded-2xl ring-1 ring-foreground/5 divide-y divide-border overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No quotations found.</p>
        ) : (
          paginated.map(qt => {
            const client = clientMap[qt.client_id]
            const { total } = calcTotals(qt.items || [], qt.discount_type, qt.discount_amount, qt.tax_mode)
            return (
              <div key={qt.id} className="flex items-stretch gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => { setSelected(qt); setDrawerMode('view'); setDrawerOpen(true) }}>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {client?.company_name || client?.full_name || qt.manual_client_name || '—'}
                  </p>
                  {qt.subject && (
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5 truncate">
                      {qt.subject}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono mt-1.5">
                    {fmtQuotationNumber(qt)}
                    {qt.date && <span className="font-sans"> &bull; {formatDate(qt.date)}</span>}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                  <p className="text-sm font-semibold text-foreground tabular-nums">{formatAmount(total)}</p>
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                        <DropdownMenuItem onClick={() => { setSelected(qt); setDrawerMode('edit'); setDrawerOpen(true) }}>
                          <Pencil size={13} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(qt)}>
                          <Copy size={13} className="mr-2" /> Duplicate
                        </DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          <DropdownMenuItem onClick={() => handleArchive(qt)}>
                            <Archive size={13} className="mr-2" /> Archive
                          </DropdownMenuItem>
                        )}
                        {user?.role === 'superadmin' && (
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(qt)}>
                            <Trash2 size={13} className="mr-2" /> Trash
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
      <div className="hidden lg:block rounded-2xl ring-1 ring-foreground/5 overflow-x-auto">
        <Table className="table-fixed min-w-[700px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground w-[12%]">Quotation Number</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[9%]">Date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[22%]">Client</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[27%]">Subject</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[12%]">Total</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[14%]">Created By</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-12">
                  No quotations found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(qt => {
                const client = clientMap[qt.client_id]
                const creator = userMap[qt.created_by]
                const { total } = calcTotals(qt.items || [], qt.discount_type, qt.discount_amount, qt.tax_mode)
                return (
                  <TableRow key={qt.id} className="cursor-pointer hover:bg-muted/30 align-middle"
                    onClick={() => { setSelected(qt); setDrawerMode('view'); setDrawerOpen(true) }}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-muted-foreground">{fmtQuotationNumber(qt)}</span>
                        <CopyButton value={fmtQuotationNumber(qt)} title="Copy Quotation Number" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(qt.date)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate">
                        {client?.company_name || client?.full_name || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate">{qt.subject || '—'}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatAmount(total)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{creator?.name || '—'}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal size={14} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                          <DropdownMenuItem onClick={() => { setSelected(qt); setDrawerMode('edit'); setDrawerOpen(true) }}>
                            <Pencil size={13} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(qt)}>
                            <Copy size={13} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <DropdownMenuItem onClick={() => handleArchive(qt)}>
                              <Archive size={13} className="mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          {user?.role === 'superadmin' && (
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(qt)}>
                              <Trash2 size={13} className="mr-2" />
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
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-[600px] flex flex-col p-0">
          {drawerOpen && drawerMode === 'view' && selected && (
            <QuotationView
              quotation={selected}
              clientMap={clientMap}
              userMap={userMap}
              onEdit={() => setDrawerMode('edit')}
              onClose={() => setDrawerOpen(false)}
              onDuplicate={() => handleDuplicate(selected)}
              onArchive={() => handleArchive(selected)}
              onDelete={() => handleDelete(selected)}
              token={token}
              currentUser={user}
            />
          )}
          {drawerOpen && drawerMode === 'edit' && (
            <QuotationForm
              quotation={selected}
              clients={clients.filter(c => !c.is_archived)}
              users={users}
              leads={leads}
              orders={orders}
              token={token}
              currentUser={user}
              onSave={handleSaved}
              onClose={selected ? () => setDrawerMode('view') : () => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Quotations
