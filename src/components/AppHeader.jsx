import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, ChevronLeft, UserCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './pm/NotificationBell'

/**
 * Shared app header for all authenticated pages.
 *
 * Props:
 *   breadcrumbs: [{ label, href? }]  - shown after the logo
 *   actions: ReactNode                - optional right-side buttons (e.g. AI + Share)
 *   badge: ReactNode                  - optional badge next to user email (e.g. plan pill)
 */
export default function AppHeader({ breadcrumbs = [], actions, badge }) {
  const { user, displayName, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: back arrow (mobile) + logo + breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Mobile back button - navigates to the last breadcrumb that has an href */}
          {(() => {
            const backCrumb = [...breadcrumbs].reverse().find((c) => c.href)
            return backCrumb ? (
              <button
                onClick={() => navigate(backCrumb.href)}
                className="sm:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                aria-label="Back"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null
          })()}
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-sm text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            vikku
          </button>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <div key={i} className={`flex items-center gap-1.5 min-w-0 ${!isLast ? 'hidden sm:flex' : ''}`}>
                <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
                {crumb.href && !isLast ? (
                  <button
                    onClick={() => navigate(crumb.href)}
                    className="text-sm text-white/50 hover:text-white transition-colors truncate"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-white truncate">{crumb.label}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {actions}

          {badge}

          <NotificationBell />

          <button
            onClick={() => navigate('/account')}
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
            title={user?.email}
          >
            <UserCircle size={15} />
            <span className="truncate max-w-[120px]">{displayName || user?.email?.split('@')[0]}</span>
          </button>

          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
