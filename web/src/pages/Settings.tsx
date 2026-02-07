import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useThemeStore } from '@/store/themeStore'
import { bridge } from '@/api/bridge'
import PageContainer from '@/components/layout/PageContainer'
import { IconWrapper } from '@/components/ui/IconWrapper'
import {
  ChevronRight,
  Shield,
  Palette,
  Database,
  Info,
  Zap,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Check,
  RotateCcw,
  X,
  Snowflake,
  Play,
  StopCircle,
  Trash2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExecutionMode, ActionLog, AppAction } from '@/api/types'

type ModalType = 'mode' | 'accent' | 'animations' | 'actionHistory' | 'appInfo' | null

export default function Settings() {
  const {
    executionMode,
    setExecutionMode,
    detectExecutionMode,
    accessLost,
    clearAccessLost
  } = useAppStore()
  const { theme, toggleTheme } = useThemeStore()
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  const modeConfig = {
    ROOT: {
      label: 'Root Access',
      description: 'Full system control via Magisk/KernelSU',
      color: 'success' as const,
      icon: Zap
    },
    SHIZUKU: {
      label: 'Shizuku Mode',
      description: 'Shell access without root',
      color: 'primary' as const,
      icon: Shield
    },
    NONE: {
      label: 'View Only',
      description: 'No actions available',
      color: 'warning' as const,
      icon: Shield
    }
  }[executionMode]

  return (
    <PageContainer title="Settings" subtitle="App configuration">
      {/* Access Lost Warning */}
      {accessLost && (
        <div className="card p-4 mb-6 border-error/50 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-error-bg flex items-center justify-center">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-error">Access Lost</p>
              <p className="text-sm text-text-secondary">
                Root or Shizuku access was lost. Please check your permissions.
              </p>
            </div>
            <button
              onClick={() => {
                detectExecutionMode()
                clearAccessLost()
              }}
              className="btn-icon"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Configure app behavior</p>
      </div>

      <div className="space-y-6">
        {/* Execution Mode Section */}
        <section className="animate-fade-in-up">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            Execution Mode
          </h2>
          <button
            onClick={() => setOpenModal('mode')}
            className="card p-5 w-full text-left"
          >
            <div className="flex items-center gap-4">
              <IconWrapper icon={modeConfig.icon} color={modeConfig.color} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{modeConfig.label}</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {modeConfig.description}
                </p>
              </div>
              <ModeIndicator mode={executionMode} />
            </div>
          </button>
        </section>

        {/* Appearance Section */}
        <section className="animate-fade-in-up stagger-1">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            Appearance
          </h2>
          <div className="card overflow-hidden">
            <ThemeToggleItem
              theme={theme}
              onToggle={toggleTheme}
            />
            <SettingItem
              icon={Palette}
              iconColor="secondary"
              title="Accent Color"
              subtitle={theme === 'dark' ? 'Purple' : 'Green'}
              onClick={() => setOpenModal('accent')}
              showBorder
            />
            <SettingItem
              icon={Sparkles}
              iconColor="warning"
              title="Animations"
              subtitle={animationsEnabled ? 'Smooth transitions enabled' : 'Animations disabled'}
              onClick={() => setOpenModal('animations')}
            />
          </div>
        </section>

        {/* Data Section */}
        <section className="animate-fade-in-up stagger-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            Data Management
          </h2>
          <div className="card overflow-hidden">
            <SettingItem
              icon={Database}
              iconColor="primary"
              title="Action History"
              subtitle="View and rollback past actions"
              onClick={() => setOpenModal('actionHistory')}
              showBorder
            />
            <SettingItem
              icon={Info}
              iconColor="primary"
              title="App Information"
              subtitle="Version, licenses, and more"
              onClick={() => setOpenModal('appInfo')}
            />
          </div>
        </section>
      </div>

      {/* Modals */}
      <ExecutionModeModal
        isOpen={openModal === 'mode'}
        onClose={() => setOpenModal(null)}
        currentMode={executionMode}
        onModeChange={(mode) => {
          setExecutionMode(mode)
          setOpenModal(null)
        }}
        onRefresh={detectExecutionMode}
      />

      <AccentColorModal
        isOpen={openModal === 'accent'}
        onClose={() => setOpenModal(null)}
        theme={theme}
      />

      <AnimationsModal
        isOpen={openModal === 'animations'}
        onClose={() => setOpenModal(null)}
        enabled={animationsEnabled}
        onToggle={() => setAnimationsEnabled(!animationsEnabled)}
      />

      <ActionHistoryModal
        isOpen={openModal === 'actionHistory'}
        onClose={() => setOpenModal(null)}
      />

      <AppInfoModal
        isOpen={openModal === 'appInfo'}
        onClose={() => setOpenModal(null)}
      />
    </PageContainer>
  )
}

// ============ MODALS ============

interface ExecutionModeModalProps {
  isOpen: boolean
  onClose: () => void
  currentMode: ExecutionMode
  onModeChange: (mode: ExecutionMode) => void
  onRefresh: () => void
}

function ExecutionModeModal({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  onRefresh
}: ExecutionModeModalProps) {
  const modes: { mode: ExecutionMode; label: string; description: string; icon: React.ElementType; color: string }[] = [
    {
      mode: 'ROOT',
      label: 'Root Access',
      description: 'Full system control via Magisk/KernelSU',
      icon: Zap,
      color: 'success'
    },
    {
      mode: 'SHIZUKU',
      label: 'Shizuku',
      description: 'Shell access without root',
      icon: Shield,
      color: 'primary'
    },
    {
      mode: 'NONE',
      label: 'View Only',
      description: 'No system actions, read-only mode',
      icon: AlertTriangle,
      color: 'warning'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Shield size={28} strokeWidth={1.5} />
          </div>
          <h2 className="modal-title flex-1">Execution Mode</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm text-text-secondary mb-4">
            Select how AppControlX should interact with your system.
          </p>

          <div className="space-y-2">
            {modes.map(({ mode, label, description, icon: Icon, color }) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all',
                  'border flex items-center gap-4',
                  currentMode === mode
                    ? 'border-primary bg-primary-bg'
                    : 'border-card-border bg-surface hover:bg-surface-hover'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  color === 'success' && 'bg-success-bg text-success',
                  color === 'primary' && 'bg-primary-bg text-primary',
                  color === 'warning' && 'bg-warning-bg text-warning'
                )}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{label}</p>
                  <p className="text-sm text-text-muted">{description}</p>
                </div>
                {currentMode === mode && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onRefresh} className="btn btn-secondary">
            <RefreshCw size={16} />
            Detect
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function AccentColorModal({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void; theme: string }) {
  if (!isOpen) return null

  const colors = [
    { name: 'Green', color: '#22C55E', selected: theme === 'light' },
    { name: 'Purple', color: '#8B5CF6', selected: theme === 'dark' },
    { name: 'Blue', color: '#3B82F6', selected: false },
    { name: 'Orange', color: '#F97316', selected: false },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Palette size={28} strokeWidth={1.5} />
          </div>
          <h2 className="modal-title flex-1">Accent Color</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm text-text-secondary mb-4">
            Choose your preferred accent color. Colors are automatically set based on theme.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {colors.map(({ name, color, selected }) => (
              <button
                key={name}
                className={cn(
                  'p-4 rounded-xl border flex items-center gap-3 transition-all',
                  selected
                    ? 'border-primary bg-primary-bg'
                    : 'border-card-border bg-surface hover:bg-surface-hover'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-text-primary">{name}</span>
                {selected && (
                  <Check size={16} className="text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>

          <p className="text-xs text-text-muted mt-4 text-center">
            Light theme uses Green, Dark theme uses Purple
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function AnimationsModal({ isOpen, onClose, enabled, onToggle }: { isOpen: boolean; onClose: () => void; enabled: boolean; onToggle: () => void }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
          <h2 className="modal-title flex-1">Animations</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm text-text-secondary mb-4">
            Enable or disable smooth transitions and animations throughout the app.
          </p>

          <button
            onClick={onToggle}
            className="w-full p-4 rounded-xl border border-card-border bg-surface flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-text-primary">Enable Animations</p>
              <p className="text-sm text-text-muted">Smooth transitions and effects</p>
            </div>
            <div className={cn(
              'w-12 h-7 rounded-full p-1 transition-colors duration-200',
              enabled ? 'bg-primary' : 'bg-text-muted'
            )}>
              <div className={cn(
                'w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                enabled ? 'translate-x-5' : 'translate-x-0'
              )} />
            </div>
          </button>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionHistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { executeAction } = useAppStore()
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load action history when modal opens
  useEffect(() => {
    if (isOpen) {
      const logs = bridge.getActionHistory()
      setActionLogs(logs)
    }
  }, [isOpen])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'FREEZE': return Snowflake
      case 'UNFREEZE': return Play
      case 'FORCE_STOP': return StopCircle
      case 'CLEAR_CACHE':
      case 'CLEAR_DATA': return Trash2
      default: return Database
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'FREEZE': return 'text-primary bg-primary-bg'
      case 'UNFREEZE': return 'text-success bg-success-bg'
      case 'FORCE_STOP': return 'text-warning bg-warning-bg'
      case 'CLEAR_CACHE':
      case 'CLEAR_DATA': return 'text-error bg-error-bg'
      default: return 'text-text-muted bg-surface'
    }
  }

  const getReverseAction = (action: string): string | null => {
    switch (action) {
      case 'FREEZE': return 'UNFREEZE'
      case 'UNFREEZE': return 'FREEZE'
      default: return null // Can't rollback force stop, clear cache, etc.
    }
  }

  const handleRollback = async (log: ActionLog) => {
    const reverseAction = getReverseAction(log.action)
    if (!reverseAction) return

    setIsLoading(true)
    try {
      for (const pkg of log.packages) {
        await executeAction(pkg, reverseAction as AppAction)
      }
      // Refresh the logs
      const logs = bridge.getActionHistory()
      setActionLogs(logs)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Database size={28} strokeWidth={1.5} />
          </div>
          <h2 className="modal-title flex-1">Action History</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sm text-text-secondary mb-4">
            View past actions and rollback freeze/unfreeze operations.
          </p>

          {actionLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={48} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">No actions recorded yet</p>
              <p className="text-sm text-text-muted mt-1">
                Actions you perform on apps will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {actionLogs.map((log) => {
                const Icon = getActionIcon(log.action)
                const canRollback = getReverseAction(log.action) !== null

                return (
                  <div
                    key={log.id}
                    className={cn(
                      'p-3 rounded-xl border border-card-border bg-surface',
                      'flex items-center gap-3'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      getActionColor(log.action)
                    )}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary text-sm">
                          {log.action.replace('_', ' ')}
                        </p>
                        {!log.success && (
                          <span className="text-xs text-error">Failed</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted truncate">
                        {log.packages.length} app{log.packages.length > 1 ? 's' : ''}
                        {' • '}
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>

                    {canRollback && log.success && (
                      <button
                        onClick={() => handleRollback(log)}
                        disabled={isLoading}
                        className="btn-icon"
                        title="Rollback this action"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function AppInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Info size={28} strokeWidth={1.5} />
          </div>
          <h2 className="modal-title flex-1">App Information</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-3xl font-black text-white">A</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">AppControlX</h3>
              <p className="text-sm text-text-secondary">Version 3.0.0</p>
            </div>
          </div>

          <div className="space-y-2">
            <InfoRow label="Developer" value="AppControlX Team" />
            <InfoRow label="Build" value="2026.02.07" />
            <InfoRow label="Framework" value="React + Kotlin" />
            <InfoRow label="License" value="Apache 2.0" />
          </div>

          <p className="text-xs text-text-muted text-center pt-2">
            Made with care for Android power users
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-card-border last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}

// ============ COMPONENTS ============

interface ThemeToggleItemProps {
  theme: string
  onToggle: () => void
}

function ThemeToggleItem({ theme, onToggle }: ThemeToggleItemProps) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-4 p-4 text-left',
        'hover:bg-surface-hover transition-colors duration-200',
        'group border-b border-card-border'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        isDark ? 'bg-accent-purple/15 text-accent-purple' : 'bg-accent-yellow/15 text-accent-yellow'
      )}>
        {isDark ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">Theme</p>
        <p className="text-sm text-text-muted truncate">
          {isDark ? 'Dark mode' : 'Light mode'}
        </p>
      </div>
      <div className={cn(
        'w-12 h-7 rounded-full p-1 transition-colors duration-200',
        isDark ? 'bg-accent-purple' : 'bg-primary'
      )}>
        <div className={cn(
          'w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
          isDark ? 'translate-x-5' : 'translate-x-0'
        )} />
      </div>
    </button>
  )
}

interface SettingItemProps {
  icon: React.ElementType
  iconColor: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  title: string
  subtitle: string
  onClick: () => void
  showBorder?: boolean
}

function SettingItem({ icon: Icon, iconColor, title, subtitle, onClick, showBorder }: SettingItemProps) {
  const colorClasses = {
    primary: 'bg-primary-bg text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    error: 'bg-error-bg text-error'
  }[iconColor]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 text-left',
        'hover:bg-surface-hover transition-colors duration-200',
        'group',
        showBorder && 'border-b border-card-border'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        colorClasses
      )}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-muted truncate">{subtitle}</p>
      </div>
      <ChevronRight
        size={18}
        strokeWidth={1.5}
        className="text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-200"
      />
    </button>
  )
}

function ModeIndicator({ mode }: { mode: string }) {
  const config = {
    ROOT: { color: 'bg-success', glow: 'shadow-[0_0_12px_rgba(34,197,94,0.5)]' },
    SHIZUKU: { color: 'bg-primary', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.5)]' },
    NONE: { color: 'bg-warning', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.5)]' }
  }[mode] ?? { color: 'bg-text-muted', glow: '' }

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-3 h-3 rounded-full',
        config.color,
        config.glow,
        'animate-pulse'
      )} />
    </div>
  )
}
