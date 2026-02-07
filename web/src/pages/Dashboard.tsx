import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useThemeStore } from '@/store/themeStore'
import PageContainer from '@/components/layout/PageContainer'
import { ProgressRing } from '@/components/ui/ProgressRing'
import {
  MemoryModal,
  StorageModal,
  DisplayModal,
  BatteryModal,
  NetworkModal
} from '@/components/dashboard'
import {
  Cpu,
  Battery,
  Wifi,
  AppWindow,
  Monitor,
  MemoryStick,
  HardDrive,
  MoreVertical,
  Smartphone,
  Clock,
  Moon
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { ROUTES } from '@/lib/constants'

type ModalType = 'memory' | 'storage' | 'display' | 'battery' | 'network' | null

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { systemStats, apps, cpuFrequencies } = useAppStore()
  const [cpuHistory, setCpuHistory] = useState<{ value: number }[]>([])
  const [openModal, setOpenModal] = useState<ModalType>(null)

  useEffect(() => {
    if (systemStats?.cpu) {
      setCpuHistory(prev => {
        const newHistory = [...prev, { value: systemStats.cpu.usagePercent }]
        return newHistory.slice(-20)
      })
    }
  }, [systemStats?.cpu?.usagePercent])

  const userApps = apps.filter(app => !app.isSystemApp).length
  const systemAppsCount = apps.filter(app => app.isSystemApp).length
  const chartColor = theme === 'dark' ? '#8B5CF6' : '#22C55E'

  // Use cpuFrequencies from real-time monitor or fallback to systemStats
  const frequencies = cpuFrequencies.length > 0
    ? cpuFrequencies
    : systemStats?.cpu?.coreFrequencies ?? []

  const cpuTemp = systemStats?.cpu?.temperature ?? null
  const gpuTemp = systemStats?.gpu?.temperature ?? null

  return (
    <PageContainer title="Dashboard">
      <div className="space-y-4">
        {/* CPU Status Card */}
        <div className="dash-card animate-fade-in-up" onClick={() => {}}>
          <div className="dash-card-header">
            <span className="dash-card-title">CPU Status</span>
            <button className="p-1 text-text-muted" onClick={e => e.stopPropagation()}>
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="dash-card-body">
            <div className="flex items-start gap-4">
              {/* Core Frequencies Grid */}
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-1">
                {frequencies.slice(0, 8).map((freq, i) => (
                  <div key={i} className="text-center py-1">
                    <span className="text-lg font-semibold text-text-primary">{freq} MHz</span>
                  </div>
                ))}
                {frequencies.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-text-muted">
                    No CPU data available
                  </div>
                )}
              </div>
              {/* Mini Chart */}
              <div className="w-24 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuHistory.length > 0 ? cpuHistory : [{ value: 0 }]}>
                    <defs>
                      <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#cpuFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Temperature Bar */}
        <div className="temp-bar animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-text-muted" />
            <span className="text-text-primary font-medium">
              CPU: {cpuTemp !== null ? `${cpuTemp.toFixed(0)}°C` : '--'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-text-muted" />
            <span className="text-text-primary font-medium">
              GPU: {gpuTemp !== null ? `${gpuTemp.toFixed(0)}°C` : '--'}
            </span>
          </div>
          <button className="p-1 text-text-muted">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* 2x2 Grid Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery */}
          <DashCard
            title="Battery"
            icon={Battery}
            delay={2}
            onClick={() => setOpenModal('battery')}
          >
            <div className="flex items-center gap-3">
              <Battery size={28} className="text-primary" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {systemStats?.battery?.percent ?? '--'}%
                  </span>
                  <span className="text-sm text-text-secondary">
                    {systemStats?.battery?.temperature !== undefined
                      ? `${systemStats.battery.temperature.toFixed(0)}°C`
                      : '--'}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {systemStats?.battery?.isCharging ? 'Charging' : 'Not charging'}
                </p>
                <p className="text-xs text-text-muted">
                  {systemStats?.battery?.remainingTime ?? ''}
                </p>
              </div>
            </div>
          </DashCard>

          {/* Network */}
          <DashCard
            title="Network"
            icon={Wifi}
            delay={3}
            onClick={() => setOpenModal('network')}
          >
            <div className="flex items-center gap-3">
              <Wifi size={28} className="text-primary" />
              <div>
                <p className="text-lg font-bold text-text-primary">
                  {systemStats?.network?.wifi?.connected ? 'Wi-Fi' :
                   systemStats?.network?.mobile?.connected ? 'Mobile' : 'Offline'}
                </p>
                <p className="text-sm text-text-secondary">
                  {systemStats?.network?.wifi?.connected
                    ? `${systemStats.network.wifi.speed} Mbps`
                    : systemStats?.network?.mobile?.connected
                    ? systemStats.network.mobile.type
                    : 'No connection'}
                </p>
                <p className="text-xs text-text-muted">
                  {systemStats?.network?.wifi?.connected
                    ? `${systemStats.network.wifi.signal}% ${systemStats.network.wifi.signalDbm} dBm`
                    : ''}
                </p>
              </div>
            </div>
          </DashCard>

          {/* Apps */}
          <DashCard
            title="Apps"
            icon={AppWindow}
            delay={4}
            onClick={() => navigate(ROUTES.APPS)}
          >
            <div className="flex items-center gap-3">
              <div>
                <span className="text-3xl font-bold text-primary">{apps.length || '--'}</span>
                <p className="text-xs text-text-muted">Total</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">{userApps} User</p>
                <p className="text-sm text-text-secondary">{systemAppsCount} System</p>
              </div>
            </div>
          </DashCard>

          {/* Display */}
          <DashCard
            title="Display"
            icon={Monitor}
            delay={5}
            onClick={() => setOpenModal('display')}
          >
            <div className="flex items-center gap-3">
              <Smartphone size={28} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {systemStats?.display?.gpu ?? '--'}
                </p>
                <p className="text-sm text-text-secondary">
                  {systemStats?.display?.resolution ?? '--'}
                </p>
                <p className="text-xs text-text-muted">
                  {systemStats?.display?.frameRate ? `${systemStats.display.frameRate}Hz` : '--'}
                </p>
              </div>
            </div>
          </DashCard>
        </div>

        {/* RAM & Storage Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* RAM */}
          <DashCard
            title="RAM"
            icon={MemoryStick}
            delay={6}
            onClick={() => setOpenModal('memory')}
          >
            <div className="flex items-center gap-4">
              <ProgressRing
                value={systemStats?.ram?.usedPercent ?? 0}
                size={56}
                strokeWidth={5}
                color="primary"
                showValue
              />
              <div>
                <p className="text-sm text-text-secondary truncate">
                  {systemStats?.ram?.usedBytes !== undefined
                    ? `${formatBytes(systemStats.ram.usedBytes)} used`
                    : '-- used'}
                </p>
                <p className="text-xs text-text-muted">
                  {systemStats?.ram?.totalBytes !== undefined
                    ? `${formatBytes(systemStats.ram.totalBytes)} total`
                    : '-- total'}
                </p>
              </div>
            </div>
          </DashCard>

          {/* Storage */}
          <DashCard
            title="Storage"
            icon={HardDrive}
            delay={7}
            onClick={() => setOpenModal('storage')}
          >
            <div className="flex items-center gap-4">
              <ProgressRing
                value={systemStats?.storage?.usedPercent ?? 0}
                size={56}
                strokeWidth={5}
                color="primary"
                showValue
              />
              <div>
                <p className="text-sm text-text-secondary truncate">
                  {systemStats?.storage?.usedBytes !== undefined
                    ? `${formatBytes(systemStats.storage.usedBytes)} used`
                    : '-- used'}
                </p>
                <p className="text-xs text-text-muted">
                  {systemStats?.storage?.totalBytes !== undefined
                    ? `${formatBytes(systemStats.storage.totalBytes)} total`
                    : '-- total'}
                </p>
              </div>
            </div>
          </DashCard>
        </div>

        {/* Device Info Card */}
        <DeviceInfoCard />
      </div>

      {/* Modals */}
      <MemoryModal isOpen={openModal === 'memory'} onClose={() => setOpenModal(null)} />
      <StorageModal isOpen={openModal === 'storage'} onClose={() => setOpenModal(null)} />
      <DisplayModal isOpen={openModal === 'display'} onClose={() => setOpenModal(null)} />
      <BatteryModal isOpen={openModal === 'battery'} onClose={() => setOpenModal(null)} />
      <NetworkModal isOpen={openModal === 'network'} onClose={() => setOpenModal(null)} />
    </PageContainer>
  )
}

