import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard } from 'lucide-react'
import AppHeader from '../../components/AppHeader'

const nav = [
  { label: 'Overview',  path: '/admin',          icon: LayoutDashboard },
  { label: 'Users',     path: '/admin/users',     icon: Users },
  { label: 'Billing',   path: '/admin/billing',   icon: CreditCard },
]

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumbs={[{ label: 'Admin' }]} />
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 gap-6">
        {/* Sidebar */}
        <aside className="w-44 flex-shrink-0 hidden sm:block">
          <div className="glass rounded-2xl p-2 sticky top-24">
            <p className="text-[9px] text-white/30 uppercase tracking-widest px-3 py-2">Admin</p>
            {nav.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-0.5 ${
                  pathname === path
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile tab row */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06] flex">
          {nav.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] ${
                pathname === path ? 'text-white' : 'text-white/40'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {title && (
            <h1 className="font-display font-bold text-lg text-white mb-5">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
