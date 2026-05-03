import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText,
  CheckSquare,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Archive,
  Trash2,
  ActivitySquare,
  ChevronRight,
  MessageSquare,
  Bell,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActivityFeedPanel } from '@/components/ActivityFeedPanel'
import { NotificationsPanel } from '@/components/NotificationsPanel'
import { SearchBar } from '@/components/GlobalSearch'

const API = '/api'

const orderRoutes = ['/orders', '/orders/all', '/orders/completed', '/orders/long-pending']
const taskRoutes = ['/tasks', '/tasks/in-queue', '/tasks/working', '/tasks/waiting', '/tasks/done']
const leadRoutes = ['/leads', '/leads/open', '/leads/won', '/leads/lost']

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/55 hover:bg-white/8 hover:text-white/90'
        )
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

function CollapsibleNav({ icon: Icon, label, isActive, isOpen, onClick, children }) {
  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
          isActive
            ? 'text-white'
            : 'text-white/55 hover:bg-white/8 hover:text-white/90'
        )}
      >
        <Icon size={17} />
        <span className="flex-1 text-left">{label}</span>
        {isOpen
          ? <ChevronDown size={13} className="opacity-60" />
          : <ChevronRight size={13} className="opacity-60" />
        }
      </button>
      {isOpen && (
        <div className="mt-0.5 ml-[17px] pl-5 flex flex-col gap-0.5 border-l border-white/10">
          {children}
        </div>
      )}
    </div>
  )
}

function SubNavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center py-1.5 px-2 rounded-md text-sm transition-colors',
          isActive
            ? 'text-white font-medium'
            : 'text-white/45 hover:text-white/80'
        )
      }
    >
      {label}
    </NavLink>
  )
}

function SidebarSection({ label }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25 select-none">
      {label}
    </p>
  )
}

