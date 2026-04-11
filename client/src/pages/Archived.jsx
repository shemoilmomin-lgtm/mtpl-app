import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Search, MoreHorizontal, ArchiveRestore, Trash2, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const API = '/api'

function useToken() {
  return localStorage.getItem('mtpl_token')
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatAmount(n) {
  if (n == null || n === '') return '—'
  return `\u20B9${Number(n).toLocaleString('en-IN')}`
}

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

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-foreground flex-1">{value}</span>
    </div>
  )
}

// ─── Shared row actions ───────────────────────────────────────────────────────

function RowActions({ onRestore, onTrash }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/65">
        <DropdownMenuItem onClick={onRestore}>
          <ArchiveRestore size={14} className="mr-2" />
          Restore
        </DropdownMenuItem>
        {onTrash && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onTrash}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={14} className="mr-2" />
              Move to Trash
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Archived Orders ──────────────────────────────────────────────────────────

function ArchivedOrders({ token, isSuperadmin, clients }) {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(data.filter(o => o.is_archived && !o.is_deleted))
    } catch {}
  }

  useEffect(() => { load() }, [])

  function clientName(order) {
    const c = clients.find(c => c.id === order.client_id)
    return c ? (c.company_name || c.full_name) : '—'
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return orders
    return orders.filter(o =>
      o.job_id?.toLowerCase().includes(q) ||
      clientName(o).toLowerCase().includes(q) ||
      o.job_type?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    )
  }, [orders, search, clients])

  async function restore(order) {
    await fetch(`${API}/orders/unarchive/${order.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function trash(order) {
    await fetch(`${API}/orders/trash/${order.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search orders..." empty="No archived orders">
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Job ID</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(order)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{order.job_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.date)}</TableCell>
                    <TableCell className="text-sm">{clientName(order)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.job_type || '—'}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <RowActions onRestore={() => restore(order)} onTrash={isSuperadmin ? () => trash(order) : null} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabContent>

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-base font-semibold">{selected?.job_id}</SheetTitle>
            <p className="text-xs text-muted-foreground">Archived order</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Client" value={clientName(selected)} />
              <DetailRow label="Project" value={selected.project_name} />
              <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
              <DetailRow label="Job Type" value={selected.job_type} />
              <DetailRow label="Quantity" value={selected.quantity} />
              <DetailRow label="Delivery" value={formatDate(selected.delivery_expected)} />
              <DetailRow label="Advance" value={selected.advance != null ? `₹${Number(selected.advance).toLocaleString('en-IN')}` : null} />
              <DetailRow label="Balance" value={selected.balance != null ? `₹${Number(selected.balance).toLocaleString('en-IN')}` : null} />
              {selected.specifications && <DetailRow label="Specifications" value={selected.specifications} />}
              {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
            </div>
          )}
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-end gap-2">
            {isSuperadmin && selected && (
              <Button variant="destructive" size="sm" onClick={() => trash(selected)}>
                <Trash2 size={14} className="mr-1.5" /> Move to Trash
              </Button>
            )}
            {selected && (
              <Button size="sm" onClick={() => restore(selected)}>
                <ArchiveRestore size={14} className="mr-1.5" /> Restore
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Archived Clients ─────────────────────────────────────────────────────────

function ArchivedClients({ token, isSuperadmin }) {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await fetch(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setClients(data.filter(c => c.is_archived))
    } catch {}
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return clients
    return clients.filter(c =>
      c.client_id?.toLowerCase().includes(q) ||
      c.full_name?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.contact_1_no?.toLowerCase().includes(q)
    )
  }, [clients, search])

  async function restore(client) {
    await fetch(`${API}/clients/unarchive/${client.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  async function trash(client) {
    await fetch(`${API}/clients/trash/${client.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <TabContent search={search} onSearch={setSearch} placeholder="Search clients..." empty="No archived clients">
      {filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{client.client_id}</TableCell>
                  <TableCell className="text-sm font-medium">{client.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.company_name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.contact_1_no || '—'}</TableCell>
                  <TableCell>
                    <RowActions onRestore={() => restore(client)} onTrash={isSuperadmin ? () => trash(client) : null} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TabContent>
  )
}

// ─── Archived Quotations ──────────────────────────────────────────────────────

function ArchivedQuotations({ token, clients, isSuperadmin }) {
  const [quotations, setQuotations] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/quotations`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setQuotations(data.filter(q => q.is_archived))
    } catch {}
  }

  useEffect(() => { load() }, [])

  function clientName(q) {
    if (q.manual_client_name) return q.manual_client_name
    const c = clients.find(c => c.id === q.client_id)
    return c ? (c.company_name || c.full_name) : '—'
  }

  function total(q) {
    if (!q.items?.length) return null
    return q.items.reduce((sum, i) => sum + Number(i.amount || 0), 0)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return quotations
    return quotations.filter(qt =>
      qt.quotation_id?.toLowerCase().includes(q) ||
      clientName(qt).toLowerCase().includes(q) ||
      qt.subject?.toLowerCase().includes(q)
    )
  }, [quotations, search, clients])

  async function restore(qt) {
    await fetch(`${API}/quotations/unarchive/${qt.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function trash(qt) {
    await fetch(`${API}/quotations/trash/${qt.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search quotations..." empty="No archived quotations">
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Quotation ID</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-28">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(qt => (
                  <TableRow key={qt.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(qt)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{qt.quotation_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(qt.date)}</TableCell>
                    <TableCell className="text-sm">{clientName(qt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{qt.subject || '—'}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatAmount(total(qt))}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <RowActions onRestore={() => restore(qt)} onTrash={isSuperadmin ? () => trash(qt) : null} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabContent>

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-base font-semibold">{selected?.quotation_id}</SheetTitle>
            <p className="text-xs text-muted-foreground">Archived quotation</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Client" value={clientName(selected)} />
              <DetailRow label="Subject" value={selected.subject} />
              <DetailRow label="Date" value={formatDate(selected.date)} />
              <DetailRow label="Tax Mode" value={selected.tax_mode} />
              <DetailRow label="Discount" value={selected.discount_amount > 0 ? `${selected.discount_type === 'percentage' ? selected.discount_amount + '%' : '₹' + Number(selected.discount_amount).toLocaleString('en-IN')}` : null} />
              {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
              {selected.items?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Line Items</span>
                  <div className="rounded-lg border border-border overflow-hidden">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between px-3 py-2 border-b border-border last:border-0 text-sm">
                        <span className="text-foreground">{item.item_name || item.description || `Item ${i + 1}`}</span>
                        <span className="text-muted-foreground tabular-nums">₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm font-medium px-1 pt-1">
                    <span>Total</span>
                    <span>{formatAmount(total(selected))}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-end gap-2">
            {selected && (
              <Button size="sm" onClick={() => restore(selected)}>
                <ArchiveRestore size={14} className="mr-1.5" /> Restore
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Archived Tasks ───────────────────────────────────────────────────────────

function ArchivedTasks({ token, clients, users, isSuperadmin }) {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await fetch(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTasks(data.filter(t => t.is_archived))
    } catch {}
  }

  useEffect(() => { load() }, [])

  function clientName(task) {
    const c = clients.find(c => c.id === task.client_id)
    return c ? (c.company_name || c.full_name) : '—'
  }

  function assigneeNames(task) {
    if (!task.assignees?.length) return '—'
    return task.assignees.map(a => a.name || users.find(u => u.id === a.id)?.name || '?').join(', ')
  }

  const TASK_STATUS_LABELS = { in_queue: 'In Queue', working: 'Working', waiting: 'Waiting', done: 'Done' }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return tasks
    return tasks.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      clientName(t).toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    )
  }, [tasks, search, clients])

  async function restore(task) {
    await fetch(`${API}/tasks/unarchive/${task.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  async function trash(task) {
    await fetch(`${API}/tasks/trash/${task.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <TabContent search={search} onSearch={setSearch} placeholder="Search tasks..." empty="No archived tasks">
      {filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="text-sm font-medium">{task.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{clientName(task)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{assigneeNames(task)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {TASK_STATUS_LABELS[task.status] || task.status || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(task.created_at)}</TableCell>
                  <TableCell>
                    <RowActions onRestore={() => restore(task)} onTrash={isSuperadmin ? () => trash(task) : null} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TabContent>
  )
}

// ─── Archived Leads ───────────────────────────────────────────────────────────

function ArchivedLeads({ token, clients, isSuperadmin }) {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/leads`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setLeads(data.filter(l => l.is_archived && !l.is_deleted))
    } catch {}
  }

  useEffect(() => { load() }, [])

  function clientName(lead) {
    if (lead.client_manual_name) return lead.client_manual_name
    const c = clients.find(c => c.id === lead.client_id)
    return c ? (c.company_name || c.full_name) : '—'
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return leads
    return leads.filter(l =>
      l.lead_id?.toLowerCase().includes(q) ||
      clientName(l).toLowerCase().includes(q) ||
      l.job_type?.toLowerCase().includes(q) ||
      l.status?.toLowerCase().includes(q)
    )
  }, [leads, search, clients])

  async function restore(lead) {
    await fetch(`${API}/leads/unarchive/${lead.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function trash(lead) {
    await fetch(`${API}/leads/trash/${lead.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search leads..." empty="No archived leads">
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Lead ID</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(lead)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{lead.lead_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(lead.date)}</TableCell>
                    <TableCell className="text-sm">{clientName(lead)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.job_type || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{lead.status || '—'}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <RowActions onRestore={() => restore(lead)} onTrash={isSuperadmin ? () => trash(lead) : null} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabContent>

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-base font-semibold">{selected?.lead_id}</SheetTitle>
            <p className="text-xs text-muted-foreground">Archived lead</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Client" value={clientName(selected)} />
              <DetailRow label="Status" value={<span className="capitalize">{selected.status || '—'}</span>} />
              <DetailRow label="Job Type" value={selected.job_type} />
              <DetailRow label="Quantity" value={selected.quantity} />
              <DetailRow label="Delivery" value={formatDate(selected.delivery_expected)} />
              {selected.specifications && <DetailRow label="Specifications" value={selected.specifications} />}
            </div>
          )}
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-end gap-2">
            {selected && (
              <Button size="sm" onClick={() => restore(selected)}>
                <ArchiveRestore size={14} className="mr-1.5" /> Restore
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Shared tab content wrapper ───────────────────────────────────────────────

function TabContent({ search, onSearch, placeholder, empty, children }) {
  const hasContent = !!children && (Array.isArray(children) ? children.some(Boolean) : true)
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>
      {hasContent ? children : (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          {empty}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'orders',     label: 'Orders' },
  { key: 'clients',    label: 'Clients' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'tasks',      label: 'Tasks' },
  { key: 'leads',      label: 'Leads' },
]

export default function Archived() {
  const { user } = useAuth()
  const token = useToken()
  const [activeTab, setActiveTab] = useState('orders')
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])

  const isSuperadmin = user?.role === 'superadmin'

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/clients`, { headers: h }).then(r => r.json()),
      fetch(`${API}/users`, { headers: h }).then(r => r.json()),
    ]).then(([c, u]) => {
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
    }).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Archived</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Archived records across all modules</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0',
              activeTab === tab.key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders'     && <ArchivedOrders     token={token} isSuperadmin={isSuperadmin} clients={clients} />}
      {activeTab === 'clients'    && <ArchivedClients    token={token} isSuperadmin={isSuperadmin} />}
      {activeTab === 'quotations' && <ArchivedQuotations token={token} isSuperadmin={isSuperadmin} clients={clients} />}
      {activeTab === 'tasks'      && <ArchivedTasks      token={token} isSuperadmin={isSuperadmin} clients={clients} users={users} />}
      {activeTab === 'leads'      && <ArchivedLeads      token={token} isSuperadmin={isSuperadmin} clients={clients} />}
    </div>
  )
}
