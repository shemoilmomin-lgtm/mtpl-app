import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Clients from './pages/Clients'
import Quotations from './pages/Quotations'
import Tasks from './pages/Tasks'
import Leads from './pages/Leads'
import Settings from './pages/Settings'
import Archived from './pages/Archived'
import ActivityLog from './pages/ActivityLog'
import Trash from './pages/Trash'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/orders" element={<ProtectedLayout><Orders tab="active" /></ProtectedLayout>} />
            <Route path="/orders/all" element={<ProtectedLayout><Orders tab="all" /></ProtectedLayout>} />
            <Route path="/orders/completed" element={<ProtectedLayout><Orders tab="completed" /></ProtectedLayout>} />
            <Route path="/orders/long-pending" element={<ProtectedLayout><Orders tab="long-pending" /></ProtectedLayout>} />
            <Route path="/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
            <Route path="/quotations" element={<ProtectedLayout><Quotations /></ProtectedLayout>} />
            <Route path="/tasks" element={<ProtectedLayout><Tasks tab="all" /></ProtectedLayout>} />
            <Route path="/tasks/in-queue" element={<ProtectedLayout><Tasks tab="in_queue" /></ProtectedLayout>} />
            <Route path="/tasks/working" element={<ProtectedLayout><Tasks tab="working" /></ProtectedLayout>} />
            <Route path="/tasks/waiting" element={<ProtectedLayout><Tasks tab="waiting" /></ProtectedLayout>} />
            <Route path="/tasks/done" element={<ProtectedLayout><Tasks tab="done" /></ProtectedLayout>} />
            <Route path="/leads" element={<ProtectedLayout><Leads tab="all" /></ProtectedLayout>} />
            <Route path="/leads/open" element={<ProtectedLayout><Leads tab="open" /></ProtectedLayout>} />
            <Route path="/leads/won" element={<ProtectedLayout><Leads tab="won" /></ProtectedLayout>} />
            <Route path="/leads/lost" element={<ProtectedLayout><Leads tab="lost" /></ProtectedLayout>} />
            <Route path="/archived" element={<ProtectedLayout><Archived /></ProtectedLayout>} />
            <Route path="/trash" element={<ProtectedLayout><Trash /></ProtectedLayout>} />
            <Route path="/activity" element={<ProtectedLayout><ActivityLog /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
