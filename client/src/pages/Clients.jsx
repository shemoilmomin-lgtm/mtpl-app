import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetFooter,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, Search, MoreHorizontal, Copy, Check, X, Pencil, Archive, Trash2,
  Phone, Mail, MapPin, AlignLeft, MessageSquare, Activity,
  Paperclip, Reply, CornerDownRight, Building2, ChevronLeft, ChevronRight,
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
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, rows }) {
  const validRows = rows.filter(r => r.value)
  if (validRows.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {validRows.map(({ label, value }, i) => (
          <div
            key={i}
            className={cn('flex items-start gap-3 px-4 py-2.5', i < validRows.length - 1 && 'border-b border-border')}
          >
            <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
            <span className="text-sm text-foreground flex-1 break-words">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Form field wrapper ───────────────────────────────────────────────────────

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

function AttachmentChip({ fileName, displayName, token }) {
  async function handleDownload() {
    try {
      const res = await fetch(`${API}/attachments/download/${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      if (res.url) window.open(res.url, '_blank')
    } catch {}
  }
  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-fit"
    >
      <Paperclip size={11} className="shrink-0 text-muted-foreground" />
      {displayName}
    </button>
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

  async function load() {
    try {
      const data = await fetch(`${API}/comments/client/${entityId}`, {
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
        if (c.entity_type === 'client' && String(c.entity_id) === String(entityId)) {
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
          entity_type: 'client', entity_id: entityId,
          user_id: currentUser.id, message: fullMessage,
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
            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
              {author?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs font-semibold text-foreground">{author?.name || 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
          </div>
          {!isReply && (
            <button
              type="button"
              onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply size={11} />Reply
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
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

// ─── Activity tab ─────────────────────────────────────────────────────────────

function ActivityTab({ entityId, userMap, token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/activity/client/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setLogs(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [entityId])

  return (
    <div className="px-6 py-5 flex flex-col gap-0">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        logs.map((log, i) => {
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
      )}
    </div>
  )
}

// ─── Client view ──────────────────────────────────────────────────────────────

function ClientView({ client, users, onEdit, onClose, onArchive, onDelete, token, currentUser }) {
  const [activeTab, setActiveTab] = useState('details')
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const isExecutive = currentUser?.role === 'executive'
  const TABS = [
    { id: 'details',  label: 'Details',  Icon: AlignLeft    },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
    ...(!isExecutive ? [{ id: 'activity', label: 'Activity', Icon: Activity }] : []),
  ]

  const contacts = [
    { label: 'Primary',   name: client.contact_1_name, no: client.contact_1_no },
    { label: 'Contact 2', name: client.contact_2_name, no: client.contact_2_no },
    { label: 'Contact 3', name: client.contact_3_name, no: client.contact_3_no },
    { label: 'Contact 4', name: client.contact_4_name, no: client.contact_4_no },
  ].filter(c => c.name || c.no)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 border-b border-border">

        {/* Top strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="font-mono text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
              {client.client_id}
            </span>
            <CopyButton value={client.client_id} title="Copy Client ID" />
            <span className="text-muted-foreground/30 text-xs shrink-0">·</span>
            <span className="text-xs text-muted-foreground truncate">Added {formatDate(client.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>

        {/* Name + actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground leading-tight">
              {client.full_name || '—'}
            </h2>
            {client.company_name && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 size={12} className="shrink-0" />
                {client.company_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 text-[14px]">
              <Pencil className="size-[13px]" />
              Edit
            </Button>
            {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm">
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                  <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
                  {currentUser?.role === 'superadmin' && (
                    <DropdownMenuItem variant="destructive" onClick={onDelete}>Trash</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-border/60 px-2">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                activeTab === id
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' && (
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-5">

            {/* Quick contact strip */}
            {(client.contact_1_no || client.email) && (
              <div className="flex flex-wrap gap-2">
                {client.contact_1_no && (
                  <a href={`tel:${client.contact_1_no}`}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors">
                    <Phone size={11} className="text-muted-foreground" />
                    {client.contact_1_no}
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors">
                    <Mail size={11} className="text-muted-foreground" />
                    {client.email}
                  </a>
                )}
              </div>
            )}

            {/* Contacts */}
            {contacts.length > 0 && (
              <SectionCard
                title="Contacts"
                rows={contacts.map(c => ({
                  label: c.label,
                  value: [c.name, c.no].filter(Boolean).join(' · '),
                }))}
              />
            )}

            {/* Accountant */}
            {(client.accountant_name || client.accountant_no) && (
              <SectionCard
                title="Accountant"
                rows={[{
                  label: 'Accountant',
                  value: [client.accountant_name, client.accountant_no].filter(Boolean).join(' · '),
                }]}
              />
            )}

            {/* Business details */}
            <SectionCard
              title="Business Details"
              rows={[
                { label: 'GST No.', value: client.gst_number },
                { label: 'Address', value: client.address },
              ]}
            />

          </div>
        )}
        {activeTab === 'comments' && (
          <CommentsTab
            entityId={client.id}
            userMap={userMap}
            token={token}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto">
            <ActivityTab entityId={client.id} userMap={userMap} token={token} />
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Client form ──────────────────────────────────────────────────────────────

function ClientForm({ client, token, onSave, onClose }) {
  const isEdit = Boolean(client?.id)
  const draftKey = isEdit ? `draft_client_edit_${client.id}` : 'draft_client'

  function initialState() {
    const saved = localStorage.getItem(draftKey)
    if (saved) { try { return JSON.parse(saved) } catch {} }
    if (isEdit) {
      return {
        full_name: client.full_name ?? '',
        company_name: client.company_name ?? '',
        gst_number: client.gst_number ?? '',
        email: client.email ?? '',
        address: client.address ?? '',
        contact_1_name: client.contact_1_name ?? '',
        contact_1_no: client.contact_1_no ?? '',
        contact_2_name: client.contact_2_name ?? '',
        contact_2_no: client.contact_2_no ?? '',
        contact_3_name: client.contact_3_name ?? '',
        contact_3_no: client.contact_3_no ?? '',
        contact_4_name: client.contact_4_name ?? '',
        contact_4_no: client.contact_4_no ?? '',
        accountant_name: client.accountant_name ?? '',
        accountant_no: client.accountant_no ?? '',
      }
    }
    return {
      full_name: '', company_name: '', gst_number: '', email: '', address: '',
      contact_1_name: '', contact_1_no: '',
      contact_2_name: '', contact_2_no: '',
      contact_3_name: '', contact_3_no: '',
      contact_4_name: '', contact_4_no: '',
      accountant_name: '', accountant_no: '',
    }
  }

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Start with however many contacts already have data (min 1)
  const existingCount = isEdit
    ? [4, 3, 2, 1].find(n => client[`contact_${n}_name`] || client[`contact_${n}_no`]) ?? 1
    : 1
  const [visibleContacts, setVisibleContacts] = useState(existingCount)

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [form, draftKey])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Full name is required'); return }
    setSaving(true)
    setError('')
    try {
      const body = { ...(isEdit ? { id: client.id } : {}), ...form }
      const res = await fetch(`${API}/clients/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { setError('Failed to save client'); return }
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
      {/* Form header */}
      <div className="shrink-0 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {isEdit ? 'Edit Client' : 'New Client'}
            </h2>
            {isEdit && (
              <p className="text-xs text-muted-foreground mt-0.5">{client.client_id}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

        {/* ── Basic Info ── */}
        <SectionLabel label="Basic Info" />

        <Field label="Full Name" required>
          <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Full name" />
        </Field>

        <Field label="Company Name">
          <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Company name" />
        </Field>

        {/* ── Contact Details ── */}
        <SectionLabel label="Contact Details" />

        {[1, 2, 3, 4].slice(0, visibleContacts).map(n => (
          <div key={n} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={n === 1 ? 'Primary Contact Name' : `Contact ${n} Name`}>
              <Input
                value={form[`contact_${n}_name`]}
                onChange={e => set(`contact_${n}_name`, e.target.value)}
                placeholder="Name"
              />
            </Field>
            <Field label={n === 1 ? 'Primary Contact No.' : `Contact ${n} No.`}>
              <Input
                value={form[`contact_${n}_no`]}
                onChange={e => set(`contact_${n}_no`, e.target.value)}
                placeholder="Phone"
              />
            </Field>
          </div>
        ))}

        {visibleContacts < 4 && (
          <button
            type="button"
            onClick={() => setVisibleContacts(v => v + 1)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <Plus size={13} />
            Add contact
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Accountant Name">
            <Input value={form.accountant_name} onChange={e => set('accountant_name', e.target.value)} placeholder="Name" />
          </Field>
          <Field label="Accountant No.">
            <Input value={form.accountant_no} onChange={e => set('accountant_no', e.target.value)} placeholder="Phone" />
          </Field>
        </div>

        {/* ── Business Details ── */}
        <SectionLabel label="Business Details" />

        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        </Field>

        <Field label="GST Number">
          <Input value={form.gst_number} onChange={e => set('gst_number', e.target.value)} placeholder="GST number" />
        </Field>

        <Field label="Address">
          <Textarea
            value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Full address…"
            rows={3}
            className="resize-none"
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <SheetFooter className="border-t border-border px-4 sm:px-6 py-4 flex-row justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Client'}
        </Button>
      </SheetFooter>
    </>
  )
}

// ─── Main Clients page ────────────────────────────────────────────────────────

function Clients() {
  const { user } = useAuth()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('view')
  const [selectedClient, setSelectedClient] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchAll() {
    try {
      const [c, u] = await Promise.all([
        fetch(`${API}/clients`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`,   { headers: authHeaders }).then(r => r.json()),
      ])
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const filtered = useMemo(() => {
    let list = clients.filter(c => !c.is_archived)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.company_name?.toLowerCase().includes(q) ||
        c.client_id?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.contact_1_no?.includes(q)
      )
    }
    return [...list].sort((a, b) => (b.client_id || '').localeCompare(a.client_id || ''))
  }, [clients, search])

  useEffect(() => { setPage(1) }, [filtered])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  )

  function openView(client) {
    setSelectedClient(client)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  function openCreate() {
    setSelectedClient(null)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleArchive(client) {
    await fetch(`${API}/clients/archive/${client.id}`, {
      method: 'POST',
      headers: authHeaders,
    })
    setDrawerOpen(false)
    fetchAll()
  }

  async function handleDelete(client) {
    await fetch(`${API}/clients/trash/${client.id}`, {
      method: 'POST',
      headers: authHeaders,
    })
    setDrawerOpen(false)
    fetchAll()
  }

  function handleSaved() {
    setDrawerOpen(false)
    fetchAll()
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Header — mobile only; desktop header is in AppShell */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Clients</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus size={15} />
          New Client
        </Button>
      </div>

      {/* Search + Pagination controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-72 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" className="pl-8" />
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {filtered.length > perPage && (
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
            <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1) }}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
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
          <p className="text-center text-muted-foreground text-sm py-12">No clients found.</p>
        ) : (
          paginated.map(client => (
            <div key={client.id} className="flex items-stretch gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openView(client)}>
                <p className="text-sm font-semibold text-foreground truncate">{client.full_name || '—'}</p>
                {client.company_name && (
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5 truncate">
                    {client.company_name}
                  </p>
                )}
                {client.contact_1_no && (
                  <p className="text-xs text-muted-foreground mt-1.5">{client.contact_1_no}</p>
                )}
              </div>
              <div onClick={e => e.stopPropagation()} className="flex items-center shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm"><MoreHorizontal size={16} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                    <DropdownMenuItem onClick={() => { setSelectedClient(client); setDrawerMode('edit'); setDrawerOpen(true) }}>
                      <Pencil size={13} /> Edit
                    </DropdownMenuItem>
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <DropdownMenuItem onClick={() => handleArchive(client)}>
                        <Archive size={13} /> Archive
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'superadmin' && (
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(client)}>
                        <Trash2 size={13} /> Trash
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl ring-1 ring-foreground/5 overflow-x-auto">
        <Table className="table-fixed min-w-[600px]">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground w-[26%]">Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[26%]">Company</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[21%]">Phone</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-[23%]">Email</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-12">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(client => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/30 align-middle"
                  onClick={() => openView(client)}
                >
                  <TableCell>
                    <p className="text-sm font-medium text-foreground truncate">{client.full_name || '—'}</p>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-muted-foreground truncate">{client.company_name || '—'}</p>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {client.contact_1_no || '—'}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground truncate">
                    {client.email || '—'}
                  </TableCell>

                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                        <DropdownMenuItem onClick={() => { setSelectedClient(client); setDrawerMode('edit'); setDrawerOpen(true) }}>
                          <Pencil size={13} />
                          Edit
                        </DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          <DropdownMenuItem onClick={() => handleArchive(client)}>
                            <Archive size={13} />
                            Archive
                          </DropdownMenuItem>
                        )}
                        {user?.role === 'superadmin' && (
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(client)}>
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
        <SheetContent
          side="right"
          showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-[560px] flex flex-col p-0"
        >
          {drawerOpen && drawerMode === 'view' && selectedClient && (
            <ClientView
              client={selectedClient}
              users={users}
              onEdit={() => setDrawerMode('edit')}
              onClose={() => setDrawerOpen(false)}
              onArchive={() => handleArchive(selectedClient)}
              onDelete={() => handleDelete(selectedClient)}
              token={token}
              currentUser={user}
            />
          )}
          {drawerOpen && drawerMode === 'edit' && (
            <ClientForm
              client={selectedClient}
              token={token}
              onSave={handleSaved}
              onClose={selectedClient ? () => setDrawerMode('view') : () => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Clients
