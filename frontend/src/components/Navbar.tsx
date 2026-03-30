import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  TerminalSquare, ArrowLeft, Bell, Mail, Building2, User,
  Settings, Headphones, LogOut, ShieldAlert,
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

  const isCompany = user?.type === 'company'

  const navLinks = [
    { label: '/HOME', path: isCompany ? '/dashboard' : '/dashboard' },
    { label: isCompany ? '/TALENTOS' : '/PORTFÓLIO', path: isCompany ? '/talents' : '/portfolio' },
    { label: '/KANBAN', path: '/kanban' },
    { label: '/FINANCEIRO', path: isCompany ? '/financial' : '/earnings' },
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left */}
          <div className="flex items-center gap-4">
            {backUrl && (
              <>
                <button
                  onClick={() => navigate(backUrl)}
                  className="w-8 h-8 flex items-center justify-center bg-dark-input border border-dark-border hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="h-8 w-px bg-dark-border" />
              </>
            )}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-brand-500/10 border border-brand-500 flex items-center justify-center">
                <TerminalSquare className="text-brand-500 w-4 h-4" strokeWidth={2} />
              </div>
              <span className="font-mono font-bold text-white tracking-widest uppercase">Meraki</span>
            </div>

            {projectTitle && (
              <>
                <div className="h-8 w-px bg-dark-border hidden sm:block" />
                <span className="font-mono text-xs text-zinc-500 hidden sm:block uppercase tracking-wider">{projectTitle}</span>
              </>
            )}
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 text-xs font-mono font-bold transition-colors ${
                  location.pathname === link.path
                    ? 'text-brand-500 bg-dark-input border border-dark-border'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/notifications')} className="text-zinc-400 hover:text-brand-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 border border-dark-bg" />
            </button>
            <button onClick={() => navigate('/inbox')} className="text-zinc-400 hover:text-brand-500 transition-colors">
              <Mail className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-dark-border" />

            {/* User menu */}
            <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white uppercase group-hover:text-brand-500 transition-colors">
                    {user?.name ?? 'Usuário'}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">ID: {user?.id?.slice(0, 8) ?? 'N/A'}</p>
                </div>
                <div className="w-8 h-8 bg-dark-input border border-dark-border flex items-center justify-center group-hover:border-brand-500 transition-colors">
                  {isCompany
                    ? <Building2 className="w-4 h-4 text-zinc-400 group-hover:text-brand-500" />
                    : <User className="w-4 h-4 text-zinc-400 group-hover:text-brand-500" />
                  }
                </div>
              </div>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border shadow-2xl py-2 z-50">
                    <button onClick={() => { navigate('/settings'); setDropdownOpen(false) }} className="w-full text-left px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Configurações
                    </button>
                    <button onClick={() => { navigate('/support'); setDropdownOpen(false) }} className="w-full text-left px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                      <Headphones className="w-3 h-3" /> Suporte Técnico
                    </button>
                    {isCompany && (
                      <button onClick={() => { navigate('/admin'); setDropdownOpen(false) }} className="w-full text-left px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-dark-hover hover:text-brand-500 uppercase flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" /> Admin Panel
                      </button>
                    )}
                    <div className="border-t border-dark-border my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-red-500/10 hover:text-red-500 uppercase flex items-center gap-2">
                      <LogOut className="w-3 h-3" /> Sair / Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  )
}