function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('mtpl_token')
  const [feedOpen, setFeedOpen] = useState(() => localStorage.getItem('activityFeedOpen') === 'true')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifUnread, setNotifUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const isOnOrdersRoute = orderRoutes.some(r => location.pathname === r)
  const [ordersOpen, setOrdersOpen] = useState(isOnOrdersRoute)
  useEffect(() => { setOrdersOpen(isOnOrdersRoute) }, [location.pathname])
  function handleOrdersClick() { setOrdersOpen(true); navigate('/orders') }

  const isOnTasksRoute = taskRoutes.some(r => location.pathname === r)
  const [tasksOpen, setTasksOpen] = useState(isOnTasksRoute)
  useEffect(() => { setTasksOpen(isOnTasksRoute) }, [location.pathname])
  function handleTasksClick() { setTasksOpen(true); navigate('/tasks') }

  const isOnLeadsRoute = leadRoutes.some(r => location.pathname === r)
  const [leadsOpen, setLeadsOpen] = useState(isOnLeadsRoute)
  useEffect(() => { setLeadsOpen(isOnLeadsRoute) }, [location.pathname])
  function handleLeadsClick() { setLeadsOpen(true); navigate('/leads') }

  useEffect(() => {
    function handler(e) { setFeedOpen(e.detail) }
    window.addEventListener('activityFeedSetting', handler)
    return () => window.removeEventListener('activityFeedSetting', handler)
  }, [])

  useEffect(() => {
    if (!token) return
    const lastViewed = localStorage.getItem('feedLastViewed') || ''
    fetch(`${API}/comments/feed`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const count = lastViewed
          ? data.filter(c => new Date(c.created_at) > new Date(lastViewed)).length
          : data.length
        setUnreadCount(Math.min(count, 99))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!token || !user?.id) return
    fetch(`${API}/notifications/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setNotifUnread(data.filter(n => !n.is_read).length)
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    if (!token) return
    const es = new EventSource(`${API}/comments/stream?token=${encodeURIComponent(token)}`)
    es.addEventListener('notification', () => {
      if (!notifOpen) setNotifUnread(prev => prev + 1)
    })
    return () => es.close()
  }, [token, notifOpen])

  function handleFeedToggle() {
    const opening = !feedOpen
    setFeedOpen(opening)
    if (opening) {
      setNotifOpen(false)
      setUnreadCount(0)
      localStorage.setItem('feedLastViewed', new Date().toISOString())
    }
  }

  function handleNotifToggle() {
    const opening = !notifOpen
    setNotifOpen(opening)
    if (opening) {
      setFeedOpen(false)
      setNotifUnread(0)
    }
  }

  const lastActivityRef = useRef(Date.now())
  const IDLE_AFTER_MS = 5 * 60 * 1000

  useEffect(() => {
    if (!token) return
    function ping() {
      const idle = Date.now() - lastActivityRef.current > IDLE_AFTER_MS
      fetch(`${API}/presence/ping`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: idle ? 'idle' : 'active' }),
      }).catch(() => {})
    }
    function onActivity() { lastActivityRef.current = Date.now() }
    function onVisibility() { if (document.visibilityState === 'visible') ping() }
    ping()
    const interval = setInterval(ping, 30_000)
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('click', onActivity)
    window.addEventListener('touchstart', onActivity)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('click', onActivity)
      window.removeEventListener('touchstart', onActivity)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [token])

  function handleLogout() {
    fetch(`${API}/presence/offline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?'

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperadmin = user?.role === 'superadmin'
  const isSettingsPage = location.pathname.startsWith('/settings')

  function getPageTitle(pathname) {
    if (pathname.startsWith('/dashboard')) return 'Dashboard'
    if (pathname.startsWith('/orders')) return 'Orders'
    if (pathname.startsWith('/clients')) return 'Clients'
    if (pathname.startsWith('/quotations')) return 'Quotations'
    if (pathname.startsWith('/tasks')) return 'Tasks'
    if (pathname.startsWith('/leads')) return 'Leads'
    if (pathname.startsWith('/archived')) return 'Archived'
    if (pathname.startsWith('/activity')) return 'Activity Log'
    if (pathname.startsWith('/trash')) return 'Trash'
    if (pathname.startsWith('/settings')) return 'Settings'
    return 'MTPL'
  }

  const pageTitle = getPageTitle(location.pathname)

  function handleNewNavigate(path) {
    navigate(path, { state: { openCreate: true } })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-200',
          'lg:relative lg:w-60 lg:z-auto lg:translate-x-0 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #0f1e52 0%, #0d1a45 100%)' }}
      >
        {/* Logo */}
        <div className="px-5 py-2.5 flex items-center justify-start lg:justify-center relative">
          <img src="/logo-white.svg" alt="MTPL" className="h-11" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white/80 transition-colors absolute right-5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/10" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col overflow-y-auto">
          <SidebarSection label="Main" />
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          <SidebarSection label="Management" />
          <CollapsibleNav
            icon={ShoppingBag}
            label="Orders"
            isActive={isOnOrdersRoute}
            isOpen={ordersOpen}
            onClick={handleOrdersClick}
          >
            <SubNavItem to="/orders" label="Active Orders" />
            <SubNavItem to="/orders/completed" label="Completed" />
            <SubNavItem to="/orders/long-pending" label="Long Pending" />
            <SubNavItem to="/orders/all" label="All Orders" />
          </CollapsibleNav>

          <NavItem to="/clients" icon={Users} label="Clients" />
          <NavItem to="/quotations" icon={FileText} label="Quotations" />

          <CollapsibleNav
            icon={CheckSquare}
            label="Tasks"
            isActive={isOnTasksRoute}
            isOpen={tasksOpen}
            onClick={handleTasksClick}
          >
            <SubNavItem to="/tasks" label="All Tasks" />
            <SubNavItem to="/tasks/in-queue" label="In Queue" />
            <SubNavItem to="/tasks/working" label="Working" />
            <SubNavItem to="/tasks/waiting" label="Waiting" />
            <SubNavItem to="/tasks/done" label="Done" />
          </CollapsibleNav>

          <CollapsibleNav
            icon={TrendingUp}
            label="Leads"
            isActive={isOnLeadsRoute}
            isOpen={leadsOpen}
            onClick={handleLeadsClick}
          >
            <SubNavItem to="/leads" label="All Leads" />
            <SubNavItem to="/leads/open" label="Open" />
            <SubNavItem to="/leads/won" label="Won" />
            <SubNavItem to="/leads/lost" label="Lost" />
          </CollapsibleNav>

          {isAdmin && (
            <>
              <SidebarSection label="Admin" />
              <NavItem to="/archived" icon={Archive} label="Archived" />
            </>
          )}
          {isSuperadmin && (
            <>
              <NavItem to="/activity" icon={ActivitySquare} label="Activity Log" />
              <NavItem to="/trash" icon={Trash2} label="Trash" />
            </>
          )}

          <SidebarSection label="General" />
          {/* Feed */}
          <button
            onClick={handleFeedToggle}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
              feedOpen
                ? 'bg-white/15 text-white'
                : 'text-white/55 hover:bg-white/8 hover:text-white/90'
            )}
          >
            <MessageSquare size={17} />
            <span className="flex-1 text-left">Comments</span>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-semibold px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Notifications */}
          <button
            onClick={handleNotifToggle}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
              notifOpen
                ? 'bg-white/15 text-white'
                : 'text-white/55 hover:bg-white/8 hover:text-white/90'
            )}
          >
            <Bell size={17} />
            <span className="flex-1 text-left">Notifications</span>
            {notifUnread > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-semibold px-1">
                {notifUnread}
              </span>
            )}
          </button>
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/10" />

        {/* User section */}
        <div className="px-4 py-4 flex items-center gap-3">
          <UserAvatar name={user?.name} photoUrl={user?.photoUrl} size="size-8" textSize="text-xs" dark />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none truncate">{user?.name}</p>
            <p className="text-xs text-white/40 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-white/35 hover:text-white/80 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4 pb-3 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <img src="/logo-color.svg" alt="MTPL" className="h-8 dark:hidden" />
          <img src="/logo-white.svg" alt="MTPL" className="h-8 hidden dark:block" />
          <div className="flex items-center gap-2">
            {!isSettingsPage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                    <Plus size={17} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 backdrop-blur-sm bg-popover/65">
                  <DropdownMenuItem onClick={() => handleNewNavigate('/orders')}>
                    <ShoppingBag size={14} /> Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/clients')}>
                    <Users size={14} /> Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/quotations')}>
                    <FileText size={14} /> Quotation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/leads')}>
                    <TrendingUp size={14} /> Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/tasks')}>
                    <CheckSquare size={14} /> Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              onClick={handleFeedToggle}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <MessageSquare size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-semibold px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleNotifToggle}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell size={20} />
              {notifUnread > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-semibold px-0.5">
                  {notifUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="lg:hidden px-3 py-2 border-b border-border bg-card shrink-0">
          <SearchBar token={token} className="w-full" />
        </div>

        {/* Desktop content header */}
        <div className="hidden lg:flex items-center gap-4 px-6 border-b border-border bg-card shrink-0" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
          <div className="shrink-0">
            <h1 className={`text-lg font-semibold text-foreground ${location.pathname === '/dashboard' ? 'leading-tight' : ''}`}>{pageTitle}</h1>
            {location.pathname === '/dashboard' && user?.name && (
              <p className="text-[11px] text-muted-foreground leading-none">Welcome back, {user.name.split(' ')[0]}</p>
            )}
          </div>
          <SearchBar token={token} className="flex-1 max-w-sm" />
          <div className="ml-auto shrink-0 flex items-center">
            {!isSettingsPage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus size={14} />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 backdrop-blur-sm bg-popover/65">
                  <DropdownMenuItem onClick={() => handleNewNavigate('/orders')}>
                    <ShoppingBag size={14} /> Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/clients')}>
                    <Users size={14} /> Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/quotations')}>
                    <FileText size={14} /> Quotation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/leads')}>
                    <TrendingUp size={14} /> Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNewNavigate('/tasks')}>
                    <CheckSquare size={14} /> Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Activity feed panel */}
      {feedOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-card flex flex-col">
          <ActivityFeedPanel token={token} onClose={() => setFeedOpen(false)} />
        </div>
      )}
      <div className={cn(
        'hidden lg:block shrink-0 border-l border-border bg-card overflow-hidden transition-[width] duration-200',
        feedOpen ? 'w-80' : 'w-0'
      )}>
        {feedOpen && <ActivityFeedPanel token={token} onClose={() => setFeedOpen(false)} />}
      </div>

      {/* Notifications panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-card flex flex-col">
          <NotificationsPanel
            token={token}
            userId={user?.id}
            onClose={() => setNotifOpen(false)}
            onUnreadChange={setNotifUnread}
          />
        </div>
      )}
      <div className={cn(
        'hidden lg:block shrink-0 border-l border-border bg-card overflow-hidden transition-[width] duration-200',
        notifOpen ? 'w-80' : 'w-0'
      )}>
        {notifOpen && (
          <NotificationsPanel
            token={token}
            userId={user?.id}
            onClose={() => setNotifOpen(false)}
            onUnreadChange={setNotifUnread}
          />
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex items-stretch h-16 safe-area-inset-bottom">
        {[
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
          { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
          { to: '/leads',     icon: TrendingUp,      label: 'Leads' },
        ].map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default AppShell
