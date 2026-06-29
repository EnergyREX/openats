'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Users,
  ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Settings,
} from 'lucide-react'
import Divider from '../primitives/Divider'
import { logout as apiLogout } from '@/lib/api/auth'
import { useLocalStorageItem } from '@/hooks/useLocalStorage'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/backoffice/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/backoffice/jobs', label: 'Empleos', icon: Briefcase },
  { href: '/backoffice/candidates', label: 'Candidatos', icon: Users },
]

type Theme = 'dark' | 'light'

function getInitials(email: string | null): string {
  if (!email) return 'U'
  return email[0].toUpperCase()
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [collapsedRaw, setCollapsedRaw] = useLocalStorageItem('sidebar_collapsed')
  const [themeRaw, setThemeRaw] = useLocalStorageItem('theme')
  const [userEmail] = useLocalStorageItem('user_email')

  const collapsed = collapsedRaw === 'true'
  const theme: Theme = themeRaw === 'light' ? 'light' : 'dark'

  // Sincroniza el atributo del documento (sistema externo) con el tema actual.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleCollapsed = () => setCollapsedRaw(String(!collapsed))

  const toggleTheme = () => setThemeRaw(theme === 'dark' ? 'light' : 'dark')

  const logout = async () => {
    await apiLogout()
    router.push('/backoffice/login')
  }

  const iconBtn = `flex items-center rounded-md py-2 transition-colors text-text-secondary hover:bg-surface-overlay hover:text-text-primary ${collapsed ? 'justify-center px-2 w-full' : 'gap-3 px-3 w-full'}`

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} transition-[width] duration-300 ease-in-out min-h-screen bg-surface-raised border-r border-border-subtle flex flex-col shrink-0 overflow-hidden`}
    >
      {/* Header */}
      <div className="h-16 flex items-center border-border-subtle px-3 gap-2 shrink-0">
        {!collapsed && (
          <span className="font-display text-lg tracking-tight text-text-primary flex-1 whitespace-nowrap">
            Open<span className="text-interactive">ATS</span>
            <span className="text-emissive">.</span>
          </span>
        )}
        {collapsed && <div className="flex-1" />}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          className="p-1.5 rounded-md text-text-muted hover:bg-surface-overlay hover:text-text-primary transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

        <Divider orientation='horizontal' className='align-middle w-[80%]' />

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          if (item.disabled) {
            return (
              <div
                key={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-md py-2 text-sm text-text-muted cursor-not-allowed opacity-40 ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
              >
                <Icon size={18} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center rounded-md py-2 text-sm transition-colors ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} ${
                isActive
                  ? `bg-interactive/10 text-interactive font-medium ${!collapsed ? 'before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-interactive' : ''}`
                  : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-subtle px-2 py-3 space-y-1 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro') : undefined}
          className={`${iconBtn} text-sm`}
        >
          {theme === 'dark'
            ? <Sun size={18} className="shrink-0" />
            : <Moon size={18} className="shrink-0" />}
          {!collapsed && (
            <span className="whitespace-nowrap">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          )}
        </button>

        {/* Admin placeholder */}
        <button
          title={collapsed ? 'Administración' : undefined}
          className={`${iconBtn} text-sm`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Administración</span>}
        </button>

        {/* User row */}
        <div className={`flex items-center pt-2 mt-1 border-t border-border-subtle ${collapsed ? 'flex-col gap-2' : 'gap-2 px-1'}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-interactive/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-interactive">
              {getInitials(userEmail)}
            </span>
          </div>

          {!collapsed && (
            <>
              <span className="text-xs text-text-secondary flex-1 truncate min-w-0">
                {userEmail ?? 'Usuario'}
              </span>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-md text-text-muted hover:text-emissive hover:bg-surface-overlay transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </>
          )}

          {collapsed && (
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 rounded-md text-text-muted hover:text-emissive hover:bg-surface-overlay transition-colors"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
