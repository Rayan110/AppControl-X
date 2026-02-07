import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bridge, isDev } from '@/api/bridge'
import type {
  ExecutionMode,
  AppInfo,
  SystemStats,
  AppFilter,
  AppAction,
  DeviceInfo
} from '@/api/types'

interface AppState {
  executionMode: ExecutionMode
  isLoading: boolean
  apps: AppInfo[]
  appIcons: Record<string, string | null>
  systemStats: SystemStats | null
  deviceInfo: DeviceInfo | null
  cpuFrequencies: number[]
  cpuTemp: number | null
  gpuTemp: number | null
  filter: AppFilter
  selectedApps: Set<string>
  isSelectionMode: boolean
  accessLost: boolean
  lastUpdated: number

  initializeApp: () => void
  detectExecutionMode: () => void
  setExecutionMode: (mode: ExecutionMode) => void
  refreshApps: (force?: boolean) => void
  loadAppIcon: (packageName: string) => Promise<void>
  refreshSystemStats: () => void
  refreshDeviceInfo: () => void
  setFilter: (filter: Partial<AppFilter>) => void
  toggleAppSelection: (packageName: string) => void
  selectAllApps: () => void
  clearSelection: () => void
  setSelectionMode: (enabled: boolean) => void
  executeAction: (packageName: string, action: AppAction) => Promise<boolean>
  clearAccessLost: () => void
}

const defaultFilter: AppFilter = {
  showSystemApps: true,
  showUserApps: true,
  showEnabledOnly: false,
  showDisabledOnly: false,
  searchQuery: ''
}

