import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary'
  children?: React.ReactNode
  showValue?: boolean
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  color = 'primary',
  children,
  showValue = false
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error',
    secondary: 'stroke-secondary'
  }

  const textColorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    secondary: 'text-secondary'
  }

  return (
    <div className={cn('progress-ring', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-ring-track"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('progress-ring-progress', colorClasses[color])}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? children : showValue && (
          <span className={cn('text-sm font-bold', textColorClasses[color])}>
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  )
}
