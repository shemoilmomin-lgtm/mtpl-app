import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = '/api'

function useToken() {
  return localStorage.getItem('mtpl_token')
}

function formatDateTime(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const ACTION_STYLES = {
  created:    'bg-green-500/10 text-green-600 dark:text-green-400',
  edited:     'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  deleted:    'bg-red-500/10 text-red-500 dark:text-red-400',
  archived:   'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  restored:   'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400',
  trashed:    'bg-red-500/10 text-red-500 dark:text-red-400',
  duplicated: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
  commented:  'bg-muted text-muted-foreground',
  converted:  'bg-sky-500/10 text-sky-500 dark:text-sky-400',
}

const ENTITY_LABELS = {
  order:     'Order',
  client:    'Client',
  quotation: 'Quotation',
  task:      'Task',
  lead:      'Lead',
}

const ACTIONS = ['created', 'edited', 'deleted', 'archived', 'restored', 'trashed', 'duplicated', 'commented', 'converted']
const ENTITY_TYPES = ['order', 'client', 'quotation', 'task', 'lead']

function ActionBadge({ action }) {
  const cls = ACTION_STYLES[action] || 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', cls)}>
      {action}
    </span>
  )
}

export default function ActivityLog() {
  const token = useToken()
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')
  const [filterUser, setFilterUser] = useState('all')

  const authHeaders = { Authorization: `Bearer ${token}` }

  async function load() {
    setLoading(true)
    try {
      const [logs, users] = await Promise.all([
        fetch(`${API}/activity`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeaders }).then(r => r.json()),
      ])
      setLogs(Array.isArray(logs) ? logs : [])
      setUsers(Array.isArray(users) ? users : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = logs
    if (filterAction !== 'all') list = list.filter(l => l.action === filterAction)
    if (filterEntity !== 'all') list = list.filter(l => l.entity_type === filterEntity)
    if (filterUser !== 'all') list = list.filter(l => String(l.user_id) === filterUser)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.user_name?.toLowerCase().includes(q) ||
        l.entity_label?.toLowerCase().includes(q) ||
        l.message?.toLowerCase().includes(q) ||
        l.entity_type?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q)
      )
    }
    return list
  }, [logs, filterAction, filterEntity, filterUser, search])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All user actions across the app</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTIONS.map(a => (
              <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {ENTITY_TYPES.map(e => (
              <SelectItem key={e} value={e}>{ENTITY_LABELS[e]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map(u => (
              <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No activity found
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">When</TableHead>
                <TableHead className="w-32">User</TableHead>
                <TableHead className="w-28">Action</TableHead>
                <TableHead className="w-24">Module</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.user_name || '—'}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {ENTITY_LABELS[log.entity_type] || log.entity_type || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entity_label || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {log.message || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
