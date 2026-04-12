import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CheckCheck, Trash2, UserPlus, RefreshCw, FileText, Bell, Pencil, Link, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = '/api'

const TYPE_CONFIG = {
  assigned:              { icon: UserPlus,  color: 'text-blue-500',   label: 'Assigned' },
  status_changed:        { icon: RefreshCw, color: 'text-yellow-500', label: 'Status Update' },
  description_changed:   { icon: FileText,  color: 'text-purple-500', label: 'Description Updated' },
  title_changed:         { icon: Pencil,    color: 'text-cyan-500',   label: 'Title Changed' },
  linked_client_changed: { icon: Link,      color: 'text-emerald-500', label: 'Client Changed' },
  linked_order_changed:  { icon: Link,      color: 'text-emerald-500', label: 'Order Changed' },
  reminder:              { icon: Bell,      color: 'text-orange-500', label: 'Reminder' },
}

function formatRelativeTime(str) {
  if (!str) return ''
  const normalized = str.endsWith('Z') || str.includes('+') ? str : str + 'Z'
  const diff = Date.now() - new Date(normalized).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function NotificationsPanel({ token, userId, onClose, onUnreadChange }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const esRef = useRef(null)

  async function load() {
    try {
      const data = await fetch(`${API}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setItems(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [userId, token])

  // Listen for live notification pushes via the existing SSE stream
  useEffect(() => {
    if (!token) return
    const es = new EventSource(`${API}/comments/stream?token=${encodeURIComponent(token)}`)
    esRef.current = es

    es.addEventListener('notification', (e) => {
      try {
        const notif = JSON.parse(e.data)
        setItems(prev => {
          if (prev.some(n => n.id === notif.id)) return prev
          const newItem = {
            id: notif.id || Date.now(),
            message: notif.message,
            entity_type: 'task',
            entity_id: notif.task_id,
            notification_type: notif.type,
            sender_name: notif.sent_by_name,
            is_read: false,
            created_at: notif.sent_at || new Date().toISOString(),
          }
          const updated = [newItem, ...prev]
          onUnreadChange?.(updated.filter(n => !n.is_read).length)
          return updated
        })
      } catch {}
    })

    return () => { es.close(); esRef.current = null }
  }, [token])

  async function markAllRead() {
    try {
      await fetch(`${API}/notifications/mark-read/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(prev => prev.map(n => ({ ...n, is_read: true })))
      onUnreadChange?.(0)
    } catch {}
  }

  async function clearAll() {
    try {
      await fetch(`${API}/notifications/clear/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems([])
      onUnreadChange?.(0)
    } catch {}
  }

  const unread = items.filter(n => !n.is_read).length

  return (
    <div className="w-full md:w-80 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unread > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-semibold px-1">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              title="Mark all read"
              className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <CheckCheck size={14} />
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all"
              className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground p-4">Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-1.5 px-6 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">Task assignments and updates will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {items.map(item => {
              const cfg = TYPE_CONFIG[item.notification_type] || { icon: Bell, color: 'text-muted-foreground', label: 'Update' }
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  className={cn(
                    'px-4 py-3 flex gap-3',
                    !item.is_read && 'bg-muted/30'
                  )}
                >
                  <div className={cn('shrink-0 mt-0.5', cfg.color)}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-foreground leading-relaxed">{item.message}</p>
                      {!item.is_read && (
                        <span className="shrink-0 size-1.5 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(item.created_at)}</span>
                      {item.sender_name && (
                        <>
                          <span className="text-muted-foreground/40 text-[10px]">·</span>
                          <span className="text-[10px] text-muted-foreground">by {item.sender_name}</span>
                        </>
                      )}
                      {item.entity_type === 'task' && item.entity_id && (
                        <button
                          onClick={() => {
                            navigate('/tasks', { state: { openTaskId: item.entity_id } })
                            onClose?.()
                          }}
                          className="flex items-center gap-0.5 text-[10px] text-primary hover:underline ml-auto"
                        >
                          View task
                          <ExternalLink size={9} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
