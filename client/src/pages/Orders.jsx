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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
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
  Plus, Search, MoreHorizontal, Copy, Archive, Trash2, Pencil, FileText,
  Check, ChevronsUpDown, Sun, Moon,
  X, ChevronDown, ChevronLeft, ChevronRight, AlignLeft, MessageSquare, Activity,
  Phone, Mail, Paperclip, Reply, CornerDownRight, SlidersHorizontal, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MentionInput, renderWithMentions } from '@/components/MentionInput'

const API = '/api'

const JOB_TYPES = [
  'Brochure', 'Digital Brochure', 'Designing', 'Visiting Cards', 'Letterheads',
  'Envelopes', 'Receipt', 'Agreement File', 'Paper Bag', 'Handbill/Leaflet',
  'Large Format Print', 'Calendar', 'Sale Display', 'Coffee Table', 'Stickers',
  'Domain/Hosting/IT Services', 'Company Profile', 'Wall Branding', 'Other',
]

const STATUSES = [
  'negotiation', 'quotation', 'proforma', 'designing', 'review',
  'corrections', 'pre-press', 'printing', 'tax invoice', 'invoice pending',
  'ready at office', 'out for delivery', 'waiting pickup', 'completed', 'long pending',
]

const STATUS_COLORS = {
  'negotiation':     'bg-muted text-muted-foreground',
  'quotation':       'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  'proforma':        'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  'designing':       'bg-purple-500/10 text-purple-500 dark:text-purple-400',
  'review':          'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'corrections':     'bg-orange-500/10 text-orange-500 dark:text-orange-400',
  'pre-press':       'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'printing':        'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'tax invoice':     'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'invoice pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
  'ready at office': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'out for delivery':'bg-sky-500/10 text-sky-500 dark:text-sky-400',
  'waiting pickup':  'bg-sky-500/10 text-sky-500 dark:text-sky-400',
  'completed':       'bg-green-500/10 text-green-600 dark:text-green-400',
  'long pending':    'bg-red-500/10 text-red-500 dark:text-red-400',
}

const STATUS_DOT_COLORS = {
  'negotiation':     'bg-muted-foreground',
  'quotation':       'bg-blue-400',
  'proforma':        'bg-blue-400',
  'designing':       'bg-purple-400',
  'review':          'bg-amber-400',
  'corrections':     'bg-orange-400',
  'pre-press':       'bg-cyan-400',
  'printing':        'bg-cyan-400',
  'tax invoice':     'bg-emerald-400',
  'invoice pending': 'bg-yellow-500',
  'ready at office': 'bg-green-400',
  'out for delivery':'bg-sky-400',
  'waiting pickup':  'bg-sky-400',
  'completed':       'bg-green-400',
  'long pending':    'bg-red-400',
}

const TAB_LABELS = {
  active: 'Active Orders',
  all: 'All Orders',
  completed: 'Completed',
  'long-pending': 'Long Pending',
}

function useToken() {
  return localStorage.getItem('mtpl_token')
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatAmount(n) {
  if (n == null || n === '') return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function formatRelativeTime(str) {
  if (!str) return ''
  const date = new Date(str)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(str)
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap',
      cls
    )}>
      {status || '—'}
    </span>
  )
}

// ─── Status selector — header variant (badge with chevron) ────────────────────

