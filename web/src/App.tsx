import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAppStore } from '@/store/appStore'
import { useThemeStore } from '@/store/themeStore'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import { SkeletonPage } from '@/components/ui/Skeleton'

// Lazy load non-critical pages
const AppList = lazy(() => import('@/pages/AppList'))
const Tools = lazy(() => import('@/pages/Tools'))
const ActivityLauncher = lazy(() => import('@/pages/ActivityLauncher'))
const Settings = lazy(() => import('@/pages/Settings'))
const About = lazy(() => import('@/pages/About'))
const Setup = lazy(() => import('@/pages/Setup'))

function AppRoutes() {
  const { isFirstLaunch } = useThemeStore()

  // Show setup for first launch
  if (isFirstLaunch) {
    return (
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Layout>
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/apps" element={<AppList />} />
          <Route path="/activity-launcher" element={<ActivityLauncher />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/setup" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default function App() {
  const { initializeApp } = useAppStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
