import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  CheckSquare, Activity, ShoppingBag, TrendingUp, FileText,
  ChevronLeft, ChevronRight, Clock, ListChecks,
  Bell, UserPlus, RefreshCw, Pencil, Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const API = '/api'

function useToken() {
  return localStorage.getItem('mtpl_token')
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, icon: Icon, accent, onClick }) {
  const accentMap = {
    blue:   { bg: 'bg-blue-500/10',    icon: 'text-blue-500' },
    amber:  { bg: 'bg-amber-500/10',   icon: 'text-amber-500' },
    violet: { bg: 'bg-violet-500/10',  icon: 'text-violet-500' },
    green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-500' },
    orange: { bg: 'bg-orange-500/10',  icon: 'text-orange-500' },
    red:    { bg: 'bg-red-500/10',     icon: 'text-red-500' },
  }
  const { bg, icon: iconClass } = accentMap[accent] || accentMap.blue

  return (
    <div
      className={cn('bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-3', onClick && 'cursor-pointer hover:ring-foreground/20 transition-all')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{label}</p>
        <div className={cn('p-2 rounded-xl', bg)}>
          <Icon size={15} className={iconClass} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-foreground tabular-nums">{value ?? '—'}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card ring-1 ring-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-emerald-500 mt-0.5">{payload[0].value} orders</p>
    </div>
  )
}

// ─── Orders Chart ─────────────────────────────────────────────────────────────
function OrdersChart({ orders }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = new Date().getFullYear()

  const data = MONTHS.map((month, i) => ({
    month,
    orders: orders.filter(o => {
      const d = new Date(o.date)
      return d.getFullYear() === year && d.getMonth() === i
    }).length,
  }))

  const total = data.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Orders This Year</p>
          <p className="text-xs text-muted-foreground mt-0.5">{year} — {total} total</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 inline-block" />
          Orders
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#orderGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Task Breakdown ───────────────────────────────────────────────────────────
function TaskBreakdown({ tasks }) {
  const total = tasks.length || 1
  const items = [
    { label: 'In Queue',   count: tasks.filter(t => t.status === 'in_queue').length,  color: 'bg-blue-500' },
    { label: 'Working',    count: tasks.filter(t => t.status === 'working').length,   color: 'bg-amber-500' },
    { label: 'Waiting',    count: tasks.filter(t => t.status === 'waiting').length,   color: 'bg-orange-500' },
    { label: 'Done',       count: tasks.filter(t => t.status === 'done').length,      color: 'bg-emerald-500' },
  ]

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Task Breakdown</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tasks.length} total tasks</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map(({ label, count, color }) => {
          const pct = Math.round((count / total) * 100)
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium text-foreground tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Delivery Calendar ────────────────────────────────────────────────────────
function DeliveryCalendar({ orders }) {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState(null)
  const { year, month } = current

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  // Parse delivery_expected safely without timezone shift
  const deliveryMap = {}
  orders.forEach((o) => {
    if (!o.delivery_expected) return
    const raw = typeof o.delivery_expected === 'string'
      ? o.delivery_expected.slice(0, 10)   // "YYYY-MM-DD"
      : o.delivery_expected.toISOString().slice(0, 10)
    const [y, m, d] = raw.split('-').map(Number)
    if (y === year && m - 1 === month) {
      if (!deliveryMap[d]) deliveryMap[d] = []
      deliveryMap[d].push(o)
    }
  })

  const monthName = new Date(year, month).toLocaleString('default', {
    month: 'long', year: 'numeric',
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const selectedOrders = selectedDay ? (deliveryMap[selectedDay] || []) : []

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Delivery Calendar</p>
          <p className="text-xs text-muted-foreground mt-0.5">{monthName}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => { setCurrent(({ year, month }) => {
            const d = new Date(year, month - 1)
            return { year: d.getFullYear(), month: d.getMonth() }
          }); setSelectedDay(null) }}><ChevronLeft size={14} /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => { setCurrent(({ year, month }) => {
            const d = new Date(year, month + 1)
            return { year: d.getFullYear(), month: d.getMonth() }
          }); setSelectedDay(null) }}><ChevronRight size={14} /></Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const hasDeliveries = day && deliveryMap[day]?.length > 0
          const count = deliveryMap[day]?.length || 0
          const isSelected = day !== null && day === selectedDay
          return (
            <div
              key={i}
              onClick={() => day && setSelectedDay(isSelected ? null : day)}
              className={cn(
                'relative flex flex-col items-center justify-start pt-1 pb-1.5 rounded-lg min-h-9 transition-colors',
                day && 'cursor-pointer',
                isToday(day) && !isSelected && 'bg-primary/10 ring-1 ring-primary/30',
                isSelected && 'bg-primary/20 ring-1 ring-primary/40',
                hasDeliveries && !isSelected && 'hover:bg-muted/60',
                !hasDeliveries && day && 'hover:bg-muted/30',
              )}
            >
              {day && (
                <>
                  <span className={cn(
                    'text-[11px] font-medium leading-5',
                    isToday(day) || isSelected ? 'text-primary font-semibold' : 'text-foreground'
                  )}>{day}</span>
                  {hasDeliveries && (
                    <span className={cn(
                      'text-[9px] font-bold leading-none mt-0.5 size-4 flex items-center justify-center rounded-full',
                      count >= 3 ? 'bg-red-500 text-white' :
                      count === 2 ? 'bg-amber-500 text-white' :
                      'bg-primary text-primary-foreground'
                    )}>
                      {count}
                    </span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day deliveries */}
      {selectedDay && (
        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            {selectedOrders.length} deliver{selectedOrders.length === 1 ? 'y' : 'ies'} on {selectedDay} {monthName.split(' ')[0]}
          </p>
          {selectedOrders.map((o) => (
            <div
              key={o.id}
              onClick={() => navigate('/orders', { state: { openOrderId: o.id } })}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
            >
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate">{o.project_name || o.job_id || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* No deliveries this month */}
      {Object.keys(deliveryMap).length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No deliveries scheduled this month</p>
      )}
    </div>
  )
}

// ─── My Tasks ─────────────────────────────────────────────────────────────────
function MyTasks({ tasks, user }) {
  const navigate = useNavigate()
  const myTasks = tasks.filter(
    (t) => t.status !== 'done' && t.assignees?.some((a) => a.id == user?.id)
  )

  const statusColor = {
    in_queue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    working:  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    waiting:  'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  }
  const statusLabel = { in_queue: 'Queue', working: 'Working', waiting: 'Waiting' }

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-foreground flex-1">My Tasks</p>
        <span className="text-xs text-muted-foreground">{myTasks.length} pending</span>
      </div>
      {myTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <ListChecks size={28} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No pending tasks</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-y-auto flex-1 max-h-64">
          {myTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2.5 gap-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
              onClick={() => navigate('/tasks', { state: { openTaskId: t.id } })}
            >
              <p className="text-sm text-foreground truncate">{t.title}</p>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', statusColor[t.status])}>
                {statusLabel[t.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Recent Leads ─────────────────────────────────────────────────────────────
function RecentLeads({ leads }) {
  const navigate = useNavigate()
  const recent = [...leads]
    .filter((l) => !l.is_deleted)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)

  const statusColor = {
    new:       'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    won:       'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    lost:      'bg-red-500/15 text-red-500',
    converted: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  }

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-foreground flex-1">Recent Leads</p>
        <span className="text-xs text-muted-foreground">{recent.length} shown</span>
      </div>
      {recent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <TrendingUp size={28} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No leads yet</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border flex-1 overflow-y-auto max-h-64">
          {recent.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between py-2.5 gap-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
              onClick={() => navigate('/leads', { state: { openLeadId: l.id } })}
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">
                  {l.client_manual_name || l.job_type || '—'}
                </p>
                {l.job_type && l.client_manual_name && (
                  <p className="text-xs text-muted-foreground truncate">{l.job_type}</p>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize',
                statusColor[l.status] || 'bg-muted text-muted-foreground'
              )}>
                {l.status || 'new'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Recent Notifications ─────────────────────────────────────────────────────
const NOTIF_ICON = {
  assigned:              { Icon: UserPlus,  color: 'text-blue-500' },
  status_changed:        { Icon: RefreshCw, color: 'text-yellow-500' },
  description_changed:   { Icon: FileText,  color: 'text-purple-500' },
  title_changed:         { Icon: Pencil,    color: 'text-cyan-500' },
  linked_client_changed: { Icon: Link,      color: 'text-emerald-500' },
  linked_order_changed:  { Icon: Link,      color: 'text-emerald-500' },
  reminder:              { Icon: Bell,      color: 'text-orange-500' },
}

function formatRelTime(str) {
  if (!str) return ''
  const normalized = str.endsWith('Z') || str.includes('+') ? str : str + 'Z'
  const diff = Date.now() - new Date(normalized).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d}d ago` : new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function RecentNotifications({ token, userId }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!token || !userId) return
    fetch(`/api/notifications/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {})
  }, [token, userId])

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-foreground/5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <p className="text-xs text-muted-foreground mt-0.5">Recent activity</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {items.map(n => {
            const cfg = NOTIF_ICON[n.notification_type] || { Icon: Bell, color: 'text-muted-foreground' }
            return (
              <div key={n.id} className="flex items-start gap-2.5 py-2.5">
                <cfg.Icon size={13} className={cn('mt-0.5 shrink-0', cfg.color)} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-relaxed line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth()
  const token = useToken()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [leads, setLeads] = useState([])
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API}/tasks`, { headers }).then(r => r.json()),
      fetch(`${API}/leads`, { headers }).then(r => r.json()),
      fetch(`${API}/orders`, { headers }).then(r => r.json()),
      fetch(`${API}/clients`, { headers }).then(r => r.json()),
      fetch(`${API}/quotations`, { headers }).then(r => r.json()),
    ]).then(([t, l, o, c, q]) => {
      setTasks(Array.isArray(t) ? t : [])
      setLeads(Array.isArray(l) ? l : [])
      setOrders(Array.isArray(o) ? o : [])
      setClients(Array.isArray(c) ? c : [])
      setQuotations(Array.isArray(q) ? q : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const openTasks = tasks.filter(t => t.status === 'in_queue').length
  const inProgress = tasks.filter(t => t.status === 'working').length
  const activeOrders = orders.filter(o => o.status !== 'completed' && !o.is_archived).length
  const openLeads = leads.filter(l => !l.is_deleted && l.status !== 'closed' && l.status !== 'converted' && l.status !== 'lost').length
  const totalQuotations = quotations.filter(q => !q.is_archived).length

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Open Tasks"
          value={openTasks}
          sublabel={`${inProgress} in progress`}
          icon={CheckSquare}
          accent="blue"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          sublabel="active tasks"
          icon={Activity}
          accent="amber"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="Active Orders"
          value={activeOrders}
          sublabel="not completed"
          icon={ShoppingBag}
          accent="violet"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          label="Open Leads"
          value={openLeads}
          sublabel="awaiting action"
          icon={TrendingUp}
          accent="green"
          onClick={() => navigate('/leads')}
        />
        <StatCard
          label="Quotations"
          value={totalQuotations}
          sublabel="total active"
          icon={FileText}
          accent="orange"
          onClick={() => navigate('/quotations')}
        />
      </div>

      {/* Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OrdersChart orders={orders} />
        </div>
        <TaskBreakdown tasks={tasks} />
      </div>

      {/* Calendar + Notifications + My Tasks + Recent Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DeliveryCalendar orders={orders} />
        <RecentNotifications token={token} userId={user?.id} />
        <MyTasks tasks={tasks} user={user} />
        <RecentLeads leads={leads} />
      </div>
    </div>
  )
}

export default Dashboard
