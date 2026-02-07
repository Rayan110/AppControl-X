import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconWrapperProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

export function IconWrapper({ icon: Icon, size = 'md', color = 'primary', className }: IconWrapperProps) {
  const sizeClasses = {
    sm: 'icon-container-sm',
    md: 'icon-container-md',
    lg: 'icon-container-lg'
  }

  const colorClasses = {
    primary: 'bg-primary/15 text-primary-light',
    secondary: 'bg-secondary/15 text-secondary-light',
    success: 'bg-success/15 text-success-light',
    warning: 'bg-warning/15 text-warning-light',
    error: 'bg-error/15 text-error-light',
    neutral: 'bg-glass-light text-text-secondary'
  }

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26
  }

  return (
    <div className={cn(sizeClasses[size], colorClasses[color], className)}>
      <Icon size={iconSizes[size]} strokeWidth={1.5} />
    </div>
  )
}
