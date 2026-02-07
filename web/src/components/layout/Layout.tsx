import { ReactNode } from 'react'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="mesh-background" />

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
