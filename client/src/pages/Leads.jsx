import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  AlignLeft, MessageSquare, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronDown, CornerDownRight, Paperclip, Reply,
  ArrowRightLeft, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MentionInput, renderWithMentions } from '@/components/MentionInput'

const API = 'http://localhost:3001/api'

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

// ─── Constants ────────────────────────────────────────────────────────────────

const LEAD_STATUSES = ['open', 'won', 'lost']

const LEAD_STATUS_CONFIG = {
  open: { label: 'Open', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  won:  { label: 'Won',  badge: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  lost: { label: 'Lost', badge: 'bg-red-500/10 text-red-500 dark:text-red-400' },
}

const TAB_LABELS = { all: 'All Leads', open: 'Open', won: 'Won', lost: 'Lost' }

const JOB_TYPES = [
  'Brochure', 'Digital Brochure', 'Designing', 'Visiting Cards', 'Letterheads',
  'Envelopes', 'Receipt', 'Agreement File', 'Paper Bag', 'Handbill/Leaflet',
  'Large Format Print', 'Calendar', 'Sale Display', 'Coffee Table', 'Stickers',
  'Domain/Hosting/IT Services', 'Company Profile', 'Wall Branding', 'Other',
]

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

function UserAvatar({ name, size = 6 }) {
  return (
    <div className={`size-${size} rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function AttachmentChip({ fileName, displayName }) {
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

// ─── Lead activity tab ────────────────────────────────────────────────────────

function LeadActivityTab({ lead, userMap, token, currentUser }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)

  async function load() {
    try {
      const data = await fetch(`${API}/comments/lead/${lead.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setComments(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [lead.id])

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
          entity_type: 'lead',
          entity_id: lead.id,
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
          <p className="text-sm text-muted-foreground">No activity yet.</p>
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

// ─── Lead view ────────────────────────────────────────────────────────────────

function LeadView({ lead, clientMap, orderMap, userMap, currentUser, onEdit, onClose, onArchive, onDelete, onStatusChange, token, onReload }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [converting, setConverting] = useState(null)
  const [localLead, setLocalLead] = useState(lead)

  useEffect(() => { setLocalLead(lead) }, [lead])

  const client = clientMap[localLead.client_id]
  const displayName = localLead.client_manual_name || client?.company_name || client?.full_name || '—'
  const canArchive = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const canTrash = currentUser?.role === 'superadmin'

  const isExecutive = currentUser?.role === 'executive'
  const tabs = [
    { key: 'details', label: 'Details', icon: AlignLeft },
    ...(!isExecutive ? [{ key: 'activity', label: 'Activity', icon: MessageSquare }] : []),
  ]

  async function reloadLead() {
    try {
      const data = await fetch(`${API}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      const updated = Array.isArray(data) ? data.find(l => l.id === localLead.id) : null
      if (updated) setLocalLead(updated)
    } catch {}
    if (onReload) onReload()
  }

  async function handleConvert(convertTo) {
    setConverting(convertTo)
    try {
      await fetch(`${API}/leads/convert/${localLead.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ convertTo: [convertTo] }),
      })
      await reloadLead()
    } catch {}
    setConverting(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="font-mono text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">{localLead.lead_id}</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(localLead.date || localLead.created_at)}</span>
            <span className="text-muted-foreground/30 text-xs hidden sm:inline shrink-0">·</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">by {userMap[localLead.entered_by]?.name || '—'}</span>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>

        {/* Title + actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground leading-tight">{displayName}</h2>
            {localLead.job_type && (
              <p className="text-sm text-muted-foreground mt-0.5">{localLead.job_type}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <LeadStatusSelect lead={localLead} onStatusChange={(l, s) => onStatusChange(s)} />
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

            {/* Client */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Client</span>
              <span className="text-sm text-foreground">{displayName}</span>
              {localLead.client_manual_contact && (
                <span className="text-xs text-muted-foreground">{localLead.client_manual_contact}</span>
              )}
            </div>

            {/* Job Type */}
            {localLead.job_type && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Job Type</span>
                <span className="text-sm text-foreground">{localLead.job_type}</span>
              </div>
            )}

            {/* Quantity */}
            {localLead.quantity && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Quantity</span>
                <span className="text-sm text-foreground">{localLead.quantity}</span>
              </div>
            )}

            {/* Specifications */}
            {localLead.specifications && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Specifications</span>
                <span className="text-sm text-foreground whitespace-pre-wrap">{localLead.specifications}</span>
              </div>
            )}

            {/* Delivery Expected */}
            {localLead.delivery_expected && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Delivery Expected</span>
                <span className="text-sm text-foreground">{formatDate(localLead.delivery_expected)}</span>
              </div>
            )}

            {/* Entered By */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Entered By</span>
              <span className="text-sm text-foreground">{userMap[localLead.entered_by]?.name || '—'}</span>
            </div>

            {/* Created */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Created</span>
              <span className="text-sm text-foreground">{formatDateTime(localLead.created_at)}</span>
            </div>

            {/* Conversion section — only when not lost */}
            {localLead.status !== 'lost' && (
              <>
                <SectionLabel label="Conversions" />
                <div className="flex flex-col gap-2">
                  {/* Convert to Client */}
                  <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">Client</span>
                      {localLead.converted_client_id ? (
                        <span className="text-[11px] text-green-600 dark:text-green-400">
                          {clientMap[localLead.converted_client_id]?.company_name || clientMap[localLead.converted_client_id]?.full_name || 'Converted'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Not yet converted</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {localLead.converted_client_id && (
                        <Button size="sm" variant="ghost" onClick={() => navigate('/clients')} className="text-xs h-7 px-2">
                          <ExternalLink size={12} />
                          View
                        </Button>
                      )}
                      <Button
                        size="sm" variant="outline"
                        disabled={!!localLead.converted_client_id || converting === 'client'}
                        onClick={() => handleConvert('client')}
                        className="text-xs h-7"
                      >
                        <ArrowRightLeft size={12} />
                        {converting === 'client' ? 'Converting…' : 'Convert'}
                      </Button>
                    </div>
                  </div>

                  {/* Convert to Order */}
                  <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">Order</span>
                      {localLead.order_id ? (
                        <span className="text-[11px] text-green-600 dark:text-green-400">
                          {orderMap[localLead.order_id]?.job_id || 'Converted'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Not yet converted</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {localLead.order_id && (
                        <Button size="sm" variant="ghost" onClick={() => navigate('/orders/all')} className="text-xs h-7 px-2">
                          <ExternalLink size={12} />
                          View
                        </Button>
                      )}
                      <Button
                        size="sm" variant="outline"
                        disabled={!!localLead.order_id || converting === 'order'}
                        onClick={() => handleConvert('order')}
                        className="text-xs h-7"
                      >
                        <ArrowRightLeft size={12} />
                        {converting === 'order' ? 'Converting…' : 'Convert'}
                      </Button>
                    </div>
                  </div>


                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <LeadActivityTab lead={localLead} userMap={userMap} token={token} currentUser={currentUser} />
        )}
      </div>
    </div>
  )
}

// ─── Lead status select pill ──────────────────────────────────────────────────

function LeadStatusSelect({ lead, onStatusChange }) {
  const cfg = LEAD_STATUS_CONFIG[lead.status]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" onClick={e => e.stopPropagation()} className="rounded-full focus:outline-none">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap',
            cfg?.badge || 'bg-muted text-muted-foreground'
          )}>
            {cfg?.label || lead.status}
            <ChevronDown size={10} className="shrink-0 opacity-60" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={e => e.stopPropagation()} className="[&::before]:hidden backdrop-blur-sm bg-popover/65">
        {LEAD_STATUSES.map(s => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(lead, s)}>
            <span className={cn('size-2 rounded-full shrink-0', {
              'bg-blue-500': s === 'open',
              'bg-green-500': s === 'won',
              'bg-muted-foreground': s === 'lost',
            })} />
            <span>{LEAD_STATUS_CONFIG[s].label}</span>
            {lead.status === s && <Check size={11} className="ml-auto shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Lead form ────────────────────────────────────────────────────────────────

function LeadForm({ lead, clients, users, token, currentUser, onSave, onClose }) {
  const isEdit = Boolean(lead?.id)
  const draftKey = isEdit ? `draft_lead_edit_${lead.id}` : 'draft_lead'

  function initialState() {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    if (isEdit) {
      const hasManual = lead.client_manual_name || lead.client_manual_contact
      return {
        client_mode: hasManual ? 'manual' : 'select',
        client_id: lead.client_id ? String(lead.client_id) : '',
        client_manual_name: lead.client_manual_name ?? '',
        client_manual_contact: lead.client_manual_contact ?? '',
        job_type: lead.job_type ?? '',
        quantity: lead.quantity ?? '',
        specifications: lead.specifications ?? '',
        delivery_expected: lead.delivery_expected ? lead.delivery_expected.slice(0, 10) : '',
        status: LEAD_STATUSES.includes(lead.status) ? lead.status : 'open',
      }
    }
    return {
      client_mode: 'select',
      client_id: '',
      client_manual_name: '',
      client_manual_contact: '',
      job_type: '',
      quantity: '',
      specifications: '',
      delivery_expected: '',
      status: 'open',
    }
  }

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const specRef = useRef(null)

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(form)) }, [form, draftKey])

  // Auto-resize textarea
  useEffect(() => {
    if (specRef.current) {
      specRef.current.style.height = 'auto'
      specRef.current.style.height = specRef.current.scrollHeight + 'px'
    }
  }, [form.specifications])

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSave() {
    if (form.client_mode === 'select' && !form.client_id) {
      setError('Please select a client or switch to manual entry')
      return
    }
    if (form.client_mode === 'manual' && !form.client_manual_name.trim()) {
      setError('Client name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = {
        ...(isEdit ? { id: lead.id } : {}),
        client_id: form.client_mode === 'select' && form.client_id ? Number(form.client_id) : null,
        client_manual_name: form.client_mode === 'manual' ? form.client_manual_name : null,
        client_manual_contact: form.client_mode === 'manual' ? form.client_manual_contact : null,
        job_type: form.job_type || null,
        quantity: form.quantity || null,
        specifications: form.specifications || null,
        delivery_expected: form.delivery_expected || null,
        status: LEAD_STATUSES.includes(form.status) ? form.status : 'open',
        entered_by: currentUser?.id,
      }
      const res = await fetch(`${API}/leads/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || `Failed to save lead (${res.status})`)
        return
      }
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
          <h2 className="text-sm font-semibold text-foreground">{isEdit ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

        <SectionLabel label="Client" />

        {/* Client mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-3xl bg-muted/50 w-fit">
          <button type="button"
            onClick={() => set('client_mode', 'select')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              form.client_mode === 'select'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}>
            Select Existing
          </button>
          <button type="button"
            onClick={() => set('client_mode', 'manual')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              form.client_mode === 'manual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}>
            Enter Manually
          </button>
        </div>

        {form.client_mode === 'select' ? (
          <Field label="Client">
            <ClientCombobox clients={clients} value={form.client_id} onChange={v => set('client_id', v)} />
          </Field>
        ) : (
          <>
            <Field label="Client Name" required>
              <Input
                value={form.client_manual_name}
                onChange={e => set('client_manual_name', e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field label="Contact Number">
              <Input
                value={form.client_manual_contact}
                onChange={e => set('client_manual_contact', e.target.value)}
                placeholder="Phone number"
              />
            </Field>
          </>
        )}

        <SectionLabel label="Lead Details" />

        <Field label="Job Type">
          <Select value={form.job_type} onValueChange={v => set('job_type', v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select job type…" /></SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map(jt => (
                <SelectItem key={jt} value={jt}>{jt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Quantity">
          <Input
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            placeholder="e.g. 500"
          />
        </Field>

        <Field label="Specifications">
          <textarea
            ref={specRef}
            value={form.specifications}
            onChange={e => set('specifications', e.target.value)}
            placeholder="Describe the job specifications…"
            rows={4}
            className="flex w-full rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring resize-none overflow-hidden"
          />
        </Field>

        <Field label="Delivery Expected">
          <Input
            type="date"
            value={form.delivery_expected}
            onChange={e => set('delivery_expected', e.target.value)}
          />
        </Field>

        <Field label="Status">
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{LEAD_STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <SheetFooter className="border-t border-border px-4 sm:px-6 py-4 flex-row justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Lead'}
        </Button>
      </SheetFooter>
    </>
  )
}

// ─── Main Leads page ──────────────────────────────────────────────────────────

function Leads({ tab = 'all' }) {
  const { user: currentUser } = useAuth()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const statusFilter = tab === 'all' ? 'all' : tab
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('view')
  const [selectedLead, setSelectedLead] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchAll() {
    try {
      const [l, c, u, o] = await Promise.all([
        fetch(`${API}/leads`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/clients`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/orders`, { headers: authHeaders }).then(r => r.json()),
      ])
      setLeads(Array.isArray(l) ? l.filter(x => !x.is_deleted && !x.is_archived) : [])
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
      setOrders(Array.isArray(o) ? o : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSearch(''); setPage(1) }, [tab])

  const clientMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])
  const orderMap = useMemo(() => Object.fromEntries(orders.map(o => [o.id, o])), [orders])

  const filtered = useMemo(() => {
    let list = [...leads]

    if (statusFilter !== 'all') {
      list = list.filter(l => l.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l => {
        const client = clientMap[l.client_id]
        return (
          l.lead_id?.toLowerCase().includes(q) ||
          l.client_manual_name?.toLowerCase().includes(q) ||
          l.job_type?.toLowerCase().includes(q) ||
          client?.full_name?.toLowerCase().includes(q) ||
          client?.company_name?.toLowerCase().includes(q)
        )
      })
    }

    return list
  }, [leads, statusFilter, search, clientMap])

  useEffect(() => { setPage(1) }, [filtered.length])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  )

  async function handleStatusChange(lead, newStatus) {
    await fetch(`${API}/leads/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        id: lead.id,
        client_id: lead.client_id || null,
        client_manual_name: lead.client_manual_name || null,
        client_manual_contact: lead.client_manual_contact || null,
        job_type: lead.job_type || null,
        quantity: lead.quantity || null,
        specifications: lead.specifications || null,
        delivery_expected: lead.delivery_expected || null,
        status: newStatus,
        entered_by: lead.entered_by,
      }),
    })
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l))
    if (selectedLead?.id === lead.id) setSelectedLead(prev => ({ ...prev, status: newStatus }))
  }

  async function handleArchive(lead) {
    await fetch(`${API}/leads/archive/${lead.id}`, { method: 'POST', headers: authHeaders })
    setLeads(prev => prev.filter(l => l.id !== lead.id))
    setDrawerOpen(false)
  }

  async function handleDelete(lead) {
    await fetch(`${API}/leads/trash/${lead.id}`, { method: 'POST', headers: authHeaders })
    setLeads(prev => prev.filter(l => l.id !== lead.id))
    setDrawerOpen(false)
  }

  function openView(lead) {
    setSelectedLead(lead)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  function getClientName(lead) {
    if (lead.client_manual_name) return lead.client_manual_name
    const c = clientMap[lead.client_id]
    return c?.company_name || c?.full_name || '—'
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      setSelectedLead(null)
      setDrawerMode('edit')
      setDrawerOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Header — mobile only; desktop header is in AppShell */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-xl font-semibold text-foreground">{TAB_LABELS[tab]}</h1>
        <Button size="sm" onClick={() => { setSelectedLead(null); setDrawerMode('edit'); setDrawerOpen(true) }} className="gap-1.5">
          <Plus size={15} />
          New Lead
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" className="pl-8 w-52" />
          </div>
        </div>

        {/* Pagination controls */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {filtered.length > perPage && (
              <>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="flex items-center justify-center size-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">{page} / {Math.ceil(filtered.length / perPage)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(filtered.length / perPage)}
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
          <p className="text-center text-muted-foreground text-sm py-12">No leads found.</p>
        ) : (
          paginated.map(lead => (
            <div key={lead.id} className="flex items-stretch gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openView(lead)}>
                <p className="text-sm font-semibold text-foreground truncate">{getClientName(lead)}</p>
                {lead.job_type && (
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5 truncate">
                    {lead.job_type}
                  </p>
                )}
                <p className="text-xs text-muted-foreground font-mono mt-1.5">
                  {lead.lead_id}
                  {(lead.date || lead.created_at) && (
                    <span className="font-sans"> &bull; {formatDate(lead.date || lead.created_at)}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                <div onClick={e => e.stopPropagation()}>
                  <LeadStatusSelect lead={lead} onStatusChange={handleStatusChange} />
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                      <DropdownMenuItem onClick={() => { setSelectedLead(lead); setDrawerMode('edit'); setDrawerOpen(true) }}>
                        <Pencil size={13} /> Edit
                      </DropdownMenuItem>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                        <DropdownMenuItem onClick={() => handleArchive(lead)}>
                          <Archive size={13} /> Archive
                        </DropdownMenuItem>
                      )}
                      {currentUser?.role === 'superadmin' && (
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(lead)}>
                          <Trash2 size={13} /> Trash
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl ring-1 ring-foreground/5 overflow-x-auto">
        <Table className="table-fixed min-w-[620px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground w-[10%]">Date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Client</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[18%]">Job Type</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[12%]">Delivery</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[10%]">Status</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-12">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(lead => (
                <TableRow
                  key={lead.id}
                  onClick={() => openView(lead)}
                  className="cursor-pointer hover:bg-muted/30 align-middle transition-colors"
                >
                  <TableCell className="text-sm text-muted-foreground">{formatDate(lead.date || lead.created_at)}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground truncate">{getClientName(lead)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground truncate">{lead.job_type || '—'}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.delivery_expected ? formatDate(lead.delivery_expected) : '—'}
                  </TableCell>
                  <TableCell>
                    <LeadStatusSelect lead={lead} onStatusChange={handleStatusChange} />
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                        <DropdownMenuItem onClick={() => { setSelectedLead(lead); setDrawerMode('edit'); setDrawerOpen(true) }}>
                          <Pencil size={13} />
                          Edit
                        </DropdownMenuItem>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
                          <DropdownMenuItem onClick={() => handleArchive(lead)}>
                            <Archive size={13} />
                            Archive
                          </DropdownMenuItem>
                        )}
                        {currentUser?.role === 'superadmin' && (
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(lead)}>
                            <Trash2 size={13} />
                            Trash
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Side drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-[560px] flex flex-col p-0">
          {drawerOpen && drawerMode === 'view' && selectedLead && (
            <LeadView
              lead={selectedLead}
              clientMap={clientMap}
              orderMap={orderMap}
              userMap={userMap}
              currentUser={currentUser}
              token={token}
              onEdit={() => setDrawerMode('edit')}
              onClose={() => setDrawerOpen(false)}
              onArchive={() => handleArchive(selectedLead)}
              onDelete={() => handleDelete(selectedLead)}
              onStatusChange={newStatus => handleStatusChange(selectedLead, newStatus)}
              onReload={fetchAll}
            />
          )}
          {drawerOpen && drawerMode === 'edit' && (
            <LeadForm
              lead={selectedLead}
              clients={clients}
              users={users}
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

export default Leads
