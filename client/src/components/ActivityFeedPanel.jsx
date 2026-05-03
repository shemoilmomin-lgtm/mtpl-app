import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { renderWithMentions } from '@/components/MentionInput'
import { UserAvatar } from '@/components/UserAvatar'

const API = '/api'

const ENTITY_COLORS = {
  order:     'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  task:      'bg-purple-500/10 text-purple-500 dark:text-purple-400',
  lead:      'bg-green-500/10 text-green-600 dark:text-green-400',
  quotation: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  client:    'bg-muted text-muted-foreground',
}

const ENTITY_LABELS = {
  order: 'Order', task: 'Task', client: 'Client', quotation: 'Quotation', lead: 'Lead',
}

function formatRelativeTime(str) {
  if (!str) return ''
  const diff = Date.now() - new Date(str).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function stripAttachments(msg) {
  return msg?.replace(/\[attachment:[^\]]+\]/g, '').trim() || ''
}

const ENTITY_OPEN_KEY = {
  order:     'openOrderId',
  task:      'openTaskId',
  lead:      'openLeadId',
  quotation: 'openQuotationId',
  client:    'openClientId',
}

export function ActivityFeedPanel({ token, onClose }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const esRef = useRef(null)

  function handleCommentClick(item) {
    const key = ENTITY_OPEN_KEY[item.entity_type]
    if (!key) return
    onClose()
    navigate(`/${item.entity_type}s`, { state: { [key]: item.entity_id } })
  }

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/comments/feed`, { headers }).then(r => r.json()),
      fetch(`${API}/users`, { headers }).then(r => r.json()),
    ])
      .then(([feed, userList]) => {
        setItems(Array.isArray(feed) ? feed : [])
        setUsers(Array.isArray(userList) ? userList : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return

    const es = new EventSource(`${API}/comments/stream?token=${encodeURIComponent(token)}`)
    esRef.current = es

    es.addEventListener('comment', (e) => {
      try {
        const comment = JSON.parse(e.data)
        setItems(prev => {
          // Avoid duplicates (e.g. if the user somehow sees their own comment pushed)
          if (prev.some(item => item.id === comment.id)) return prev
          return [comment, ...prev].slice(0, 50)
        })
      } catch {}
    })

    es.onerror = () => {
      // Browser will auto-reconnect; nothing to do
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [token])

  return (
    <div className="w-full md:w-80 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <p className="text-sm font-semibold text-foreground">Recent Comments</p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground p-4">Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-1.5 px-6 text-center">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground">Mentions and comments on your assigned orders and tasks will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {items.map(item => {
              const isMention = item.feed_reason === 'mention'
              const text = stripAttachments(item.message)
              return (
                <div
                  key={item.id}
                  onClick={() => handleCommentClick(item)}
                  className={cn(
                    'px-4 py-3 flex flex-col gap-1.5 cursor-pointer hover:bg-muted/40 transition-colors',
                    isMention && 'border-l-2 border-primary'
                  )}
                >
                  {/* Author + time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <UserAvatar name={item.author_name} photoUrl={item.author_photo_url} size="size-5" textSize="text-[10px]" />
                      <span className="text-[13px] font-medium text-foreground">{item.author_name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  {/* Entity context */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isMention && <AtSign size={9} className="text-primary shrink-0" />}
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                      ENTITY_COLORS[item.entity_type] || 'bg-muted text-muted-foreground'
                    )}>
                      {ENTITY_LABELS[item.entity_type] || item.entity_type}
                    </span>
                    {item.entity_label && (
                      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[130px]">
                        {item.entity_label}
                      </span>
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="text-[13px] text-foreground/80 line-clamp-3 leading-relaxed">
                    {renderWithMentions(text, users)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
