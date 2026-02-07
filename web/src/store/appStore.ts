import { create } from 'zustand'
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
  systemStats: SystemStats | null
  deviceInfo: DeviceInfo | null
  cpuFrequencies: number[]
  filter: AppFilter
  selectedApps: Set<string>
  isSelectionMode: boolean
  accessLost: boolean

  initializeApp: () => void
  detectExecutionMode: () => void
  setExecutionMode: (mode: ExecutionMode) => void
  refreshApps: () => void
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

// Development mock data - only used when running in browser without native bridge
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

export const useAppStore = create<AppState>((set, get) => ({
  executionMode: 'NONE',
  isLoading: false,
  apps: [],
  systemStats: null,
  deviceInfo: null,
  cpuFrequencies: [],
  filter: defaultFilter,
  selectedApps: new Set(),
  isSelectionMode: false,
  accessLost: false,

  initializeApp: () => {
    // Detect execution mode (root/shizuku) at startup
    get().detectExecutionMode()

    // Refresh apps and system stats
    get().refreshApps()
    get().refreshSystemStats()
    get().refreshDeviceInfo()

    // Start system monitor with 2 second interval
    bridge.startSystemMonitor(2000, (stats) => {
      set({ systemStats: stats })
    })

    // Start CPU frequency monitor with 400ms interval for real-time display
    bridge.startCpuMonitor(400, (frequencies) => {
      set({ cpuFrequencies: frequencies })
    })

    // Listen for execution mode changes (access loss detection)
    bridge.onExecutionModeChanged((mode) => {
      const currentMode = get().executionMode
      if (currentMode !== 'NONE' && mode === 'NONE') {
        // Access was lost
        set({ executionMode: mode, accessLost: true })
      } else {
        set({ executionMode: mode })
      }
    })
  },

  detectExecutionMode: () => {
    // First check if native bridge is available
    if (!bridge.isAvailable()) {
      if (isDev()) {
        // In dev mode, simulate ROOT access
        set({ executionMode: 'ROOT' })
      } else {
        set({ executionMode: 'NONE' })
      }
      return
    }

    // Get the actual execution mode from native
    const mode = bridge.getExecutionMode()
    set({ executionMode: mode })

    // If mode is NONE, try to detect what's available
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

  refreshApps: () => {
    set({ isLoading: true })
    try {
      const apps = bridge.getAppList(get().filter)
      set({ apps, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  refreshSystemStats: () => {
    const stats = bridge.getSystemStats()
    if (stats) {
      set({ systemStats: stats })
    } else if (isDev()) {
      // Only use mock data in development
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
      // Only use mock data in development
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
    get().refreshApps()
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
      get().refreshApps()
    }
    return result.success
  },

  clearAccessLost: () => {
    set({ accessLost: false })
  }
}))
