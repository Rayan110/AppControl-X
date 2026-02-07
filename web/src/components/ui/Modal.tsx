import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: React.ElementType
  children: React.ReactNode
  showSettings?: boolean
  onSettings?: () => void
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  showSettings = false,
  onSettings
}: ModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content animate-scale-in">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon">
            <Icon size={28} strokeWidth={1.5} />
          </div>
          <h2 id="modal-title" className="modal-title flex-1">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary px-6">
            Cancel
          </button>
          {showSettings && (
            <button onClick={onSettings} className="btn-primary px-6">
              Settings
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Progress bar component for modals
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  valueLabel?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  showLabels?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  label,
  valueLabel,
  color = 'primary',
  showLabels = true
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
  }

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-primary font-medium">{valueLabel}</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className={cn('progress-bar-fill', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Info row component for modals
interface InfoRowProps {
  label: string
  value: string | number
  icon?: React.ElementType
  valueColor?: 'primary' | 'success' | 'warning' | 'error' | 'muted'
}

export function InfoRow({ label, value, icon: Icon, valueColor }: InfoRowProps) {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    muted: 'text-text-muted'
  }

  return (
    <div className="flex justify-between items-center py-2.5 border-b border-card-border last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-text-muted" />}
        <span className="text-text-secondary">{label}</span>
      </div>
      <span className={cn('font-medium', valueColor ? colorClasses[valueColor] : 'text-text-primary')}>
        {value}
      </span>
    </div>
  )
}

// Storage breakdown dot indicator
interface StorageDotProps {
  color: string
  label: string
  value: string
}

export function StorageDot({ color, label, value }: StorageDotProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary ml-auto">{value}</span>
    </div>
  )
}

// Section header for modals
interface SectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 mt-4 first:mt-0">
      {title}
    </h3>
  )
}
