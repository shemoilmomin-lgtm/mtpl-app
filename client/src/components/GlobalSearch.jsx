import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ShoppingBag, Users, FileText, CheckSquare, TrendingUp, MessageSquare, Package } from 'lucide-react'

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

const TYPE_PATHS = {
  order: '/orders',
  client: '/clients',
  quotation: '/quotations',
  quotation_item: '/quotations',
  task: '/tasks',
  lead: '/leads',
  comment: null, // handled per entity_type
}

function typeToStateKey(type) {
  if (type === 'order') return 'openOrderId'
  if (type === 'task') return 'openTaskId'
  if (type === 'client') return 'openClientId'
  if (type === 'quotation' || type === 'quotation_item') return 'openQuotationId'
  if (type === 'lead') return 'openLeadId'
  return null
}

export function GlobalSearch({ token, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = useCallback((q) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    fetch(`${API}/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setResults(data.results || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }

  function handleSelect(type, id, entityType, entityId) {
    let path = TYPE_PATHS[type]
    let stateKey = typeToStateKey(type)

    if (type === 'comment') {
      path = `/${entityType}s`
      const commentEntityKey = entityType === 'order' ? 'openOrderId'
        : entityType === 'task' ? 'openTaskId'
        : entityType === 'lead' ? 'openLeadId'
        : entityType === 'quotation' ? 'openQuotationId'
        : null
      if (commentEntityKey) {
        navigate(path, { state: { [commentEntityKey]: entityId } })
      } else {
        navigate(path)
      }
    } else if (stateKey) {
      navigate(path, { state: { [stateKey]: id } })
    } else {
      navigate(path)
    }

    onClose?.()
  }

  const hasResults = results.length > 0

  return (
    <div className="flex flex-col w-full h-full">
      {/* Input row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Search orders, tasks, clients, quotations…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-muted-foreground px-4 py-3">Searching…</p>
        )}
        {!loading && query.length >= 2 && !hasResults && (
          <p className="text-xs text-muted-foreground px-4 py-3">No results for "{query}"</p>
        )}
        {!loading && !query && (
          <p className="text-xs text-muted-foreground px-4 py-3">Type at least 2 characters to search</p>
        )}
        {hasResults && results.map(group => (
          <div key={group.section}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-1">
              {group.section}
            </p>
            {group.items.map((item, i) => {
              const Icon = TYPE_ICONS[item.type] || Package
              return (
                <button
                  key={`${item.type}-${item.id}-${i}`}
                  onClick={() => handleSelect(item.type, item.id, item.entity_type, item.entity_id)}
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
    </div>
  )
}
