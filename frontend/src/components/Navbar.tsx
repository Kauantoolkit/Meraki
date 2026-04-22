import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  TerminalSquare, ArrowLeft, Building2, User,
  Settings, Headphones, LogOut, ShieldAlert, Menu, X,
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

  const isCompany = (user?.userType ?? user?.type) === 'company'

  const navLinks = [
    { label: isCompany ? 'EMPRESA' : 'ESPECIALISTA', path: '/dashboard', roles: ['both'] },
    { label: 'TALENTOS',   path: '/talents',    roles: ['company'] },
    { label: 'PORTFÓLIO',  path: '/portfolio',  roles: ['specialist'] },
    { label: 'KANBAN',     path: '/kanban',     roles: ['both'] },
    { label: 'INBOX',      path: '/inbox',      roles: ['both'] },
    { label: 'FINANCEIRO', path: '/financial',  roles: ['company'] },
    { label: 'GANHOS',     path: '/earnings',   roles: ['specialist'] },
    { label: 'EVENTOS',    path: '/events',     roles: ['both'] },
    { label: 'SUPORTE',    path: '/support',    roles: ['both'] },
    { label: 'SETTINGS',   path: '/settings',   roles: ['both'] },
    { label: 'ADMIN',      path: '/admin',      roles: ['company'] },
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

            {/* User menu */}
            <div className="relative hidden xl:block">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
                    <button onClick={() => { navigate('/settings'); setDropdownOpen(false) }}
                      className="w-full text-left px-4 py-2 text-[10px] font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Configurações
                    </button>
                    <button onClick={() => { navigate('/support'); setDropdownOpen(false) }}
                      className="w-full text-left px-4 py-2 text-[10px] font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                      <Headphones className="w-3 h-3" /> Suporte Técnico
                    </button>
                    {isCompany && (
                      <button onClick={() => { navigate('/admin'); setDropdownOpen(false) }}
                        className="w-full text-left px-4 py-2 text-[10px] font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" /> Admin Panel
                      </button>
                    )}
                    <div className="border-t border-dark-border my-1" />
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[10px] font-mono text-zinc-400 hover:bg-red-500/10 hover:text-red-500 uppercase flex items-center gap-2">
                      <LogOut className="w-3 h-3" /> Sair / Logout
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
