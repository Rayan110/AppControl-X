import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wrench, Settings, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

const navItems = [
  { path: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
  { path: ROUTES.TOOLS, icon: Wrench, label: 'Tools' },
  { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
  { path: ROUTES.ABOUT, icon: Info, label: 'About' }
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="floating-dock z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path === ROUTES.TOOLS && location.pathname === '/apps')
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-16 h-14 rounded-2xl',
                'transition-all duration-300 ease-spring',
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-glow-sm" />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  'transition-all duration-300',
                  isActive && 'scale-110'
                )}
              />
              <span className={cn(
                'text-2xs mt-1 font-medium transition-opacity duration-300',
                isActive ? 'opacity-100' : 'opacity-70'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
