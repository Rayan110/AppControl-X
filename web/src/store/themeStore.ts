import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

// Increment this to force reset all users to light theme
const STORE_VERSION = 3

interface ThemeState {
  theme: Theme
  isFirstLaunch: boolean
  version: number
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  completeSetup: () => void
  resetSetup: () => void
}

// Apply theme to DOM immediately
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

// Force light theme on page load BEFORE React hydrates
applyTheme('light')

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isFirstLaunch: true,
      version: STORE_VERSION,
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      completeSetup: () => set({ isFirstLaunch: false }),
      resetSetup: () => set({ isFirstLaunch: true })
    }),
    {
      name: 'appcontrolx-theme',
      version: STORE_VERSION,
      migrate: (_persistedState, version) => {
        // Force reset to light theme for old versions
        if (version < STORE_VERSION) {
          applyTheme('light')
          return {
            theme: 'light' as Theme,
            isFirstLaunch: true,
            version: STORE_VERSION
          }
        }
        return _persistedState as ThemeState
      },
      onRehydrateStorage: () => (state) => {
        // After rehydration, apply the stored theme (or light if no state)
        if (state) {
          applyTheme(state.theme)
        } else {
          applyTheme('light')
        }
      }
    }
  )
)