function StatusSelectHeader({ order, onStatusChange }) {
  const cls = STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-opacity hover:opacity-80',
            cls
          )}
        >
          {order.status || '—'}
          <ChevronDown size={10} className="opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 [&::before]:hidden backdrop-blur-sm bg-popover/65">
        {STATUSES.map(s => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(order, s)}>
            <span className={cn('size-2 rounded-full shrink-0', STATUS_DOT_COLORS[s])} />
            <span className="capitalize">{s}</span>
            {order.status === s && <Check size={11} className="ml-auto shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Inline status selector (list view) ──────────────────────────────────────

function StatusSelect({ order, onStatusChange }) {
  const cls = STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={e => e.stopPropagation()}
          className="rounded-full focus:outline-none"
        >
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap',
            cls
          )}>
            {order.status || '—'}
            <ChevronDown size={10} className="shrink-0 opacity-60" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={e => e.stopPropagation()} className="max-h-80 [&::before]:hidden backdrop-blur-sm bg-popover/65">
        {STATUSES.map(s => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(order, s)}>
            <span className={cn('size-2 rounded-full shrink-0', STATUS_DOT_COLORS[s])} />
            <span className="capitalize">{s}</span>
            {order.status === s && <Check size={11} className="ml-auto shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Copy job ID button ───────────────────────────────────────────────────────

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

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Stat card (view mode) ────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  const bg = {
    neutral: 'bg-card ring-1 ring-foreground/5',
    blue:    'bg-blue-500/10 ring-1 ring-blue-500/20',
    green:   'bg-emerald-500/10 ring-1 ring-emerald-500/20',
  }
  const color = {
    neutral: 'text-foreground',
    blue:    'text-blue-400',
    green:   'text-emerald-400',
  }

  return (
    <div className={cn('flex flex-col gap-1.5 rounded-2xl p-4', bg[accent] || bg.neutral)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-semibold tabular-nums', color[accent] || color.neutral)}>
        {formatAmount(value)}
      </span>
    </div>
  )
}

// ─── Section card with label-value rows ───────────────────────────────────────

function SectionCard({ title, rows }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {rows.map(({ label, value, mono }, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 px-4 py-2.5',
              i < rows.length - 1 && 'border-b border-border'
            )}
          >
            <span className="text-xs text-muted-foreground w-24 shrink-0">
              {label}
            </span>
            <span className={cn(
              'text-sm flex-1 break-words',
              mono ? 'font-mono text-foreground' : 'text-foreground',
              !value && 'text-muted-foreground'
            )}>
              {value || 'Not set'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Client combobox ──────────────────────────────────────────────────────────

function ClientCombobox({ clients, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = clients.find(c => c.id === value)

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
            placeholder="Search clients…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); setQuery('') }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted text-left',
                  value === c.id && 'text-primary'
                )}
              >
                <div className="min-w-0">
                  <p className="truncate">{c.full_name}</p>
                  {c.company_name && (
                    <p className="text-xs text-muted-foreground truncate">{c.company_name}</p>
                  )}
                </div>
                {value === c.id && <Check size={14} className="shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 text-left rounded-lg"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Quotation combobox ───────────────────────────────────────────────────────

function QuotationCombobox({ quotations, clients, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = quotations.find(q => q.id === value)

  const clientMap = useMemo(
    () => Object.fromEntries((clients || []).map(c => [c.id, c])),
    [clients]
  )

  function getTotal(q) {
    return (q.items || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  }

  function getClientLabel(q) {
    if (q.manual_client_name?.trim()) return q.manual_client_name.trim()
    const c = clientMap[q.client_id]
    return c?.company_name || c?.full_name || ''
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return quotations
    const q = query.toLowerCase()
    return quotations.filter(qt => {
      const clientLabel = getClientLabel(qt).toLowerCase()
      const total = getTotal(qt).toString()
      return (
        qt.quotation_id?.toLowerCase().includes(q) ||
        qt.subject?.toLowerCase().includes(q) ||
        qt.manual_client_name?.toLowerCase().includes(q) ||
        clientLabel.includes(q) ||
        total.includes(q)
      )
    })
  }, [quotations, query, clientMap])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-left transition-colors focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring"
        >
          <span className={cn('truncate flex-1', !selected && 'text-muted-foreground')}>
            {selected
              ? `${selected.quotation_id}${getClientLabel(selected) ? ` — ${getClientLabel(selected)}` : ''} — ₹${getTotal(selected).toLocaleString('en-IN')}`
              : 'Search quotation…'}
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
            placeholder="Search by ID, client, subject, amount…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">No results</p>
          ) : (
            filtered.map(q => {
              const clientLabel = getClientLabel(q)
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => { onChange(q); setOpen(false); setQuery('') }}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted gap-2',
                    value === q.id && 'text-primary'
                  )}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-mono text-xs">{q.quotation_id}</span>
                    {clientLabel && <span className="text-xs text-muted-foreground truncate">{clientLabel}</span>}
                    {q.subject && <span className="text-xs text-muted-foreground truncate">{q.subject}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ₹{getTotal(q).toLocaleString('en-IN')}
                  </span>
                </button>
              )
            })
          )}
        </div>
        {value && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 text-left rounded-lg"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Assignee multi-select ────────────────────────────────────────────────────

function AssigneeSelect({ users, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = users.filter(u => value.includes(u.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm text-left transition-colors focus:outline-none focus:ring-3 focus:ring-ring/30"
        >
          <span className={cn('truncate flex-1', selected.length === 0 && 'text-muted-foreground')}>
            {selected.length === 0 ? 'Select assignees' : selected.map(u => u.name).join(', ')}
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1 backdrop-blur-sm bg-popover/65" align="start">
        {users.map(u => (
          <button
            key={u.id}
            type="button"
            onClick={() =>
              onChange(value.includes(u.id) ? value.filter(id => id !== u.id) : [...value, u.id])
            }
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted/60 rounded-lg"
          >
            <div className={cn(
              'size-4 rounded flex items-center justify-center border shrink-0',
              value.includes(u.id) ? 'bg-primary border-primary' : 'border-border'
            )}>
              {value.includes(u.id) && <Check size={10} className="text-primary-foreground" />}
            </div>
            {u.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ─── Details tab ──────────────────────────────────────────────────────────────

function DetailsTab({ order, client, preparedByUser, quotationAmount, quotationRef, token, isAdmin }) {
  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-6">

      {/* Stat cards */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { label: 'Quotation', value: quotationAmount, cls: 'text-foreground' },
            { label: 'Advance',   value: order.advance,   cls: 'text-blue-400'    },
            { label: 'Balance',   value: order.balance,   cls: 'text-emerald-400' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex flex-col gap-1 p-4">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className={cn('text-xl font-semibold tabular-nums', cls)}>
                {formatAmount(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">

          <SectionCard
            title="Order Info"
            rows={[
              { label: 'Project',     value: order.project_name },
              { label: 'Date',        value: formatDate(order.date) },
              { label: 'Prepared By', value: preparedByUser?.name },
            ]}
          />

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Order Specifications
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              {[
                { label: 'Job Type', value: order.job_type },
                { label: 'Quantity', value: order.quantity },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 border-b border-border">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    {label}
                  </span>
                  <span className={cn('text-sm flex-1 break-words', !value && 'text-muted-foreground')}>
                    {value || 'Not set'}
                  </span>
                </div>
              ))}
              {order.specifications && (
                <div className="px-4 py-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{order.specifications}</p>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Remarks
              </h3>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{order.notes}</p>
              </div>
            </div>
          )}

        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">

          {client && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Client
              </h3>
              <div className="rounded-xl border border-border px-4 py-3 flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-foreground">
                  {client.company_name || client.full_name}
                </p>
                {client.company_name && client.full_name !== client.company_name && (
                  <p className="text-xs text-muted-foreground">{client.full_name}</p>
                )}
                {client.contact_1_no && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Phone size={12} className="shrink-0" />
                    <span>{client.contact_1_no}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">Invoice Details</p>
            <InlineInvoiceField
              label="Proforma"
              field="proforma_invoice_number"
              initialValue={order.proforma_invoice_number}
              orderId={order.id}
              token={token}
              canEdit={isAdmin}
            />
            <InlineInvoiceField
              label="Invoice No."
              field="invoice_number"
              initialValue={order.invoice_number}
              orderId={order.id}
              token={token}
              canEdit={isAdmin}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Delivery</span>
              <span className="text-sm text-foreground">{formatDate(order.delivery_expected)}</span>
            </div>
          </div>

          {(order.assignees?.length > 0) && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Assigned To
              </h3>
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm text-foreground">
                  {order.assignees.map(a => a.name).join(', ')}
                </p>
              </div>
            </div>
          )}

          {quotationRef && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                Quotation
              </h3>
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm font-mono text-foreground">{quotationRef}</p>
              </div>
            </div>
          )}

        </div>
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-fit"
    >
      <Paperclip size={11} className="shrink-0 text-muted-foreground" />
      {displayName}
    </a>
  )
}

// ─── Comments tab ─────────────────────────────────────────────────────────────

function CommentsTab({ order, userMap, token, currentUser }) {
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
      const data = await fetch(`${API}/comments/order/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json())
      setComments(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [order.id])

  useEffect(() => {
    if (!token) return
    const es = new EventSource(`${API}/comments/stream?token=${encodeURIComponent(token)}`)
    es.addEventListener('entity_comment', (e) => {
      try {
        const c = JSON.parse(e.data)
        if (c.entity_type === 'order' && String(c.entity_id) === String(order.id)) {
          setComments(prev => prev.some(x => x.id === c.id) ? prev : [c, ...prev])
        }
      } catch {}
    })
    return () => es.close()
  }, [token, order.id])

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
        if (up.success) {
          attachmentRef = `\n[attachment:${up.fileName}|${pendingFile.name}]`
        }
      }

      const fullMessage = message.trim() + attachmentRef
      if (!fullMessage.trim()) { setSending(false); return }

      const res = await fetch(`${API}/comments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entity_type: 'order',
          entity_id: order.id,
          user_id: currentUser.id,
          message: fullMessage,
          parent_id: replyTo?.id ?? null,
        }),
      })
      if (res.ok) {
        setMessage('')
        setPendingFile(null)
        setReplyTo(null)
        load()
      }
    } catch {}
    setSending(false)
  }

  const threads = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_id)
    const replies = comments.filter(c => c.parent_id)
    return topLevel.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id),
    }))
  }, [comments])

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
            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
              {author?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs font-semibold text-foreground">{author?.name || 'Unknown'}</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
            {comment.edited_at && <span className="text-[10px] text-muted-foreground/60">(edited)</span>}
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
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted">Cancel</button>
              <button type="button" onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90">Save</button>
            </div>
          </div>
        ) : (
          <>
            {text && (
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{renderWithMentions(text, Object.values(userMap))}</p>
            )}
            {attachments.map((a, i) => (
              <AttachmentChip key={i} fileName={a.fileName} displayName={a.displayName} token={token} />
            ))}
          </>
        )}
      </div>
    )
  }

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

        {/* Reply indicator */}
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <span>
              Replying to <span className="font-medium text-foreground">{userMap[replyTo.user_id]?.name || 'Unknown'}</span>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Pending file chip */}
        {pendingFile && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs w-fit">
            <Paperclip size={11} className="text-muted-foreground" />
            <span className="text-foreground">{pendingFile.name}</span>
            <button type="button" onClick={() => setPendingFile(null)} className="text-muted-foreground hover:text-foreground">
              <X size={11} />
            </button>
          </div>
        )}

        {/* Input row */}
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
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendComment() } }}
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

