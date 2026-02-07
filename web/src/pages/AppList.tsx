import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import PageContainer from '@/components/layout/PageContainer'
import AppDetailSheet from '@/components/apps/AppDetailSheet'
import { SkeletonAppItem } from '@/components/ui/Skeleton'
import {
  Search,
  CheckSquare,
  Square,
  X,
  Snowflake,
  StopCircle,
  MoreVertical,
  Package,
  Smartphone,
  Trash2,
  Sun
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import type { AppInfo } from '@/api/types'

type FilterTab = 'all' | 'user' | 'system' | 'frozen'

export default function AppList() {
  const {
    apps,
    isLoading,
    selectedApps,
    isSelectionMode,
    toggleAppSelection,
    setSelectionMode,
    clearSelection
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleAppClick = (app: AppInfo) => {
    if (!isSelectionMode) {
      setSelectedApp(app)
      setIsDetailOpen(true)
    }
  }

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !app.appName.toLowerCase().includes(query) &&
          !app.packageName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Tab filter
      switch (activeTab) {
        case 'user':
          return !app.isSystemApp
        case 'system':
          return app.isSystemApp
        case 'frozen':
          return !app.isEnabled
        case 'all':
        default:
          return true
      }
    })
  }, [apps, activeTab, searchQuery])

  // Count apps by category
  const counts = useMemo(() => ({
    all: apps.length,
    user: apps.filter(a => !a.isSystemApp).length,
    system: apps.filter(a => a.isSystemApp).length,
    frozen: apps.filter(a => !a.isEnabled).length
  }), [apps])

  return (
    <PageContainer
      title="Apps"
      headerRight={
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <button onClick={clearSelection} className="btn-icon">
              <X size={20} strokeWidth={1.5} />
            </button>
          ) : (
            <button onClick={() => setSelectionMode(true)} className="btn-icon">
              <CheckSquare size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>
      }
    >
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search
          size={18}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-11 pr-4"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface"
          >
            <X size={16} className="text-text-muted" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <TabButton
          icon={Package}
          label="All"
          count={counts.all}
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />
        <TabButton
          icon={Smartphone}
          label="User"
          count={counts.user}
          active={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
        />
        <TabButton
          icon={Package}
          label="System"
          count={counts.system}
          active={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
        />
        <TabButton
          icon={Snowflake}
          label="Frozen"
          count={counts.frozen}
          active={activeTab === 'frozen'}
          onClick={() => setActiveTab('frozen')}
          variant="accent"
        />
      </div>

      {/* Selection Actions */}
      {isSelectionMode && selectedApps.size > 0 && (
        <div className="card p-4 mb-4 animate-slide-up border-primary/30">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckSquare size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">{selectedApps.size} apps selected</p>
                <p className="text-xs text-text-muted">Choose an action below</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={Snowflake}
              label="Freeze"
              description="Disable selected apps"
              color="primary"
              onClick={() => {}}
            />
            <ActionButton
              icon={Sun}
              label="Unfreeze"
              description="Enable frozen apps"
              color="success"
              onClick={() => {}}
            />
            <ActionButton
              icon={StopCircle}
              label="Force Stop"
              description="Kill running apps"
              color="warning"
              onClick={() => {}}
            />
            <ActionButton
              icon={Trash2}
              label="Uninstall"
              description="Remove from device"
              color="error"
              onClick={() => {}}
            />
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-muted">
          {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'}
        </span>
      </div>

      {/* App List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonAppItem key={i} />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <Package size={32} className="text-text-muted" strokeWidth={1} />
          </div>
          <p className="text-text-secondary font-medium">No apps found</p>
          <p className="text-sm text-text-muted mt-1">
            {searchQuery ? 'Try a different search term' : 'No apps in this category'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApps.map((app, index) => (
            <AppItem
              key={app.packageName}
              app={app}
              isSelected={selectedApps.has(app.packageName)}
              isSelectionMode={isSelectionMode}
              onSelect={() => toggleAppSelection(app.packageName)}
              onClick={() => handleAppClick(app)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* App Detail Sheet */}
      <AppDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        app={selectedApp}
      />
    </PageContainer>
  )
}

interface ActionButtonProps {
  icon: React.ElementType
  label: string
  description: string
  color: 'primary' | 'success' | 'warning' | 'error'
  onClick: () => void
}

function ActionButton({ icon: Icon, label, description, color, onClick }: ActionButtonProps) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    error: 'bg-error/10 text-error border-error/20 hover:bg-error/20'
  }

  const iconBgStyles = {
    primary: 'bg-primary/20',
    success: 'bg-success/20',
    warning: 'bg-warning/20',
    error: 'bg-error/20'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
        'active:scale-[0.98]',
        colorStyles[color]
      )}
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBgStyles[color])}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs opacity-70 truncate">{description}</p>
      </div>
    </button>
  )
}

interface TabButtonProps {
  icon: React.ElementType
  label: string
  count: number
  active: boolean
  onClick: () => void
  variant?: 'default' | 'accent'
}

function TabButton({ icon: Icon, label, count, active, onClick, variant = 'default' }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap',
        'transition-all duration-200 border',
        active
          ? variant === 'accent'
            ? 'bg-secondary/10 text-secondary border-secondary/30'
            : 'bg-primary/10 text-primary border-primary/30'
          : 'bg-surface text-text-secondary border-card-border hover:bg-surface-hover'
      )}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span>{label}</span>
      <span className={cn(
        'px-1.5 py-0.5 rounded-md text-xs',
        active
          ? variant === 'accent'
            ? 'bg-secondary/20 text-secondary'
            : 'bg-primary/20 text-primary'
          : 'bg-card-border/50 text-text-muted'
      )}>
        {count}
      </span>
    </button>
  )
}

interface AppItemProps {
  app: AppInfo
  isSelected: boolean
  isSelectionMode: boolean
  onSelect: () => void
  onClick: () => void
  index: number
}

function AppItem({ app, isSelected, isSelectionMode, onSelect, onClick, index }: AppItemProps) {
  const handleClick = () => {
    if (isSelectionMode) {
      onSelect()
    } else {
      onClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'card p-3 flex items-center gap-3 cursor-pointer',
        'animate-fade-in-up',
        isSelected && 'ring-2 ring-primary border-primary/30',
        !app.isEnabled && 'opacity-60',
        'active:scale-[0.98]'
      )}
      style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <CheckSquare size={14} className="text-white" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md bg-surface border border-card-border flex items-center justify-center">
              <Square size={14} className="text-text-muted" strokeWidth={1.5} />
            </div>
          )}
        </div>
      )}

      {/* App Icon */}
      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
        {app.iconBase64 ? (
          <img
            src={`data:image/png;base64,${app.iconBase64}`}
            alt={app.appName}
            className="w-10 h-10 rounded-lg"
          />
        ) : (
          <span className="text-lg font-bold text-text-muted">
            {app.appName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary truncate text-sm">{app.appName}</p>
          {!app.isEnabled && (
            <Snowflake size={12} className="text-secondary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-muted truncate mt-0.5">
          {app.packageName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-text-muted">v{app.versionName}</span>
          <span className="w-1 h-1 rounded-full bg-text-muted/50" />
          <span className="text-xs text-text-muted">{formatBytes(app.size)}</span>
          {app.isSystemApp && (
            <>
              <span className="w-1 h-1 rounded-full bg-text-muted/50" />
              <span className="text-xs text-warning">System</span>
            </>
          )}
        </div>
      </div>

      {/* Action button */}
      {!isSelectionMode && (
        <button className="btn-icon flex-shrink-0 w-8 h-8">
          <MoreVertical size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
