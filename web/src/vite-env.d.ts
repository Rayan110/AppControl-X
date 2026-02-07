/// <reference types="vite/client" />

interface NativeBridgeInterface {
  getExecutionMode(): string
  setExecutionMode(mode: string): boolean
  checkRootAccess(): boolean
  checkShizukuAccess(): string
  requestShizukuPermission(): void
  getAppList(filter: string): string
  getAppDetail(packageName: string): string
  executeAction(packageName: string, action: string): string
  executeBatchAction(packages: string, action: string, callbackId: string): void
  getSystemStats(): string
  getDeviceInfo(): string
  startSystemMonitor(intervalMs: number): void
  stopSystemMonitor(): void
  startCpuMonitor(intervalMs: number): void
  stopCpuMonitor(): void
  getActionHistory(): string
  getSafetyStatus(packageName: string): string
}

declare global {
  interface Window {
    NativeBridge: NativeBridgeInterface
    onNativeCallback: (callbackId: string, data: string) => void
    onSystemStatsUpdate: (data: string) => void
    onCpuFrequencyUpdate: (data: string) => void
    onExecutionModeChanged: (mode: string) => void
  }
}

export {}
