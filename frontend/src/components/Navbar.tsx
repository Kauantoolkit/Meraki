import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { notificationsApi, Notification as NotifType } from '../api/notifications'
import {
  TerminalSquare, ArrowLeft, Building2, User,
  LogOut, Menu, X, Bell,
} from 'lucide-react'

interface NavbarProps {
  backUrl?: string
  projectTitle?: string
}

export default function Navbar({ backUrl, projectTitle }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotifType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const isCompany = (user?.userType ?? user?.type)?.toLowerCase() === 'company'

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch { /* silently ignore */ }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  async function handleMarkAllRead() {
    await notificationsApi.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function handleMarkRead(id: string) {
    await notificationsApi.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const navLinks = [
    { label: isCompany ? 'EMPRESA' : 'ESPECIALISTA', path: '/dashboard',         roles: ['both'] },
    { label: 'TALENTOS',   path: '/talents',          roles: ['company'] },
    { label: 'PROJETOS',   path: '/projects/browse',  roles: ['specialist'] },
    { label: 'PORTFÓLIO',  path: '/portfolio',        roles: ['specialist'] },
    { label: 'FINANCEIRO', path: '/financial',        roles: ['company'] },
    { label: 'GANHOS',     path: '/earnings',         roles: ['specialist'] },
  ].filter(l =>
    l.roles.includes('both') ||
    (isCompany && l.roles.includes('company')) ||
    (!isCompany && l.roles.includes('specialist'))
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path)

  return (
    <nav className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 shrink-0">
            {backUrl && (
              <>
                <button
                  onClick={() => navigate(backUrl)}
                  className="w-7 h-7 flex items-center justify-center bg-dark-input border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="h-6 w-px bg-dark-border" />
              </>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-7 h-7 bg-brand-500/10 border border-brand-500 flex items-center justify-center">
                <TerminalSquare className="text-brand-500 w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <span className="font-mono font-bold text-white tracking-widest uppercase text-sm">Meraki</span>
            </div>
            {projectTitle && (
              <>
                <div className="h-6 w-px bg-dark-border hidden sm:block" />
                <span className="font-mono text-[10px] text-zinc-500 hidden sm:block uppercase tracking-wider">{projectTitle}</span>
              </>
            )}
          </div>

          {/* Nav Links — desktop */}
          <div className="hidden xl:flex items-center gap-0.5 overflow-x-auto flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.path + link.label}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold whitespace-nowrap transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-500 bg-dark-input border border-dark-border'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Mobile hamburger */}
            <button
              className="xl:hidden text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-dark-border hidden xl:block" />

            {/* Notification bell */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
                className="relative w-7 h-7 flex items-center justify-center bg-dark-input border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-dark-bg text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-dark-card border border-dark-border shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border">
                      <span className="text-[10px] font-mono font-bold text-white uppercase">Notificações</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9px] font-mono text-brand-500 hover:text-brand-400"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[10px] font-mono text-zinc-500">Nenhuma notificação.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkRead(n.id)}
                          className={`px-4 py-3 border-b border-dark-border cursor-pointer hover:bg-dark-input transition-colors ${!n.read ? 'bg-brand-500/5' : ''}`}
                        >
                          <p className="text-[11px] font-mono font-bold text-white">{n.title}</p>
                          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{n.message}</p>
                          <p className="text-[9px] font-mono text-zinc-600 mt-1">
                            {new Date(n.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative hidden xl:block">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-bold text-white uppercase group-hover:text-brand-500 transition-colors">
                    {user?.name ?? 'Usuário'}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500">
                    {isCompany ? 'Empresa' : 'Especialista'}
                  </p>
                </div>
                <div className="w-7 h-7 bg-dark-input border border-dark-border flex items-center justify-center group-hover:border-brand-500 transition-colors">
                  {isCompany
                    ? <Building2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-500" />
                    : <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-500" />
                  }
                </div>
              </div>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border shadow-2xl py-2 z-50">
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[10px] font-mono text-zinc-400 hover:bg-red-500/10 hover:text-red-500 uppercase flex items-center gap-2">
                      <LogOut className="w-3 h-3" /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-dark-border bg-dark-bg">
          <div className="px-4 py-3 grid grid-cols-3 gap-1">
            {navLinks.map(link => (
              <button
                key={link.path + link.label}
                onClick={() => { navigate(link.path); setMobileOpen(false) }}
                className={`px-2 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors text-center ${
                  isActive(link.path)
                    ? 'text-brand-500 bg-dark-input border border-dark-border'
                    : 'text-zinc-500 hover:text-white border border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="border-t border-dark-border px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{user?.name ?? 'Usuário'}</p>
              <p className="font-mono text-[10px] text-zinc-500">{isCompany ? 'Empresa' : 'Especialista'}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 hover:text-red-300 uppercase">
              <LogOut className="w-3 h-3" /> Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
