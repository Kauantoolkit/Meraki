import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
import PasswordRecovery from './pages/PasswordRecovery'
import DashboardEmpresa from './pages/DashboardEmpresa'
import DashboardEspecialista from './pages/DashboardEspecialista'
import CreateProject from './pages/CreateProject'
import Bidding from './pages/Bidding'
import Kanban from './pages/Kanban'
import Financeiro from './pages/Financeiro'
import GanhosEspecialista from './pages/GanhosEspecialista'
import ExplorarTalentos from './pages/ExplorarTalentos'
import Portfolio from './pages/Portfolio'
import PerfilEmpresa from './pages/PerfilEmpresa'
import Inbox from './pages/Inbox'
import Notificacoes from './pages/Notificacoes'
import Settings from './pages/Settings'
import Suporte from './pages/Suporte'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'

function DashboardRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (user.userType ?? user.type) === 'company'
    ? <DashboardEmpresa />
    : <DashboardEspecialista />
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      <Route path="/privacy" element={<Privacy />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/bidding/:projectId" element={<ProtectedRoute><Bidding /></ProtectedRoute>} />
      <Route path="/kanban/:projectId?" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
      <Route path="/financial" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><GanhosEspecialista /></ProtectedRoute>} />
      <Route path="/talents" element={<ProtectedRoute><ExplorarTalentos /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/profile/company/:id" element={<ProtectedRoute><PerfilEmpresa /></ProtectedRoute>} />
      <Route path="/profile/specialist/:id" element={<ProtectedRoute><PerfilEmpresa /></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Suporte /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
