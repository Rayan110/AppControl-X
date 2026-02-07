import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  title: string
  className?: string
  headerRight?: ReactNode
}

export default function PageContainer({
  children,
  title,
  className,
  headerRight
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {/* Page Title Bar - sticky, fixed height */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-background border-b border-card-border safe-top">
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        <div className="flex items-center gap-2">
          {headerRight}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 animate-fade-in">
        {children}
      </div>
    </div>
  )
}
