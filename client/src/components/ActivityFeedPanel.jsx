import { useState, useEffect } from 'react'
import { X, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { renderWithMentions } from '@/components/MentionInput'

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

export function ActivityFeedPanel({ token, onClose }) {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

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
                  className={cn(
                    'px-4 py-3 flex flex-col gap-1.5',
                    isMention && 'border-l-2 border-primary'
                  )}
                >
                  {/* Author + time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                        {item.author_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs font-medium text-foreground">{item.author_name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  {/* Entity context */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isMention && <AtSign size={9} className="text-primary shrink-0" />}
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      ENTITY_COLORS[item.entity_type] || 'bg-muted text-muted-foreground'
                    )}>
                      {ENTITY_LABELS[item.entity_type] || item.entity_type}
                    </span>
                    {item.entity_label && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]">
                        {item.entity_label}
                      </span>
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed">
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
