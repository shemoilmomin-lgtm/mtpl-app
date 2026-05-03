import { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MentionInput, renderWithMentions } from '@/components/MentionInput'
import { Button } from '@/components/ui/button'
import {
  Paperclip, CornerDownRight, Reply, Pencil, Trash2, X,
} from 'lucide-react'

const API = '/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avatarColor(name) {
  const code = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
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
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ name, photoUrl }) {
  const initials = name?.[0]?.toUpperCase() || '?'
  if (photoUrl) {
    return (
      <div className="size-6 rounded-full shrink-0 overflow-hidden">
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className={cn(
      'size-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0',
      avatarColor(name)
    )}>
      {initials}
    </div>
  )
}

function AttachmentChip({ fileName, displayName }) {
  return (
    <a
      href={`${API}/attachments/download/${encodeURIComponent(fileName)}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground hover:bg-muted transition-colors w-fit"
    >
      <Paperclip size={11} className="shrink-0 text-muted-foreground" />
      {displayName}
    </a>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * CommentsPanel
 *
 * Props:
 *   entityType  — 'order' | 'task' | 'quotation' | 'client' | 'lead'
 *   entityId    — numeric id of the entity
 *   token       — JWT bearer token
 *   currentUser — { id, role, name }
 *   users       — array of all users (for mentions + avatars)
 */
export function CommentsPanel({ entityType, entityId, token, currentUser, users = [] }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)
  const [replyTo, setReplyTo] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)
  const mentionInputRef = useRef(null)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const userMap = useMemo(
    () => Object.fromEntries((users || []).map(u => [u.id, u])),
    [users]
  )

  // ── Permissions ────────────────────────────────────────────────────────────
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

  // ── API calls ──────────────────────────────────────────────────────────────
  async function load() {
    if (!entityId || entityId < 0) { setLoading(false); return }
    try {
      const data = await fetch(`${API}/comments/${entityType}/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setComments(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
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
        setComments(prev => prev.map(c =>
          c.id === id ? { ...c, message: updated.message, edited_at: updated.edited_at } : c
        ))
      }
    } catch {}
  }

  async function sendComment() {
    if (sendingRef.current) return
    if (!message.trim() && !pendingFile) return
    sendingRef.current = true
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
      if (!fullMessage.trim()) { sendingRef.current = false; setSending(false); return }
      const res = await fetch(`${API}/comments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          user_id: currentUser.id,
          message: fullMessage,
          parent_id: replyTo?.id ?? null,
        }),
      })
      if (res.ok) {
        setMessage('')
        mentionInputRef.current?.reset()
        setPendingFile(null)
        setReplyTo(null)
        load()
      }
    } catch {}
    sendingRef.current = false
    setSending(false)
  }

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { load() }, [entityId])

  useEffect(() => {
    if (!token || !entityId || entityId < 0) return
    const es = new EventSource(`${API}/comments/stream?token=${encodeURIComponent(token)}`)
    es.addEventListener('entity_comment', (e) => {
      try {
        const c = JSON.parse(e.data)
        if (c.entity_type === entityType && String(c.entity_id) === String(entityId)) {
          setComments(prev => prev.some(x => x.id === c.id) ? prev : [c, ...prev])
        }
      } catch {}
    })
    return () => es.close()
  }, [token, entityId])

  // ── Thread grouping ────────────────────────────────────────────────────────
  const threads = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_id)
    const replies = comments.filter(c => c.parent_id)
    return topLevel.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id),
    }))
  }, [comments])

  // ── CommentCard ────────────────────────────────────────────────────────────
  function CommentCard({ comment, isReply }) {
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
      <div className={cn(
        'rounded-xl border border-border p-3.5 flex flex-col gap-2',
        isReply && 'bg-muted/20'
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar name={author?.name} photoUrl={author?.photoUrl} />
            <span className="text-xs font-semibold text-foreground">{author?.name || 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
            {comment.edited_at && (
              <span className="text-[10px] text-muted-foreground/60">(edited)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply size={11} />
                Reply
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
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {text && (
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                {renderWithMentions(text, Object.values(userMap))}
              </p>
            )}
            {attachments.map((a, i) => (
              <AttachmentChip key={i} fileName={a.fileName} displayName={a.displayName} />
            ))}
          </>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Comment list */}
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
                      <div className="flex-1">
                        <CommentCard comment={reply} isReply={true} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Compose area */}
      <div className="shrink-0 border-t border-border px-6 py-4 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <span>
              Replying to{' '}
              <span className="font-medium text-foreground">
                {userMap[replyTo.user_id]?.name || 'Unknown'}
              </span>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground">
              <X size={12} />
            </button>
          </div>
        )}

        {pendingFile && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs w-fit">
            <Paperclip size={11} className="text-muted-foreground" />
            <span className="text-foreground">{pendingFile.name}</span>
            <button type="button" onClick={() => setPendingFile(null)} className="text-muted-foreground hover:text-foreground">
              <X size={11} />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); e.target.value = '' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            className="flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <Paperclip size={14} />
          </button>
          <MentionInput
            ref={mentionInputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                sendComment()
              }
            }}
            placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'}
            users={Object.values(userMap)}
            className="w-full bg-input/50 rounded-3xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
          />
          <Button
            size="sm"
            onClick={sendComment}
            disabled={sending || (!message.trim() && !pendingFile)}
          >
            {sending ? '…' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
