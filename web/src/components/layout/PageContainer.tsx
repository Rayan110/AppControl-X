import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  headerRight?: ReactNode
}

export default function PageContainer({
  children,
  title,
  subtitle,
  className,
  headerRight
}: PageContainerProps) {
  return (
    <div className={cn('px-4 py-6 safe-top animate-fade-in', className)}>
      {(title || headerRight) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  )
}
