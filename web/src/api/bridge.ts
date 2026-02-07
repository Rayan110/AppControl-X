import type {
  ExecutionMode,
  AppInfo,
  AppAction,
  ActionResult,
  SystemStats,
  ActionLog,
  AppFilter,
  DeviceInfo
} from './types'

// Check if running in development mode (browser)
export const isDev = (): boolean => {
  return !isNativeBridgeAvailable() && import.meta.env.DEV
}

const isNativeBridgeAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.NativeBridge
}

const callNative = <T>(method: () => string): T => {
  try {
    const result = method()
    return JSON.parse(result) as T
  } catch (error) {
    console.error('Native bridge error:', error)
    throw error
  }
}

export const bridge = {
  // Check if native bridge is available
  isAvailable: (): boolean => {
    return isNativeBridgeAvailable()
  },

  getExecutionMode: (): ExecutionMode => {
    if (!isNativeBridgeAvailable()) return 'NONE'
    try {
      return window.NativeBridge.getExecutionMode() as ExecutionMode
    } catch {
      return 'NONE'
    }
  },

  // Check root access availability
  checkRootAccess: (): boolean => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.checkRootAccess()
    } catch {
      return false
    }
  },

  // Check Shizuku availability and permission
  checkShizukuAccess: (): { available: boolean; granted: boolean } => {
    if (!isNativeBridgeAvailable()) {
      return { available: false, granted: false }
    }
    try {
      const result = window.NativeBridge.checkShizukuAccess()
      return JSON.parse(result)
    } catch {
      return { available: false, granted: false }
    }
  },

  // Request Shizuku permission
  requestShizukuPermission: (): void => {
    if (!isNativeBridgeAvailable()) return
    window.NativeBridge.requestShizukuPermission()
  },

  // Set preferred execution mode
  setExecutionMode: (mode: ExecutionMode): boolean => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.setExecutionMode(mode)
    } catch {
      return false
    }
  },

  getAppList: (filter?: AppFilter): AppInfo[] => {
    if (!isNativeBridgeAvailable()) return []
    return callNative<AppInfo[]>(() =>
      window.NativeBridge.getAppList(JSON.stringify(filter ?? {}))
    )
  },

  getAppDetail: (packageName: string): AppInfo | null => {
    if (!isNativeBridgeAvailable()) return null
    return callNative<AppInfo>(() =>
      window.NativeBridge.getAppDetail(packageName)
    )
  },

  executeAction: (packageName: string, action: AppAction): ActionResult => {
    if (!isNativeBridgeAvailable()) {
      return {
        success: false,
        message: 'Native bridge not available',
        packageName,
        action
      }
    }
    return callNative<ActionResult>(() =>
      window.NativeBridge.executeAction(packageName, action)
    )
  },

  executeBatchAction: (
    packages: string[],
    action: AppAction,
    onProgress: (current: number, total: number, packageName: string) => void
  ): Promise<ActionResult[]> => {
    return new Promise((resolve) => {
      if (!isNativeBridgeAvailable()) {
        resolve([])
        return
      }

      const callbackId = `batch_${Date.now()}`
      const results: ActionResult[] = []

      window.onNativeCallback = (id: string, data: string) => {
        if (id !== callbackId) return

        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'progress') {
            onProgress(parsed.current, parsed.total, parsed.packageName)
          } else if (parsed.type === 'result') {
            results.push(parsed.result)
          } else if (parsed.type === 'complete') {
            resolve(results)
          }
        } catch (error) {
          console.error('Callback parse error:', error)
        }
      }

      window.NativeBridge.executeBatchAction(
        JSON.stringify(packages),
        action,
        callbackId
      )
    })
  },

  getSystemStats: (): SystemStats | null => {
    if (!isNativeBridgeAvailable()) return null
    return callNative<SystemStats>(() => window.NativeBridge.getSystemStats())
  },

  getDeviceInfo: (): DeviceInfo | null => {
    if (!isNativeBridgeAvailable()) return null
    return callNative<DeviceInfo>(() => window.NativeBridge.getDeviceInfo())
  },

  startSystemMonitor: (
    intervalMs: number,
    onUpdate: (stats: SystemStats) => void
  ): void => {
    if (!isNativeBridgeAvailable()) return

    window.onSystemStatsUpdate = (data: string) => {
      try {
        const stats = JSON.parse(data) as SystemStats
        onUpdate(stats)
      } catch (error) {
        console.error('System stats parse error:', error)
      }
    }

    window.NativeBridge.startSystemMonitor(intervalMs)
  },

  stopSystemMonitor: (): void => {
    if (!isNativeBridgeAvailable()) return
    window.NativeBridge.stopSystemMonitor()
  },

  // Start CPU frequency monitor with faster interval
  startCpuMonitor: (
    intervalMs: number,
    onUpdate: (frequencies: number[]) => void
  ): void => {
    if (!isNativeBridgeAvailable()) return

    window.onCpuFrequencyUpdate = (data: string) => {
      try {
        const frequencies = JSON.parse(data) as number[]
        onUpdate(frequencies)
      } catch (error) {
        console.error('CPU frequency parse error:', error)
      }
    }

    window.NativeBridge.startCpuMonitor(intervalMs)
  },

  stopCpuMonitor: (): void => {
    if (!isNativeBridgeAvailable()) return
    window.NativeBridge.stopCpuMonitor()
  },

  getActionHistory: (): ActionLog[] => {
    if (!isNativeBridgeAvailable()) return []
    return callNative<ActionLog[]>(() => window.NativeBridge.getActionHistory())
  },

  // Listen for execution mode changes (e.g., when root/shizuku access is lost)
  onExecutionModeChanged: (callback: (mode: ExecutionMode) => void): void => {
    if (!isNativeBridgeAvailable()) return
    window.onExecutionModeChanged = (mode: string) => {
      callback(mode as ExecutionMode)
    }
  },

  // Open hidden settings by trying multiple intents
  openHiddenSetting: async (intents: string[]): Promise<boolean> => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.openHiddenSetting(JSON.stringify(intents))
    } catch {
      return false
    }
  },

  // Get all activities from installed apps
  getActivities: (): { packageName: string; appName: string; isSystem: boolean; activities: string[] }[] => {
    if (!isNativeBridgeAvailable()) return []
    return callNative(() => window.NativeBridge.getActivities())
  },

  // Launch a specific activity
  launchActivity: (packageName: string, activityName: string): boolean => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.launchActivity(packageName, activityName)
    } catch {
      return false
    }
  },

  // Launch an app by package name
  launchApp: (packageName: string): boolean => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.launchApp(packageName)
    } catch {
      return false
    }
  },

  // Open app settings page
  openAppSettings: (packageName: string): boolean => {
    if (!isNativeBridgeAvailable()) return false
    try {
      return window.NativeBridge.openAppSettings(packageName)
    } catch {
      return false
    }
  }
}
