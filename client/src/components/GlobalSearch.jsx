import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Users, FileText, CheckSquare, TrendingUp, MessageSquare } from 'lucide-react'

const API = '/api'

const TYPE_ICONS = {
  order: ShoppingBag,
  client: Users,
  quotation: FileText,
  quotation_item: FileText,
  task: CheckSquare,
  lead: TrendingUp,
  comment: MessageSquare,
}

function typeToStateKey(type) {
  if (type === 'order') return { path: '/orders', key: 'openOrderId' }
  if (type === 'task') return { path: '/tasks', key: 'openTaskId' }
  if (type === 'client') return { path: '/clients', key: 'openClientId' }
  if (type === 'quotation' || type === 'quotation_item') return { path: '/quotations', key: 'openQuotationId' }
  if (type === 'lead') return { path: '/leads', key: 'openLeadId' }
  return null
}

export function SearchBar({ token, className = '' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    fetch(`${API}/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setResults(data.results || [])
        setOpen(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    if (q.length < 2) { setResults([]); setOpen(false) }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }

  function handleSelect(item) {
    const nav = typeToStateKey(item.type)
    if (item.type === 'comment') {
      const map = { order: 'openOrderId', task: 'openTaskId', lead: 'openLeadId', quotation: 'openQuotationId' }
      const key = map[item.entity_type]
      navigate(`/${item.entity_type}s`, key ? { state: { [key]: item.entity_id } } : undefined)
    } else if (nav) {
      navigate(nav.path, { state: { [nav.key]: item.id } })
    }
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const hasResults = results.some(g => g.items.length > 0)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all">
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length) setOpen(true) }}
          placeholder="Search…"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {loading && <span className="text-[10px] text-muted-foreground shrink-0">…</span>}
      </div>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 min-w-[320px] bg-card border border-border rounded-xl shadow-lg z-50 max-h-[60vh] overflow-y-auto">
          {!hasResults && query.length >= 2 && !loading && (
            <p className="text-xs text-muted-foreground px-4 py-3">No results for "{query}"</p>
          )}
          {results.map(group => (
            <div key={group.section}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
                {group.section}
              </p>
              {group.items.map((item, i) => {
                const Icon = TYPE_ICONS[item.type] || FileText
                return (
                  <button
                    key={`${item.type}-${item.id}-${i}`}
                    onMouseDown={() => handleSelect(item)}
                    className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{item.label || '—'}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
