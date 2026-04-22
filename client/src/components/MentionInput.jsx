import { useState, useRef } from 'react'

// Renders comment text with @Name mentions highlighted
export function renderWithMentions(text, users) {
  if (!text || !users?.length) return text
  const escaped = users.map(u => u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`@(${escaped.join('|')})`, 'g')
  const parts = []
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      <span key={match.index} className="text-primary font-medium">{'@' + match[1]}</span>
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}

// Drop-in replacement for <input> with @mention popup
// Wraps itself in a relative flex-1 div — callers should not add flex-1 to className
export function MentionInput({ value, onChange, onKeyDown, placeholder, users = [], className }) {
  const [query, setQuery] = useState(null)   // null = closed, string = active query
  const [atIndex, setAtIndex] = useState(-1) // index of the triggering @ in value
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const filtered = query !== null
    ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function handleChange(e) {
    autoResize(e.target)
    const val = e.target.value
    const cursor = e.target.selectionStart
    onChange(e)
    // Active mention: @ followed by non-space chars up to cursor
    const before = val.slice(0, cursor)
    const match = before.match(/@([^\s]*)$/)
    if (match) {
      setQuery(match[1])
      setAtIndex(before.lastIndexOf('@'))
      setSelected(0)
    } else {
      setQuery(null)
      setAtIndex(-1)
    }
  }

  function pickUser(user) {
    const cursor = inputRef.current?.selectionStart ?? value.length
    const before = value.slice(0, atIndex)
    const after = value.slice(cursor)
    const inserted = '@' + user.name + ' '
    const newVal = before + inserted + after
    onChange({ target: { value: newVal } })
    setQuery(null)
    setAtIndex(-1)
    const pos = before.length + inserted.length
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos)
      inputRef.current?.focus()
    })
  }

  function handleKeyDown(e) {
    if (query !== null && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(i => Math.min(i + 1, filtered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(i => Math.max(i - 1, 0))
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && filtered[selected]) {
        e.preventDefault()
        pickUser(filtered[selected])
        return
      }
      if (e.key === 'Escape') {
        setQuery(null)
        setAtIndex(-1)
        return
      }
    }
    onKeyDown?.(e)
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-3xl border border-border focus-within:border-foreground/30 transition-colors">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className={className + ' [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20'}
        style={{ resize: 'none', overflow: 'hidden', maxHeight: '160px' }}
        onInput={e => { e.target.style.overflow = e.target.scrollHeight > 160 ? 'auto' : 'hidden' }}
      />
      {query !== null && filtered.length > 0 && (
        <div className="absolute bottom-full mb-1.5 left-0 w-48 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {filtered.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); pickUser(user) }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-left transition-colors ${
                i === selected ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                {user.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-foreground">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