interface DashCardProps {
  title: string
  icon: React.ElementType
  delay?: number
  onClick?: () => void
  children: React.ReactNode
}

function DashCard({ title, delay = 0, onClick, children }: DashCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'dash-card animate-fade-in-up',
        `stagger-${delay}`,
        onClick && 'cursor-pointer'
      )}
    >
      <div className="dash-card-header">
        <span className="dash-card-title">{title}</span>
        <button className="p-1 text-text-muted" onClick={e => e.stopPropagation()}>
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="dash-card-body">
        {children}
      </div>
    </div>
  )
}

function DeviceInfoCard() {
  const { deviceInfo } = useAppStore()

  if (!deviceInfo) {
    return (
      <div className="device-card animate-fade-in-up stagger-8">
        <div className="text-center py-4 text-text-muted">
          Loading device info...
        </div>
      </div>
    )
  }

  return (
    <div className="device-card animate-fade-in-up stagger-8">
      <div className="flex items-center gap-4">
        {/* Brand Logo Placeholder */}
        <div className="w-16 h-16 rounded-xl bg-accent-yellow flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-sm">{deviceInfo.brand}</span>
        </div>

        {/* Device Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {deviceInfo.model}
              </h3>
              <p className="text-sm text-text-primary">
                {deviceInfo.processor}
              </p>
              <p className="text-sm font-medium text-text-primary">
                {deviceInfo.androidVersion}
              </p>
            </div>
            <button className="p-1 text-text-muted">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Uptime Info */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-primary">
              <Clock size={14} />
              <span className="text-sm">
                Uptime: {deviceInfo.uptime}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-primary mt-1">
            <Moon size={14} />
            <span className="text-sm">
              Deep sleep: {deviceInfo.deepSleep} ({deviceInfo.deepSleepPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
