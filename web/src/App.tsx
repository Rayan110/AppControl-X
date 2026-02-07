import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useThemeStore } from '@/store/themeStore'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import AppList from '@/pages/AppList'
import Settings from '@/pages/Settings'
import About from '@/pages/About'
import Setup from '@/pages/Setup'

function AppRoutes() {
  const { isFirstLaunch } = useThemeStore()

  // Show setup for first launch
  if (isFirstLaunch) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apps" element={<AppList />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/setup" element={<Navigate to="/dashboard" replace />} />
      </Routes>
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
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