// ─── Activity tab ─────────────────────────────────────────────────────────────

function ActivityTab({ order, userMap, token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/activity/order/${order.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setLogs(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [order.id])

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
              {/* Timeline line */}
              <div className="flex flex-col items-center pt-1">
                <div className="size-2 rounded-full bg-border shrink-0" />
                {i < logs.length - 1 && (
                  <div className="w-px flex-1 bg-border/50 my-1" />
                )}
              </div>
              {/* Content */}
              <div className={cn('flex-1 min-w-0', i < logs.length - 1 ? 'pb-4' : 'pb-0')}>
                <p className="text-sm text-foreground">{log.message}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {author && (
                    <>
                      <span className="text-[10px] text-muted-foreground">{author.name}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                    </>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Order view (read-only) ───────────────────────────────────────────────────

function InlineInvoiceField({ label, field, initialValue, orderId, token, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field, value }),
      })
    } catch {}
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
            className="text-sm font-mono bg-input/50 border border-border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-ring/30 w-48"
          />
          <button onClick={save} disabled={saving} className="flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {saving ? <span className="text-[10px]">…</span> : <Check size={12} />}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 group">
          <span className="text-sm font-mono text-foreground">{value || '—'}</span>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Pencil size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function OrderView({
  order, clientMap, users, quotations,
  isAdmin, isSuperadmin,
  onEdit, onClose, onStatusChange, onDuplicate, onArchive, onTrash,
  token, currentUser,
}) {
  const [activeTab, setActiveTab] = useState('details')

  const client = clientMap[order.client_id]
  const preparedByUser = users.find(u => u.id === order.prepared_by)
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])

  const linkedQuotation = order.quotation_ref_id
    ? quotations.find(q => q.id === order.quotation_ref_id)
    : null

  const quotationAmount = linkedQuotation
    ? (linkedQuotation.items || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    : (Number(order.quotation_manual_amount) || 0)

  const quotationRef = linkedQuotation
    ? linkedQuotation.quotation_id
    : (order.quotation_manual_no || null)

  const isExecutive = currentUser?.role === 'executive'
  const TABS = [
    { id: 'details',  label: 'Details',  Icon: AlignLeft     },
    { id: 'comments', label: 'Comments', Icon: MessageSquare  },
    ...(!isExecutive ? [{ id: 'activity', label: 'Activity', Icon: Activity }] : []),
  ]

  return (
    <div className="flex flex-col h-full">

      {/* ── Fixed header ── */}
      <div className="shrink-0 border-b border-border">

        {/* Top meta strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="font-mono text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
              #{order.job_id}
            </span>
            <CopyButton value={order.job_id} title="Copy Job ID" />
            <span className="text-muted-foreground/30 text-xs shrink-0">·</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(order.date)}</span>
            {preparedByUser && (
              <>
                <span className="text-muted-foreground/30 text-xs hidden sm:inline shrink-0">·</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">by {preparedByUser.name}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>

        {/* Client + project + actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground leading-tight">
              {client?.company_name || client?.full_name || '—'}
            </h2>
            {order.project_name && (
              <p className="text-sm text-muted-foreground mt-0.5">{order.project_name}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StatusSelectHeader order={order} onStatusChange={onStatusChange} />
            <div className="ml-auto flex items-center gap-1.5">
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
                  <DropdownMenuItem onClick={() => onDuplicate(order)}>
                    <Copy size={13} className="mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => onArchive(order)}>
                      <Archive size={13} className="mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  {isSuperadmin && (
                    <DropdownMenuItem
                      onClick={() => onTrash(order)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={13} className="mr-2" />
                      Trash
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

      </div>

      {/* ── Scrollable tab content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' && (
          <div className="h-full overflow-y-auto">
            <DetailsTab
              order={order}
              client={client}
              preparedByUser={preparedByUser}
              quotationAmount={quotationAmount}
              quotationRef={quotationRef}
              token={token}
              isAdmin={isAdmin}
            />
          </div>
        )}
        {activeTab === 'comments' && (
          <CommentsTab
            order={order}
            userMap={userMap}
            token={token}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto">
            <ActivityTab
              order={order}
              userMap={userMap}
              token={token}
            />
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Form section label ───────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─── Order form (create / edit) ───────────────────────────────────────────────

function OrderForm({ order, clients, users, quotations, token, currentUser, onSave, onClose }) {
  const isEdit = Boolean(order?.id)
  const draftKey = isEdit ? `draft_order_edit_${order.id}` : 'draft_order'

  function initialState() {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    if (isEdit) {
      const isOther = order.job_type?.startsWith('Other - ')
      return {
        client_id: order.client_id ?? '',
        project_name: order.project_name ?? '',
        job_type: isOther ? 'Other' : (order.job_type ?? ''),
        job_type_other: isOther ? order.job_type.slice(8) : '',
        quantity: order.quantity ?? '',
        specifications: order.specifications ?? '',
        delivery_expected: order.delivery_expected ? order.delivery_expected.slice(0, 10) : '',
        quotation_mode: order.quotation_ref_id ? 'linked' : (order.quotation_manual_no ? 'manual' : 'none'),
        quotation_ref_id: order.quotation_ref_id ?? null,
        quotation_manual_no: order.quotation_manual_no ?? '',
        quotation_manual_amount: order.quotation_manual_amount ?? '',
        advance: order.advance ?? '',
        prepared_by: order.prepared_by ?? currentUser?.id ?? '',
        status: order.status ?? 'negotiation',
        notes: order.notes ?? '',
        assignees: (order.assignees ?? []).map(a => a.id),
      }
    }
    return {
      client_id: '',
      project_name: '',
      job_type: '',
      job_type_other: '',
      quantity: '',
      specifications: '',
      delivery_expected: '',
      quotation_mode: 'none',
      quotation_ref_id: null,
      quotation_manual_no: '',
      quotation_manual_amount: '',
      advance: '',
      prepared_by: currentUser?.id ?? '',
      status: 'negotiation',
      notes: '',
      assignees: [],
    }
  }

  const [form, setForm] = useState(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nextJobId, setNextJobId] = useState('')

  useEffect(() => {
    if (!isEdit) {
      fetch('/api/orders/next-id', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.job_id) setNextJobId(d.job_id) })
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [form, draftKey])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const quotationAmount = parseFloat(form.quotation_manual_amount) || 0
  const balance = quotationAmount - (parseFloat(form.advance) || 0)

  async function handleSave() {
    if (!form.client_id) { setError('Client is required'); return }
    setSaving(true)
    setError('')
    try {
      const resolvedJobType = form.job_type === 'Other'
        ? (form.job_type_other.trim() ? `Other - ${form.job_type_other.trim()}` : 'Other')
        : form.job_type

      const body = {
        ...(isEdit ? { id: order.id } : {}),
        client_id: form.client_id,
        project_name: form.project_name,
        job_type: resolvedJobType,
        quantity: form.quantity,
        specifications: form.specifications,
        delivery_expected: form.delivery_expected || null,
        quotation_ref_id: form.quotation_mode === 'linked' ? form.quotation_ref_id : null,
        quotation_manual_no: form.quotation_mode === 'manual' ? form.quotation_manual_no : '',
        quotation_manual_amount: form.quotation_mode !== 'none' ? quotationAmount : 0,
        advance: parseFloat(form.advance) || 0,
        prepared_by: form.prepared_by,
        status: form.status,
        notes: form.notes,
        assignees: form.assignees,
      }
      const res = await fetch(`${API}/orders/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { setError('Failed to save order'); return }
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
              {isEdit ? 'Edit Order' : 'New Order'}
            </h2>
            {isEdit ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                #{order.job_id} · {formatDate(order.date)}
              </p>
            ) : nextJobId ? (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                #{nextJobId}
              </p>
            ) : null}
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

        {/* ── Client & Project ── */}
        <SectionLabel label="Client & Project" />

        <Field label="Client" required>
          <ClientCombobox
            clients={clients}
            value={form.client_id}
            onChange={v => set('client_id', v)}
          />
        </Field>

        <Field label="Project Name">
          <Input
            value={form.project_name}
            onChange={e => set('project_name', e.target.value)}
            placeholder="Project name"
          />
        </Field>

        {/* ── Job Details ── */}
        <SectionLabel label="Job Details" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Job Type">
            <Select value={form.job_type || ''} onValueChange={v => set('job_type', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map(jt => <SelectItem key={jt} value={jt}>{jt}</SelectItem>)}
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
        </div>

        {form.job_type === 'Other' && (
          <Field label="Specify Job Type">
            <Input
              value={form.job_type_other}
              onChange={e => set('job_type_other', e.target.value)}
              placeholder="e.g. ID Card"
              autoFocus
            />
          </Field>
        )}

        <Field label="Specifications">
          <Textarea
            value={form.specifications}
            onChange={e => set('specifications', e.target.value)}
            placeholder="Specifications…"
            rows={3}
            className="resize-none"
          />
        </Field>

        <Field label="Delivery Expected">
          <Input
            type="date"
            value={form.delivery_expected}
            onChange={e => set('delivery_expected', e.target.value)}
          />
        </Field>

        {/* ── Financials ── */}
        <SectionLabel label="Financials" />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground">Quotation</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { v: 'none',   label: 'None' },
              { v: 'linked', label: 'Link Quotation' },
              { v: 'manual', label: 'Manual Entry' },
            ].map(opt => (
              <button
                key={opt.v}
                type="button"
                onClick={() => set('quotation_mode', opt.v)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  form.quotation_mode === opt.v
                    ? 'bg-primary text-primary-foreground border-transparent'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {form.quotation_mode === 'linked' && (
            <QuotationCombobox
              quotations={quotations}
              clients={clients}
              value={form.quotation_ref_id}
              onChange={q => {
                if (q) {
                  const total = (q.items || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
                  setForm(prev => ({ ...prev, quotation_ref_id: q.id, quotation_manual_amount: total }))
                } else {
                  setForm(prev => ({ ...prev, quotation_ref_id: null, quotation_manual_amount: '' }))
                }
              }}
            />
          )}

          {form.quotation_mode === 'manual' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={form.quotation_manual_no}
                onChange={e => set('quotation_manual_no', e.target.value)}
                placeholder="Quotation number"
              />
              <Input
                type="number"
                value={form.quotation_manual_amount}
                onChange={e => set('quotation_manual_amount', e.target.value)}
                placeholder="Amount (₹)"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Advance (₹)">
            <Input
              type="number"
              value={form.advance}
              onChange={e => set('advance', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Balance (₹)">
            <div className="flex h-9 items-center rounded-3xl bg-muted/40 px-3 text-sm text-muted-foreground tabular-nums">
              {form.quotation_mode === 'none' ? '—' : `₹${balance.toLocaleString('en-IN')}`}
            </div>
          </Field>
        </div>

        {/* ── Team & Status ── */}
        <SectionLabel label="Team & Status" />

        <Field label="Assigned To">
          <AssigneeSelect
            users={users}
            value={form.assignees}
            onChange={v => set('assignees', v)}
          />
        </Field>

        <Field label="Prepared By">
          {currentUser?.role === 'superadmin' ? (
            <Select
              value={form.prepared_by ? String(form.prepared_by) : ''}
              onValueChange={v => set('prepared_by', Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground py-2 px-3 bg-muted/40 rounded-md">
              {users.find(u => u.id === form.prepared_by)?.name || '—'}
            </p>
          )}
        </Field>

        {/* ── Notes ── */}
        <SectionLabel label="Notes" />

        <Textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Add any remarks or notes…"
          rows={3}
          className="resize-none"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <SheetFooter className="border-t border-border px-4 sm:px-6 py-4 flex-row justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Order'}
        </Button>
      </SheetFooter>
    </>
  )
}

// ─── Main Orders page ─────────────────────────────────────────────────────────

function Orders({ tab = 'active' }) {
  const { user } = useAuth()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperadmin = user?.role === 'superadmin'

  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('view') // 'view' | 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterJobType, setFilterJobType] = useState('')
  const [filterProforma, setFilterProforma] = useState('') // '' | 'filled' | 'empty'
  const [filterTaxInvoice, setFilterTaxInvoice] = useState('') // '' | 'filled' | 'empty'
  const [sortBy, setSortBy] = useState('job_id') // 'job_id' | 'date' | 'status' | 'client'
  const [sortDir, setSortDir] = useState('desc')

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function fetchAll() {
    try {
      const [o, c, u, q] = await Promise.all([
        fetch(`${API}/orders`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/clients`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/quotations`, { headers: authHeaders }).then(r => r.json()),
      ])
      setOrders(Array.isArray(o) ? o : [])
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
      setQuotations(Array.isArray(q) ? q : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map(c => [c.id, c])),
    [clients]
  )

  const filtered = useMemo(() => {
    let list = orders

    if (tab === 'active') {
      list = list.filter(o =>
        !o.is_archived && !o.is_deleted &&
        o.status !== 'completed' && o.status !== 'long pending'
      )
    } else if (tab === 'all') {
      list = list.filter(o => !o.is_archived && !o.is_deleted)
    } else if (tab === 'completed') {
      list = list.filter(o => o.status === 'completed' && !o.is_deleted)
    } else if (tab === 'long-pending') {
      list = list.filter(o => o.status === 'long pending' && !o.is_deleted)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.job_id?.toLowerCase().includes(q) ||
        o.project_name?.toLowerCase().includes(q) ||
        o.job_type?.toLowerCase().includes(q) ||
        clientMap[o.client_id]?.full_name?.toLowerCase().includes(q) ||
        clientMap[o.client_id]?.company_name?.toLowerCase().includes(q)
      )
    }

    if (filterAssignee) {
      list = list.filter(o => o.assignees?.some(a => String(a.id) === filterAssignee))
    }
    if (filterJobType) {
      list = list.filter(o => o.job_type === filterJobType)
    }
    if (filterDateFrom) {
      const from = new Date(filterDateFrom)
      list = list.filter(o => o.date && new Date(o.date) >= from)
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo)
      to.setHours(23, 59, 59, 999)
      list = list.filter(o => o.date && new Date(o.date) <= to)
    }
    if (filterProforma === 'filled') {
      list = list.filter(o => o.proforma_invoice_number?.trim())
    } else if (filterProforma === 'empty') {
      list = list.filter(o => !o.proforma_invoice_number?.trim())
    }
    if (filterTaxInvoice === 'filled') {
      list = list.filter(o => o.invoice_number?.trim())
    } else if (filterTaxInvoice === 'empty') {
      list = list.filter(o => !o.invoice_number?.trim())
    }

    return [...list].sort((a, b) => {
      let av, bv
      if (sortBy === 'date') {
        av = a.date ? new Date(a.date).getTime() : 0
        bv = b.date ? new Date(b.date).getTime() : 0
      } else if (sortBy === 'status') {
        av = a.status || ''
        bv = b.status || ''
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      } else if (sortBy === 'client') {
        av = clientMap[a.client_id]?.company_name || clientMap[a.client_id]?.full_name || ''
        bv = clientMap[b.client_id]?.company_name || clientMap[b.client_id]?.full_name || ''
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      } else {
        // job_id
        return sortDir === 'asc'
          ? (a.job_id || '').localeCompare(b.job_id || '')
          : (b.job_id || '').localeCompare(a.job_id || '')
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [orders, tab, search, clientMap, filterAssignee, filterJobType, filterDateFrom, filterDateTo, filterProforma, filterTaxInvoice, sortBy, sortDir])

  useEffect(() => { setPage(1) }, [tab, search, filterAssignee, filterJobType, filterDateFrom, filterDateTo, filterProforma, filterTaxInvoice, sortBy, sortDir])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  )

  function openView(order) {
    setSelectedOrder(order)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  function openCreate() {
    setSelectedOrder(null)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const pendingOpenOrderId = useRef(null)

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreate()
      navigate(location.pathname, { replace: true, state: {} })
    }
    if (location.state?.openOrderId) {
      pendingOpenOrderId.current = location.state.openOrderId
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Open the pending order once orders have loaded
  useEffect(() => {
    if (pendingOpenOrderId.current && orders.length > 0) {
      const found = orders.find(o => o.id === pendingOpenOrderId.current)
      if (found) openView(found)
      pendingOpenOrderId.current = null
    }
  }, [orders]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(order, newStatus) {
    try {
      await fetch(`${API}/orders/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: order.id,
          client_id: order.client_id,
          project_name: order.project_name,
          job_type: order.job_type,
          quantity: order.quantity,
          specifications: order.specifications,
          delivery_expected: order.delivery_expected,
          quotation_ref_id: order.quotation_ref_id,
          quotation_manual_no: order.quotation_manual_no,
          quotation_manual_amount: order.quotation_manual_amount,
          advance: order.advance,
          prepared_by: order.prepared_by,
          status: newStatus,
          notes: order.notes,
          assignees: (order.assignees || []).map(a => a.id),
        }),
      })
      setSelectedOrder(prev => prev?.id === order.id ? { ...prev, status: newStatus } : prev)
      fetchAll()
    } catch {}
  }

  async function handleDuplicate(order) {
    try {
      await fetch(`${API}/orders/duplicate/${order.id}`, { method: 'POST', headers: authHeaders })
      setDrawerOpen(false)
      fetchAll()
    } catch {}
  }

  async function handleArchive(order) {
    try {
      await fetch(`${API}/orders/archive/${order.id}`, { method: 'POST', headers: authHeaders })
      setDrawerOpen(false)
      fetchAll()
    } catch {}
  }

  async function handleTrash(order) {
    try {
      await fetch(`${API}/orders/trash/${order.id}`, { method: 'POST', headers: authHeaders })
      setDrawerOpen(false)
      fetchAll()
    } catch {}
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
        <h1 className="text-xl font-semibold text-foreground">{TAB_LABELS[tab]}</h1>
        <div className="flex items-center gap-2">
          {/* DEV ONLY — remove before deployment */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => document.documentElement.classList.toggle('dark')}
            title="Toggle dark/light mode"
          >
            <Sun size={15} className="hidden dark:block" />
            <Moon size={15} className="block dark:hidden" />
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus size={15} />
            New Order
          </Button>
        </div>
      </div>

      {/* Search + Pagination controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-72 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="pl-8" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-1.5 shrink-0', filtersOpen && 'bg-muted')}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <SlidersHorizontal size={13} />
            Filters
            {(filterAssignee || filterJobType || filterDateFrom || filterDateTo || filterProforma || filterTaxInvoice) && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
          </Button>
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

      {/* Filter panel */}
      {filtersOpen && (
        <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background">
          {/* Row 1: filter controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Assignee</label>
              <Select value={filterAssignee || '_all'} onValueChange={v => setFilterAssignee(v === '_all' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Job Type</label>
              <Select value={filterJobType || '_all'} onValueChange={v => setFilterJobType(v === '_all' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any</SelectItem>
                  {JOB_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proforma */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Proforma No.</label>
              <Select value={filterProforma || '_all'} onValueChange={v => setFilterProforma(v === '_all' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Invoice */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Tax Invoice No.</label>
              <Select value={filterTaxInvoice || '_all'} onValueChange={v => setFilterTaxInvoice(v === '_all' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: date + sort */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Date From</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Date To</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Sort by */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_id">Job ID</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort direction */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Order</label>
              <Select value={sortDir} onValueChange={setSortDir}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest / Z-A</SelectItem>
                  <SelectItem value="asc">Oldest / A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filterAssignee || filterJobType || filterDateFrom || filterDateTo || filterProforma || filterTaxInvoice) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 gap-1.5 text-muted-foreground"
                onClick={() => {
                  setFilterAssignee('')
                  setFilterJobType('')
                  setFilterDateFrom('')
                  setFilterDateTo('')
                  setFilterProforma('')
                  setFilterTaxInvoice('')
                }}
              >
                <X size={12} />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile / tablet-portrait card list */}
      <div className="lg:hidden rounded-2xl ring-1 ring-foreground/5 divide-y divide-border overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No orders found.</p>
        ) : (
          paginated.map(order => {
            const client = clientMap[order.client_id]
            return (
              <div key={order.id} className="flex items-stretch gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
                {/* Left: info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => openView(order)}
                >
                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.project_name || '—'}
                  </p>
                  {client?.company_name && (
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5 truncate">
                      {client.company_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono mt-1.5">
                    {order.job_id}
                    {order.date && (
                      <span className="font-sans"> &bull; {formatDate(order.date)}</span>
                    )}
                  </p>
                </div>

                {/* Right: status + menu */}
                <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                  <div onClick={e => e.stopPropagation()}>
                    <StatusSelect order={order} onStatusChange={handleStatusChange} />
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                        <DropdownMenuItem onClick={() => openView(order)}>
                          <FileText size={13} className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDrawerMode('edit'); setDrawerOpen(true) }}>
                          <Pencil size={13} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(order)}>
                          <Copy size={13} className="mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => handleArchive(order)}>
                            <Archive size={13} className="mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        {isSuperadmin && (
                          <DropdownMenuItem
                            onClick={() => handleTrash(order)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={13} className="mr-2" />
                            Trash
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

      {/* Tablet-landscape / desktop table */}
      <div className="hidden lg:block rounded-2xl ring-1 ring-foreground/5 overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[110px]">Job ID</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[90px]">Date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[120px]">Client</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[130px]">Project / Type</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[110px]">Proforma No.</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[110px]">Tax Invoice No.</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[100px]">Assigned To</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground min-w-[130px]">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-12">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(order => {
                const client = clientMap[order.client_id]
                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/30 align-middle"
                    onClick={() => openView(order)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-muted-foreground">{order.job_id}</span>
                        <CopyButton value={order.job_id} title="Copy Job ID" />
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.date)}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[130px]">
                        <p className="text-sm font-medium text-foreground truncate">
                          {client?.company_name || client?.full_name || '—'}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[150px]">
                        <p className="text-sm text-foreground truncate">
                          {order.project_name || '—'}
                        </p>
                        {order.job_type && (
                          <p className="text-xs text-muted-foreground">{order.job_type}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.proforma_invoice_number || '—'}
                        </span>
                        {order.proforma_invoice_number && (
                          <CopyButton value={order.proforma_invoice_number} title="Copy Proforma No." />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.invoice_number || '—'}
                        </span>
                        {order.invoice_number && (
                          <CopyButton value={order.invoice_number} title="Copy Tax Invoice No." />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {(order.assignees || []).length > 0
                        ? order.assignees.map(a => (
                            <p key={a.id} className="text-sm text-muted-foreground">{a.name}</p>
                          ))
                        : <p className="text-sm text-muted-foreground">—</p>
                      }
                    </TableCell>

                    <TableCell>
                      <StatusSelect order={order} onStatusChange={handleStatusChange} />
                    </TableCell>

                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
                          <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDrawerMode('edit'); setDrawerOpen(true) }}>
                            <Pencil size={13} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(order)}>
                            <Copy size={13} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem onClick={() => handleArchive(order)}>
                              <Archive size={13} className="mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          {isSuperadmin && (
                            <DropdownMenuItem
                              onClick={() => handleTrash(order)}
                              className="text-destructive focus:text-destructive"
                            >
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
        <SheetContent
          side="right"
          showCloseButton={false}
          className="data-[side=right]:w-full data-[side=right]:sm:max-w-[600px] flex flex-col p-0"
        >
          {drawerOpen && drawerMode === 'view' && selectedOrder && (
            <OrderView
              order={selectedOrder}
              clientMap={clientMap}
              users={users}
              quotations={quotations}
              isAdmin={isAdmin}
              isSuperadmin={isSuperadmin}
              onEdit={() => setDrawerMode('edit')}
              onClose={() => setDrawerOpen(false)}
              onStatusChange={handleStatusChange}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onTrash={handleTrash}
              token={token}
              currentUser={user}
            />
          )}
          {drawerOpen && drawerMode === 'edit' && (
            <OrderForm
              order={selectedOrder}
              clients={clients}
              users={users}
              quotations={quotations}
              token={token}
              currentUser={user}
              onSave={handleSaved}
              onClose={selectedOrder ? () => setDrawerMode('view') : () => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Orders
