/// <reference types="vite/client" />

interface NativeBridgeInterface {
  getExecutionMode(): string
  setExecutionMode(mode: string): boolean
  checkRootAccess(): boolean
  checkShizukuAccess(): string
  requestShizukuPermission(): void
  getAppList(filter: string): string
  getAppIcon(packageName: string): string
  getAppDetail(packageName: string): string
  executeAction(packageName: string, action: string): string
  executeBatchAction(packages: string, action: string, callbackId: string): void
  getSystemStats(): string
  getDeviceInfo(): string
  startSystemMonitor(intervalMs: number): void
  stopSystemMonitor(): void
  startRealtimeMonitor(intervalMs: number): void
  stopRealtimeMonitor(): void
  getActionHistory(): string
  getSafetyStatus(packageName: string): string
  // Tools & Activity Launcher
  openHiddenSetting(intents: string): boolean
  getActivities(filterJson: string): string
  launchActivity(packageName: string, activityName: string): boolean
  launchApp(packageName: string): boolean
  openAppSettings(packageName: string): boolean
  // Cache management
  clearCache(packageName: string): string
  clearData(packageName: string): string
}

declare global {
  interface Window {
    NativeBridge: NativeBridgeInterface
    onNativeCallback: (callbackId: string, data: string) => void
    onSystemStatsUpdate: (data: string) => void
    onRealtimeStatusUpdate: (data: string) => void
    onExecutionModeChanged: (mode: string) => void
  }
}

export {}
