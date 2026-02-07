export type ExecutionMode = 'ROOT' | 'SHIZUKU' | 'NONE'

export type SafetyLevel = 'CRITICAL' | 'FORCE_STOP_ONLY' | 'WARNING' | 'SAFE'

export type AppAction =
  | 'FREEZE'
  | 'UNFREEZE'
  | 'FORCE_STOP'
  | 'UNINSTALL'
  | 'CLEAR_CACHE'
  | 'CLEAR_DATA'
  | 'RESTRICT_BACKGROUND'
  | 'ALLOW_BACKGROUND'

export interface AppInfo {
  packageName: string
  appName: string
  iconBase64: string | null
  versionName: string
  isSystemApp: boolean
  isEnabled: boolean
  isFrozen: boolean
  isBackgroundRestricted: boolean
  size: number
  uid: number
  safetyLevel: SafetyLevel
  installPath?: string
  targetSdk?: number
  minSdk?: number
  permissions?: number
  backgroundOps?: {
    runInBackground: string
    runAnyInBackground: string
  }
}

export interface SystemStats {
  cpu: CpuStats
  gpu: GpuStats
  ram: RamStats
  storage: StorageStats
  battery: BatteryStats
  network: NetworkStats
  display: DisplayStats
}

export interface CpuStats {
  usagePercent: number
  temperature: number | null
  cores: number
  coreFrequencies: number[]
}

export interface GpuStats {
  name: string
  temperature: number | null
}

export interface RamStats {
  totalBytes: number
  usedBytes: number
  availableBytes: number
  usedPercent: number
  zramTotal: number
  zramUsed: number
}

export interface StorageStats {
  totalBytes: number
  usedBytes: number
  availableBytes: number
  usedPercent: number
  appsBytes: number
  systemBytes: number
  filesystem: string
}

export interface BatteryStats {
  percent: number
  temperature: number
  isCharging: boolean
  health: string
  technology: string
  voltage: number
  capacity: number
  remainingTime: string
}

export interface NetworkStats {
  wifi: {
    connected: boolean
    ssid: string
    ip: string
    speed: number
    signal: number
    signalDbm: number
  }
  mobile: {
    connected: boolean
    type: string
  }
  sim: {
    present: boolean
  }
}

export interface DisplayStats {
  gpu: string
  resolution: string
  density: number
  screenSize: string
  frameRate: number
}

export interface DeviceInfo {
  model: string
  brand: string
  processor: string
  androidVersion: string
  uptime: string
  deepSleep: string
  deepSleepPercent: number
}

export interface RealtimeStatus {
  cpuFrequencies: number[]
  cpuTemp: number | null
  gpuTemp: number | null
}

export interface ActionResult {
  success: boolean
  message: string
  packageName: string
  action: AppAction
}

export interface BatchResult {
  total: number
  successCount: number
  failureCount: number
  results: ActionResult[]
}

export interface ActionLog {
  id: string
  action: AppAction
  packages: string[]
  success: boolean
  errorMessage: string | null
  timestamp: number
}

export interface AppFilter {
  showSystemApps: boolean
  showUserApps: boolean
  showEnabledOnly: boolean
  showDisabledOnly: boolean
  searchQuery: string
}

export interface AppActivityFilter {
  type: 'all' | 'user' | 'system'
  search: string
}

export interface ActivityInfo {
  activityName: string
  isExported: boolean
  canLaunchWithoutRoot: boolean
  hasLauncherIntent: boolean
}

export interface AppActivities {
  packageName: string
  appName: string
  iconBase64?: string
  isSystem: boolean
  activities: ActivityInfo[]
}