// Development mock data
const getDevMockData = () => {
  if (!isDev()) return null

  return {
    systemStats: {
      cpu: {
        usagePercent: 35,
        temperature: 53,
        cores: 8,
        coreFrequencies: [441, 441, 787, 787, 787, 480, 480, 633]
      },
      gpu: {
        name: 'Adreno (TM) 825',
        temperature: 47
      },
      ram: {
        totalBytes: 11780000000,
        usedBytes: 5600000000,
        availableBytes: 6180000000,
        usedPercent: 47,
        zramTotal: 5890000000,
        zramUsed: 2400000000
      },
      storage: {
        totalBytes: 528000000000,
        usedBytes: 250000000000,
        availableBytes: 278000000000,
        usedPercent: 48,
        appsBytes: 85000000000,
        systemBytes: 45000000000,
        filesystem: 'f2fs'
      },
      battery: {
        percent: 70,
        temperature: 36,
        isCharging: false,
        health: 'Good',
        technology: 'Li-ion',
        voltage: 4200,
        capacity: 5000,
        remainingTime: '1d 3h 4m'
      },
      network: {
        wifi: {
          connected: true,
          ssid: 'HomeNetwork',
          ip: '192.168.1.100',
          speed: 585,
          signal: 82,
          signalDbm: -59
        },
        mobile: {
          connected: false,
          type: 'LTE'
        },
        sim: {
          present: true
        }
      },
      display: {
        gpu: 'Adreno (TM) 825',
        resolution: '2772 x 1280',
        density: 440,
        screenSize: '6.67"',
        frameRate: 120
      }
    } as SystemStats,
    deviceInfo: {
      model: 'Xiaomi Poco F7',
      brand: 'POCO',
      processor: 'Qualcomm Snapdragon 8s Gen 4',
      androidVersion: 'Android 16 (Baklava)',
      uptime: '11h 6m 31s',
      deepSleep: '4h 57m 6s',
      deepSleepPercent: 44
    } as DeviceInfo
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      executionMode: 'NONE',
      isLoading: false,
      apps: [],
      appIcons: {},
      systemStats: null,
      deviceInfo: null,
      cpuFrequencies: [],
      cpuTemp: null,
      gpuTemp: null,
      filter: defaultFilter,
      selectedApps: new Set(),
      isSelectionMode: false,
      accessLost: false,
      lastUpdated: 0,

      initializeApp: () => {
        // Detect execution mode
        get().detectExecutionMode()

        // Refresh apps in background (uses cache if available)
        setTimeout(() => get().refreshApps(), 0)

        // Refresh system stats in background
        setTimeout(() => {
          get().refreshSystemStats()
          get().refreshDeviceInfo()
        }, 0)

        // Start real-time monitors
        bridge.startSystemMonitor(300, (stats) => {
          set({ systemStats: stats })
        })

        bridge.startRealtimeMonitor(200, (status) => {
          set({
            cpuFrequencies: status.cpuFrequencies,
            cpuTemp: status.cpuTemp,
            gpuTemp: status.gpuTemp
          })
        })

        // Listen for execution mode changes
        bridge.onExecutionModeChanged((mode) => {
          const currentMode = get().executionMode
          if (currentMode !== 'NONE' && mode === 'NONE') {
            set({ executionMode: mode, accessLost: true })
          } else {
            set({ executionMode: mode })
          }
        })
      },

      detectExecutionMode: () => {
        if (!bridge.isAvailable()) {
          if (isDev()) {
            set({ executionMode: 'ROOT' })
          } else {
            set({ executionMode: 'NONE' })
          }
          return
        }

        const mode = bridge.getExecutionMode()
        set({ executionMode: mode })

        if (mode === 'NONE') {
          const hasRoot = bridge.checkRootAccess()
          if (hasRoot) {
            set({ executionMode: 'ROOT' })
            return
          }

          const shizuku = bridge.checkShizukuAccess()
          if (shizuku.available && shizuku.granted) {
            set({ executionMode: 'SHIZUKU' })
          }
        }
      },

      setExecutionMode: (mode) => {
        if (bridge.setExecutionMode(mode)) {
          set({ executionMode: mode })
        }
      },

      refreshApps: (force = false) => {
        const { apps, lastUpdated } = get()
        const now = Date.now()
        const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

        // Use cache if not forcing and cache is fresh
        if (!force && apps.length > 0 && (now - lastUpdated) < CACHE_TTL) {
          console.log('Using cached app list')
          return
        }

        // Only show loading if no cached data
        if (apps.length === 0) {
          set({ isLoading: true })
        }

        try {
          const freshApps = bridge.getAppList(get().filter)
          set({ apps: freshApps, isLoading: false, lastUpdated: now })
        } catch {
          set({ isLoading: false })
        }
      },

      loadAppIcon: async (packageName: string) => {
        const { appIcons } = get()
        if (appIcons[packageName] !== undefined) return

        set({ appIcons: { ...appIcons, [packageName]: null } })

        const icon = bridge.getAppIcon(packageName)
        if (icon) {
          set({ appIcons: { ...get().appIcons, [packageName]: icon } })
        }
      },

      refreshSystemStats: () => {
        const stats = bridge.getSystemStats()
        if (stats) {
          set({ systemStats: stats })
        } else if (isDev()) {
          const mockData = getDevMockData()
          if (mockData) {
            set({ systemStats: mockData.systemStats })
          }
        }
      },

      refreshDeviceInfo: () => {
        const info = bridge.getDeviceInfo()
        if (info) {
          set({ deviceInfo: info })
        } else if (isDev()) {
          const mockData = getDevMockData()
          if (mockData) {
            set({ deviceInfo: mockData.deviceInfo })
          }
        }
      },

      setFilter: (newFilter) => {
        set((state) => ({
          filter: { ...state.filter, ...newFilter }
        }))
        get().refreshApps(true) // Force refresh on filter change
      },

      toggleAppSelection: (packageName) => {
        set((state) => {
          const newSet = new Set(state.selectedApps)
          if (newSet.has(packageName)) {
            newSet.delete(packageName)
          } else {
            newSet.add(packageName)
          }
          return { selectedApps: newSet }
        })
      },

      selectAllApps: () => {
        const { apps } = get()
        const allPackages = new Set(
          apps.filter(app => app.safetyLevel === 'SAFE').map(app => app.packageName)
        )
        set({ selectedApps: allPackages })
      },

      clearSelection: () => {
        set({ selectedApps: new Set(), isSelectionMode: false })
      },

      setSelectionMode: (enabled) => {
        set({ isSelectionMode: enabled })
        if (!enabled) {
          set({ selectedApps: new Set() })
        }
      },

      executeAction: async (packageName, action) => {
        const result = bridge.executeAction(packageName, action)
        if (result.success) {
          get().refreshApps(true) // Force refresh after action
        }
        return result.success
      },

      clearAccessLost: () => {
        set({ accessLost: false })
      }
    }),
    {
      name: 'appcontrolx-storage',
      partialize: (state) => ({
        apps: state.apps,
        appIcons: state.appIcons,
        systemStats: state.systemStats,
        deviceInfo: state.deviceInfo,
        executionMode: state.executionMode,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
