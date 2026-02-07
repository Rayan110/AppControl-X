import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import PageContainer from '@/components/layout/PageContainer'
import { SkeletonAppItem } from '@/components/ui/Skeleton'
import {
  Search,
  SlidersHorizontal,
  CheckSquare,
  Square,
  X,
  Snowflake,
  StopCircle,
  MoreVertical
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import type { AppInfo } from '@/api/types'

export default function AppList() {
  const {
    apps,
    isLoading,
    filter,
    setFilter,
    selectedApps,
    isSelectionMode,
    toggleAppSelection,
    setSelectionMode,
    clearSelection
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !app.appName.toLowerCase().includes(query) &&
          !app.packageName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      if (!filter.showSystemApps && app.isSystemApp) return false
      if (!filter.showUserApps && !app.isSystemApp) return false
      if (filter.showEnabledOnly && !app.isEnabled) return false
      if (filter.showDisabledOnly && app.isEnabled) return false

      return true
    })
  }, [apps, filter, searchQuery])

  return (
    <PageContainer
      title="Apps"
      subtitle={`${filteredApps.length} of ${apps.length} apps`}
      headerRight={
        <div className="flex items-center gap-2">
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
      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
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
            className="input pl-11"
          />
        </div>
        <button className="btn-icon">
          <SlidersHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar">
        <FilterChip
          label="All"
          active={filter.showUserApps && filter.showSystemApps}
          onClick={() => setFilter({ showUserApps: true, showSystemApps: true })}
        />
        <FilterChip
          label="User"
          active={filter.showUserApps && !filter.showSystemApps}
          onClick={() => setFilter({ showUserApps: true, showSystemApps: false })}
        />
        <FilterChip
          label="System"
          active={filter.showSystemApps && !filter.showUserApps}
          onClick={() => setFilter({ showUserApps: false, showSystemApps: true })}
        />
        <div className="w-px h-6 bg-card-border self-center mx-1" />
        <FilterChip
          label="Frozen"
          active={filter.showDisabledOnly}
          onClick={() => setFilter({ showDisabledOnly: !filter.showDisabledOnly })}
          variant="secondary"
        />
      </div>

      {/* Selection Actions */}
      {isSelectionMode && selectedApps.size > 0 && (
        <div className="card p-4 mb-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {selectedApps.size} selected
            </span>
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2 px-4">
                <Snowflake size={16} strokeWidth={1.5} />
                Freeze
              </button>
              <button className="btn-secondary text-sm py-2 px-4">
                <StopCircle size={16} strokeWidth={1.5} />
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonAppItem key={i} />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted">No apps found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app, index) => (
            <AppItem
              key={app.packageName}
              app={app}
              isSelected={selectedApps.has(app.packageName)}
              isSelectionMode={isSelectionMode}
              onSelect={() => toggleAppSelection(app.packageName)}
              index={index}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

function FilterChip({ label, active, onClick, variant = 'primary' }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
        'transition-all duration-200',
        'border',
        active
          ? variant === 'primary'
            ? 'bg-primary text-white border-primary'
            : 'bg-primary-bg text-primary border-primary/30'
          : 'bg-surface text-text-secondary border-card-border hover:bg-surface-hover'
      )}
    >
      {label}
    </button>
  )
}

interface AppItemProps {
  app: AppInfo
  isSelected: boolean
  isSelectionMode: boolean
  onSelect: () => void
  index: number
}

function AppItem({ app, isSelected, isSelectionMode, onSelect, index }: AppItemProps) {
  return (
    <div
      onClick={isSelectionMode ? onSelect : undefined}
      className={cn(
        'card p-4 flex items-center gap-4',
        'animate-fade-in-up',
        isSelected && 'ring-2 ring-primary border-primary/30',
        !app.isEnabled && 'opacity-60',
        isSelectionMode && 'cursor-pointer'
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare size={16} className="text-white" strokeWidth={2} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-surface border border-card-border flex items-center justify-center">
              <Square size={16} className="text-text-muted" strokeWidth={1.5} />
            </div>
          )}
        </div>
      )}

      {/* App Icon */}
      <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
        {app.iconBase64 ? (
          <img
            src={`data:image/png;base64,${app.iconBase64}`}
            alt={app.appName}
            className="w-11 h-11 rounded-xl"
          />
        ) : (
          <span className="text-xl font-bold text-text-muted">
            {app.appName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-text-primary truncate">{app.appName}</p>
          {app.isSystemApp && (
            <span className="badge-neutral text-2xs">System</span>
          )}
          {!app.isEnabled && (
            <span className="badge-primary text-2xs">
              <Snowflake size={10} />
              Frozen
            </span>
          )}
        </div>
        <p className="text-sm text-text-muted truncate mt-0.5">
          {app.packageName}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-text-muted">v{app.versionName}</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span className="text-xs text-text-muted">{formatBytes(app.size)}</span>
        </div>
      </div>

      {/* Action button */}
      {!isSelectionMode && (
        <button className="btn-icon flex-shrink-0">
          <MoreVertical size={18} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
