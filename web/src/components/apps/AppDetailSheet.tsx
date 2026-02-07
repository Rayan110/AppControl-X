import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Package,
  HardDrive,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronUp,
  FileText,
  Key,
  Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  app: AppInfo | null
}

export default function AppDetailSheet({ isOpen, onClose, app }: AppDetailSheetProps) {
  const navigate = useNavigate()
  const { executionMode } = useAppStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showBackgroundOps, setShowBackgroundOps] = useState(false)

  if (!isOpen || !app) return null

  const canExecute = executionMode !== 'NONE'

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const handleAction = async (action: AppAction) => {
    if (!canExecute) {
      setShowAccessModal(true)
      return
    }
    setLoading(action)
    try {
      if (action === 'CLEAR_CACHE') {
        bridge.clearCache(app.packageName)
      } else if (action === 'CLEAR_DATA') {
        bridge.clearData(app.packageName)
      } else {
        bridge.executeAction(app.packageName, action)
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    } finally {
      setTimeout(() => setLoading(null), 500)
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
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 999 }}>
        <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            {/* App Icon */}
            <div className="w-16 h-16 flex-shrink-0">
              {app.iconBase64 ? (
                <img
                  src={`data:image/png;base64,${app.iconBase64}`}
                  alt={app.appName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center">
                  <Package size={32} className="text-text-muted" />
                </div>
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
                {app.isSystemApp ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-text-muted/10 text-text-muted">
                    System App
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    User App
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
              className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <X size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <InfoItem
              icon={HardDrive}
              label="App Size"
              value={formatSize(app.size)}
            />
            {app.installPath && (
              <InfoItem
                icon={FileText}
                label="Install Path"
                value={app.installPath}
                valueClass="text-xs font-mono truncate"
              />
            )}
            {app.targetSdk && (
              <InfoItem
                icon={Cpu}
                label="Target SDK"
                value={`API ${app.targetSdk}`}
              />
            )}
            {app.minSdk && (
              <InfoItem
                icon={Cpu}
                label="Min SDK"
                value={`API ${app.minSdk}`}
              />
            )}
            {app.permissions !== undefined && (
              <InfoItem
                icon={Key}
                label="Permissions"
                value={`${app.permissions} permissions`}
              />
            )}
          </div>

          {/* Background State Section */}
          {app.backgroundOps && (
            <div className="mb-6">
              <button
                onClick={() => setShowBackgroundOps(!showBackgroundOps)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">Background State</span>
                </div>
                {showBackgroundOps ? (
                  <ChevronUp size={16} className="text-text-muted" />
                ) : (
                  <ChevronDown size={16} className="text-text-muted" />
                )}
              </button>

              {showBackgroundOps && (
                <div className="mt-2 p-4 rounded-xl bg-surface space-y-3 animate-slide-down">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">RUN_IN_BACKGROUND</span>
                    <span className={cn(
                      "text-sm font-medium",
                      app.backgroundOps.runInBackground === 'allow' ? 'text-success' :
                      app.backgroundOps.runInBackground === 'deny' ? 'text-error' :
                      'text-warning'
                    )}>
                      {app.backgroundOps.runInBackground}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">RUN_ANY_IN_BACKGROUND</span>
                    <span className={cn(
                      "text-sm font-medium",
                      app.backgroundOps.runAnyInBackground === 'allow' ? 'text-success' :
                      app.backgroundOps.runAnyInBackground === 'deny' ? 'text-error' :
                      'text-warning'
                    )}>
                      {app.backgroundOps.runAnyInBackground}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted italic">
                    This value may reset itself, this is normal.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Quick Actions
            </h3>

            {/* Primary Actions - 3 columns */}
            <div className="grid grid-cols-3 gap-2">
              {/* Force Stop */}
              <ActionButton
                icon={Square}
                label="Force Stop"
                loading={loading === 'FORCE_STOP'}
                onClick={() => handleAction('FORCE_STOP')}
                color="warning"
              />

              {/* Freeze/Unfreeze */}
              {app.isFrozen ? (
                <ActionButton
                  icon={Sun}
                  label="Unfreeze"
                  loading={loading === 'UNFREEZE'}
                  onClick={() => handleAction('UNFREEZE')}
                  color="success"
                />
              ) : (
                <ActionButton
                  icon={Snowflake}
                  label="Freeze"
                  loading={loading === 'FREEZE'}
                  disabled={app.safetyLevel === 'CRITICAL'}
                  onClick={() => handleAction('FREEZE')}
                  color="primary"
                />
              )}

              {/* Restrict/Allow Background */}
              {app.isBackgroundRestricted ? (
                <ActionButton
                  icon={ShieldCheck}
                  label="Allow Bg"
                  loading={loading === 'ALLOW_BACKGROUND'}
                  onClick={() => handleAction('ALLOW_BACKGROUND')}
                  color="success"
                />
              ) : (
                <ActionButton
                  icon={ShieldAlert}
                  label="Restrict Bg"
                  loading={loading === 'RESTRICT_BACKGROUND'}
                  onClick={() => handleAction('RESTRICT_BACKGROUND')}
                  color="warning"
                />
              )}

              {/* Clear Cache */}
              <ActionButton
                icon={Trash2}
                label="Clear Cache"
                loading={loading === 'CLEAR_CACHE'}
                onClick={() => handleAction('CLEAR_CACHE')}
                color="secondary"
              />

              {/* Clear Data */}
              <ActionButton
                icon={Database}
                label="Clear Data"
                loading={loading === 'CLEAR_DATA'}
                onClick={() => handleAction('CLEAR_DATA')}
                color="warning"
              />

              {/* Uninstall */}
              {!app.isSystemApp && (
                <ActionButton
                  icon={Trash2}
                  label="Uninstall"
                  loading={loading === 'UNINSTALL'}
                  onClick={() => handleAction('UNINSTALL')}
                  color="error"
                />
              )}
            </div>

            {/* Secondary Actions - 2 columns */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {/* App Info */}
              <ActionButton
                icon={Info}
                label="App Info"
                loading={loading === 'SETTINGS'}
                onClick={handleOpenSettings}
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
            </div>
          </div>
        </div>
      </div>

      {/* Access Denied Modal */}
      {showAccessModal && (
        <div className="modal-overlay" onClick={() => setShowAccessModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal-content max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Shield size={24} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Access Required</h3>
                <p className="text-sm text-text-muted mt-2">
                  This action requires Root or Shizuku access. Please configure your execution mode in Settings.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAccessModal(false)
                    onClose()
                    navigate('/settings')
                  }}
                  className="btn btn-primary flex-1"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
    <div className="p-3 rounded-xl bg-surface col-span-2">
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
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default'
}

function ActionButton({
  icon: Icon,
  label,
  loading,
  disabled,
  onClick,
  color = 'default'
}: ActionButtonProps) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
    success: 'bg-success/10 text-success hover:bg-success/20',
    warning: 'bg-warning/10 text-warning hover:bg-warning/20',
    error: 'bg-error/10 text-error hover:bg-error/20',
    default: 'bg-surface text-text-secondary hover:bg-surface-hover'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200',
        colorStyles[color],
        disabled && 'opacity-50 cursor-not-allowed',
        'active:scale-[0.95]'
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={18} strokeWidth={1.5} />
      )}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
