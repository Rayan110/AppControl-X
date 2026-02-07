import { useState } from 'react'
import type { AppInfo, AppAction } from '@/api/types'
import { bridge } from '@/api/bridge'
import { useAppStore } from '@/store/appStore'
import {
  X,
  Snowflake,
  Sun,
  Square,
  Trash2,
  Play,
  Settings,
  Package,
  HardDrive,
  Shield,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  app: AppInfo | null
}

export default function AppDetailSheet({ isOpen, onClose, app }: AppDetailSheetProps) {
  const { executionMode } = useAppStore()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen || !app) return null

  const canExecute = executionMode !== 'NONE'

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-error'
      case 'FORCE_STOP_ONLY': return 'text-warning'
      case 'WARNING': return 'text-warning'
      default: return 'text-success'
    }
  }

  const handleAction = async (action: AppAction) => {
    if (!canExecute) return
    setLoading(action)
    try {
      bridge.executeAction(app.packageName, action)
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    } finally {
      setLoading(null)
    }
  }

  const handleLaunch = () => {
    setLoading('LAUNCH')
    try {
      bridge.launchApp(app.packageName)
    } catch (error) {
      console.error('Failed to launch app:', error)
    } finally {
      setTimeout(() => setLoading(null), 500)
    }
  }

  const handleOpenSettings = () => {
    setLoading('SETTINGS')
    try {
      bridge.openAppSettings(app.packageName)
    } catch (error) {
      console.error('Failed to open settings:', error)
    } finally {
      setTimeout(() => setLoading(null), 500)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* App Icon */}
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
            {app.iconBase64 ? (
              <img
                src={`data:image/png;base64,${app.iconBase64}`}
                alt={app.appName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={32} className="text-text-muted" />
            )}
          </div>

          {/* App Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary truncate">{app.appName}</h2>
            <p className="text-xs text-text-muted font-mono truncate">{app.packageName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">
                v{app.versionName}
              </span>
              {app.isSystemApp && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  System
                </span>
              )}
              {app.isFrozen && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-info/10 text-info">
                  Frozen
                </span>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoItem
            icon={HardDrive}
            label="Size"
            value={formatSize(app.size)}
          />
          <InfoItem
            icon={Info}
            label="UID"
            value={app.uid.toString()}
          />
          <InfoItem
            icon={Shield}
            label="Safety"
            value={app.safetyLevel.replace('_', ' ')}
            valueClass={getSafetyColor(app.safetyLevel)}
          />
          <InfoItem
            icon={Package}
            label="Status"
            value={app.isEnabled ? 'Enabled' : 'Disabled'}
            valueClass={app.isEnabled ? 'text-success' : 'text-error'}
          />
        </div>

        {/* Background Status */}
        {app.isBackgroundRestricted && (
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-6">
            <p className="text-xs text-warning">Background activity is restricted for this app</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Actions
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {/* Freeze/Unfreeze */}
            {app.isFrozen ? (
              <ActionButton
                icon={Sun}
                label="Unfreeze"
                loading={loading === 'UNFREEZE'}
                disabled={!canExecute}
                onClick={() => handleAction('UNFREEZE')}
                color="success"
              />
            ) : (
              <ActionButton
                icon={Snowflake}
                label="Freeze"
                loading={loading === 'FREEZE'}
                disabled={!canExecute || app.safetyLevel === 'CRITICAL'}
                onClick={() => handleAction('FREEZE')}
                color="primary"
              />
            )}

            {/* Force Stop */}
            <ActionButton
              icon={Square}
              label="Force Stop"
              loading={loading === 'FORCE_STOP'}
              disabled={!canExecute}
              onClick={() => handleAction('FORCE_STOP')}
              color="warning"
            />

            {/* Launch */}
            <ActionButton
              icon={Play}
              label="Launch"
              loading={loading === 'LAUNCH'}
              disabled={app.isFrozen}
              onClick={handleLaunch}
              color="secondary"
            />

            {/* Settings */}
            <ActionButton
              icon={Settings}
              label="App Settings"
              loading={loading === 'SETTINGS'}
              onClick={handleOpenSettings}
            />

            {/* Uninstall */}
            {!app.isSystemApp && (
              <ActionButton
                icon={Trash2}
                label="Uninstall"
                loading={loading === 'UNINSTALL'}
                disabled={!canExecute}
                onClick={() => handleAction('UNINSTALL')}
                color="error"
                fullWidth
              />
            )}
          </div>
        </div>

        {/* Mode Warning */}
        {!canExecute && (
          <div className="mt-4 p-3 rounded-xl bg-surface">
            <p className="text-xs text-text-muted text-center">
              Enable Root or Shizuku mode in Settings to perform actions
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string
  valueClass?: string
}

function InfoItem({ icon: Icon, label, value, valueClass }: InfoItemProps) {
  return (
    <div className="p-3 rounded-xl bg-surface">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-text-muted" />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <p className={cn('text-sm font-medium', valueClass || 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}

interface ActionButtonProps {
  icon: React.ElementType
  label: string
  loading?: boolean
  disabled?: boolean
  onClick: () => void
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  fullWidth?: boolean
}

function ActionButton({
  icon: Icon,
  label,
  loading,
  disabled,
  onClick,
  color,
  fullWidth
}: ActionButtonProps) {
  const colorClass = color
    ? `text-${color} bg-${color}/10 hover:bg-${color}/20`
    : 'text-text-secondary bg-surface hover:bg-surface-hover'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 p-3 rounded-xl transition-colors',
        colorClass,
        disabled && 'opacity-50 cursor-not-allowed',
        fullWidth && 'col-span-2'
      )}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={16} />
      )}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
