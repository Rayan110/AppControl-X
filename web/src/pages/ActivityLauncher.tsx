import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { bridge } from '@/api/bridge'
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Play,
  ArrowLeft,
  Package,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppActivities {
  packageName: string
  appName: string
  iconBase64?: string
  isSystem: boolean
  activities: string[]
}

type FilterType = 'all' | 'user' | 'system'

export default function ActivityLauncher() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<AppActivities[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('user')
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set())
  const [launchingActivity, setLaunchingActivity] = useState<string | null>(null)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = () => {
    setLoading(true)
    try {
      const result = bridge.getActivities()
      setApps(result)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Filter by type
      if (filter === 'user' && app.isSystem) return false
      if (filter === 'system' && !app.isSystem) return false

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesApp = app.appName.toLowerCase().includes(searchLower) ||
          app.packageName.toLowerCase().includes(searchLower)
        const matchesActivity = app.activities.some(a =>
          a.toLowerCase().includes(searchLower)
        )
        return matchesApp || matchesActivity
      }

      return true
    })
  }, [apps, filter, search])

  const counts = useMemo(() => ({
    all: apps.length,
    user: apps.filter(a => !a.isSystem).length,
    system: apps.filter(a => a.isSystem).length,
    activities: apps.reduce((sum, a) => sum + a.activities.length, 0)
  }), [apps])

  const toggleExpanded = (packageName: string) => {
    setExpandedApps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(packageName)) {
        newSet.delete(packageName)
      } else {
        newSet.add(packageName)
      }
      return newSet
    })
  }

  const handleLaunchActivity = async (packageName: string, activityName: string) => {
    const key = `${packageName}/${activityName}`
    setLaunchingActivity(key)
    try {
      bridge.launchActivity(packageName, activityName)
    } catch (error) {
      console.error('Failed to launch activity:', error)
    } finally {
      setTimeout(() => setLaunchingActivity(null), 500)
    }
  }

  const getShortActivityName = (fullName: string, packageName: string) => {
    if (fullName.startsWith(packageName)) {
      return fullName.substring(packageName.length)
    }
    return fullName
  }

  const headerRight = (
    <button
      onClick={() => navigate('/tools')}
      className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center"
    >
      <ArrowLeft size={18} className="text-text-secondary" />
    </button>
  )

  return (
    <PageContainer title="Activity Launcher" headerRight={headerRight}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative animate-fade-in">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search apps or activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <FilterTab
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            icon={Package}
            label="All"
            count={counts.all}
          />
          <FilterTab
            active={filter === 'user'}
            onClick={() => setFilter('user')}
            icon={Package}
            label="User"
            count={counts.user}
          />
          <FilterTab
            active={filter === 'system'}
            onClick={() => setFilter('system')}
            icon={Monitor}
            label="System"
            count={counts.system}
          />
        </div>

        {/* Stats */}
        <div className="text-xs text-text-muted px-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {filteredApps.length} apps, {filteredApps.reduce((sum, a) => sum + a.activities.length, 0)} activities
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* App List */}
        {!loading && (
          <div className="space-y-2">
            {filteredApps.map((app, index) => (
              <AppActivityCard
                key={app.packageName}
                app={app}
                expanded={expandedApps.has(app.packageName)}
                onToggle={() => toggleExpanded(app.packageName)}
                onLaunch={handleLaunchActivity}
                launchingActivity={launchingActivity}
                getShortName={getShortActivityName}
                style={{ animationDelay: `${150 + index * 30}ms` }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApps.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <Play size={48} className="mx-auto mb-3 opacity-30" />
            <p>No activities found</p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

interface FilterTabProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  count: number
}

function FilterTab({ active, onClick, icon: Icon, label, count }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
        active
          ? 'bg-primary text-white'
          : 'bg-surface text-text-secondary hover:bg-surface-hover'
      )}
    >
      <Icon size={14} />
      <span>{label}</span>
      <span className={cn(
        'text-xs px-1.5 py-0.5 rounded-md',
        active ? 'bg-white/20' : 'bg-card-border'
      )}>
        {count}
      </span>
    </button>
  )
}

interface AppActivityCardProps {
  app: AppActivities
  expanded: boolean
  onToggle: () => void
  onLaunch: (packageName: string, activityName: string) => void
  launchingActivity: string | null
  getShortName: (fullName: string, packageName: string) => string
  style?: React.CSSProperties
}

function AppActivityCard({
  app,
  expanded,
  onToggle,
  onLaunch,
  launchingActivity,
  getShortName,
  style
}: AppActivityCardProps) {
  return (
    <div className="card overflow-hidden animate-fade-in-up" style={style}>
      {/* App Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-surface-hover transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
          {app.iconBase64 ? (
            <img
              src={`data:image/png;base64,${app.iconBase64}`}
              alt={app.appName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package size={20} className="text-text-secondary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{app.appName}</p>
          <p className="text-xs text-text-muted truncate">{app.packageName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-lg">
            {app.activities.length}
          </span>
          {expanded ? (
            <ChevronDown size={18} className="text-text-muted" />
          ) : (
            <ChevronRight size={18} className="text-text-muted" />
          )}
        </div>
      </button>

      {/* Activities List */}
      {expanded && (
        <div className="border-t border-card-border">
          {app.activities.map((activity, index) => {
            const key = `${app.packageName}/${activity}`
            const isLaunching = launchingActivity === key
            const shortName = getShortName(activity, app.packageName)

            return (
              <button
                key={activity}
                onClick={() => onLaunch(app.packageName, activity)}
                disabled={isLaunching}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3 text-left',
                  'hover:bg-surface-hover transition-colors',
                  index < app.activities.length - 1 && 'border-b border-card-border/50'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Play size={14} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-mono truncate">
                    {shortName}
                  </p>
                </div>
                {isLaunching && (
                  <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
