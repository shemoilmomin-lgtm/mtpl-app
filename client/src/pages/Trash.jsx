import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Search, ArchiveRestore, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = 'http://localhost:3001/api'

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

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-foreground flex-1">{value}</span>
    </div>
  )
}

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

// ─── Confirm permanent delete dialog ─────────────────────────────────────────

function ConfirmDelete({ open, label, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onCancel() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Permanently delete?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently delete <strong>{label}</strong>. This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
          >
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Trashed Orders ───────────────────────────────────────────────────────────

function TrashedOrders({ token, clients }) {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/orders/trashed`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
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
    await fetch(`${API}/orders/untrash/${order.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function permanentDelete(order) {
    await fetch(`${API}/orders/permanent-delete/${order.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setConfirmDelete(null)
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search orders..." empty="No trashed orders">
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
            <p className="text-xs text-muted-foreground">Trashed order</p>
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
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-between">
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(selected)}>
              <Trash2 size={14} className="mr-1.5" /> Delete Permanently
            </Button>
            <Button size="sm" onClick={() => restore(selected)}>
              <ArchiveRestore size={14} className="mr-1.5" /> Restore
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!confirmDelete}
        label={confirmDelete?.job_id}
        onConfirm={() => permanentDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}

// ─── Trashed Clients ──────────────────────────────────────────────────────────

function TrashedClients({ token }) {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/clients/trashed`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return clients
    return clients.filter(c =>
      c.client_id?.toLowerCase().includes(q) ||
      c.full_name?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q)
    )
  }, [clients, search])

  async function restore(client) {
    await fetch(`${API}/clients/untrash/${client.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function permanentDelete(client) {
    await fetch(`${API}/clients/permanent-delete/${client.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setConfirmDelete(null)
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search clients..." empty="No trashed clients">
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Client ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(client => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(client)}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{client.client_id}</TableCell>
                    <TableCell className="text-sm font-medium">{client.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.company_name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.contact_1_no || '—'}</TableCell>
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
            <SheetTitle className="text-base font-semibold">{selected?.full_name}</SheetTitle>
            <p className="text-xs text-muted-foreground">{selected?.client_id} · Trashed client</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Company" value={selected.company_name} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="GST No." value={selected.gst_number} />
              <DetailRow label="Address" value={selected.address} />
              <DetailRow label="Contact 1" value={selected.contact_1_name ? `${selected.contact_1_name} — ${selected.contact_1_no}` : selected.contact_1_no} />
              <DetailRow label="Contact 2" value={selected.contact_2_name ? `${selected.contact_2_name} — ${selected.contact_2_no}` : selected.contact_2_no} />
              <DetailRow label="Accountant" value={selected.accountant_name ? `${selected.accountant_name} — ${selected.accountant_no}` : selected.accountant_no} />
            </div>
          )}
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-between">
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(selected)}>
              <Trash2 size={14} className="mr-1.5" /> Delete Permanently
            </Button>
            <Button size="sm" onClick={() => restore(selected)}>
              <ArchiveRestore size={14} className="mr-1.5" /> Restore
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!confirmDelete}
        label={confirmDelete?.full_name}
        onConfirm={() => permanentDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}

// ─── Trashed Quotations ───────────────────────────────────────────────────────

function TrashedQuotations({ token, clients }) {
  const [quotations, setQuotations] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/quotations/trashed`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setQuotations(Array.isArray(data) ? data : [])
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
    await fetch(`${API}/quotations/untrash/${qt.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function permanentDelete(qt) {
    await fetch(`${API}/quotations/permanent-delete/${qt.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setConfirmDelete(null)
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search quotations..." empty="No trashed quotations">
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
            <p className="text-xs text-muted-foreground">Trashed quotation</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Client" value={clientName(selected)} />
              <DetailRow label="Subject" value={selected.subject} />
              <DetailRow label="Date" value={formatDate(selected.date)} />
              <DetailRow label="Tax Mode" value={selected.tax_mode} />
              <DetailRow label="Discount" value={selected.discount_amount > 0 ? (selected.discount_type === 'percentage' ? `${selected.discount_amount}%` : `₹${Number(selected.discount_amount).toLocaleString('en-IN')}`) : null} />
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
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-between">
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(selected)}>
              <Trash2 size={14} className="mr-1.5" /> Delete Permanently
            </Button>
            <Button size="sm" onClick={() => restore(selected)}>
              <ArchiveRestore size={14} className="mr-1.5" /> Restore
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!confirmDelete}
        label={confirmDelete?.quotation_id}
        onConfirm={() => permanentDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}

// ─── Trashed Tasks ────────────────────────────────────────────────────────────

function TrashedTasks({ token, clients, users }) {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/tasks/trashed`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
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
      clientName(t).toLowerCase().includes(q)
    )
  }, [tasks, search, clients])

  async function restore(task) {
    await fetch(`${API}/tasks/untrash/${task.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function permanentDelete(task) {
    await fetch(`${API}/tasks/permanent-delete/${task.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setConfirmDelete(null)
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search tasks..." empty="No trashed tasks">
        {filtered.length > 0 && (
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(task => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(task)}>
                    <TableCell className="text-sm font-medium">{task.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{clientName(task)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{assigneeNames(task)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {TASK_STATUS_LABELS[task.status] || task.status || '—'}
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
            <SheetTitle className="text-base font-semibold">{selected?.title}</SheetTitle>
            <p className="text-xs text-muted-foreground">Trashed task</p>
          </SheetHeader>
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <DetailRow label="Client" value={clientName(selected)} />
              <DetailRow label="Status" value={TASK_STATUS_LABELS[selected.status] || selected.status} />
              <DetailRow label="Assigned To" value={assigneeNames(selected)} />
              {selected.description && <DetailRow label="Description" value={selected.description} />}
            </div>
          )}
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-between">
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(selected)}>
              <Trash2 size={14} className="mr-1.5" /> Delete Permanently
            </Button>
            <Button size="sm" onClick={() => restore(selected)}>
              <ArchiveRestore size={14} className="mr-1.5" /> Restore
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!confirmDelete}
        label={confirmDelete?.title}
        onConfirm={() => permanentDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}

// ─── Trashed Leads ────────────────────────────────────────────────────────────

function TrashedLeads({ token, clients }) {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function load() {
    try {
      const res = await fetch(`${API}/leads/trashed`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
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
    await fetch(`${API}/leads/untrash/${lead.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    load()
  }

  async function permanentDelete(lead) {
    await fetch(`${API}/leads/permanent-delete/${lead.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setConfirmDelete(null)
    setSelected(null)
    load()
  }

  return (
    <>
      <TabContent search={search} onSearch={setSearch} placeholder="Search leads..." empty="No trashed leads">
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
            <p className="text-xs text-muted-foreground">Trashed lead</p>
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
          <SheetFooter className="px-6 py-4 border-t border-border flex-row justify-between">
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(selected)}>
              <Trash2 size={14} className="mr-1.5" /> Delete Permanently
            </Button>
            <Button size="sm" onClick={() => restore(selected)}>
              <ArchiveRestore size={14} className="mr-1.5" /> Restore
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={!!confirmDelete}
        label={confirmDelete?.lead_id}
        onConfirm={() => permanentDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
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

export default function Trash() {
  const { user } = useAuth()
  const token = useToken()
  const [activeTab, setActiveTab] = useState('orders')
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (user?.role !== 'superadmin') return
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/clients`, { headers: h }).then(r => r.json()),
      fetch(`${API}/users`, { headers: h }).then(r => r.json()),
    ]).then(([c, u]) => {
      setClients(Array.isArray(c) ? c : [])
      setUsers(Array.isArray(u) ? u : [])
    }).catch(() => {})
  }, [user?.role])

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Access restricted to superadmin.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Trash</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Deleted records — restore or permanently delete</p>
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

      {activeTab === 'orders'     && <TrashedOrders     token={token} clients={clients} />}
      {activeTab === 'clients'    && <TrashedClients    token={token} />}
      {activeTab === 'quotations' && <TrashedQuotations token={token} clients={clients} />}
      {activeTab === 'tasks'      && <TrashedTasks      token={token} clients={clients} users={users} />}
      {activeTab === 'leads'      && <TrashedLeads      token={token} clients={clients} />}
    </div>
  )
}
