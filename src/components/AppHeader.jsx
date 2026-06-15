import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Shared app header for all authenticated pages.
 *
 * Props:
 *   breadcrumbs: [{ label, href? }]  — shown after the logo
 *   actions: ReactNode                — optional right-side buttons (e.g. AI + Share)
 *   badge: ReactNode                  — optional badge next to user email (e.g. plan pill)
 */
export default function AppHeader({ breadcrumbs = [], actions, badge }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: logo + breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="font-display font-bold text-sm text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            vikku
          </button>
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
              {crumb.href && i < breadcrumbs.length - 1 ? (
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
          ))}
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}

          {badge}

          <span className="hidden sm:block text-xs text-white/30 truncate max-w-[160px]">
            {user?.email}
          </span>

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
