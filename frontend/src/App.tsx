import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
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
import PerfilEspecialista from './pages/PerfilEspecialista'
import AvaliarPropostas from './pages/AvaliarPropostas'
import BuscarProjetos from './pages/BuscarProjetos'
import GerenciarSkills from './pages/GerenciarSkills'
import SignContract from './pages/SignContract'
import PasswordRecovery from './pages/PasswordRecovery'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

function DashboardRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const role = (user.userType ?? user.type).toLowerCase()
  return role === 'company'
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
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/bidding/:projectId" element={<ProtectedRoute><Bidding /></ProtectedRoute>} />
      <Route path="/projects/:projectId/bids" element={<ProtectedRoute><AvaliarPropostas /></ProtectedRoute>} />
      <Route path="/contract/:projectId" element={<ProtectedRoute><SignContract /></ProtectedRoute>} />
      <Route path="/kanban/:projectId?" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
      <Route path="/financial" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><GanhosEspecialista /></ProtectedRoute>} />
      <Route path="/talents" element={<ProtectedRoute><ExplorarTalentos /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/projects/browse" element={<ProtectedRoute><BuscarProjetos /></ProtectedRoute>} />
      <Route path="/profile/company/:id" element={<ProtectedRoute><PerfilEmpresa /></ProtectedRoute>} />
      <Route path="/profile/specialist/:id" element={<ProtectedRoute><PerfilEspecialista /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><GerenciarSkills /></ProtectedRoute>} />
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
