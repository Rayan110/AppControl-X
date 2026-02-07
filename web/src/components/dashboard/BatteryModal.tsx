import { Modal, InfoRow, SectionHeader } from '@/components/ui/Modal'
import {
  Battery,
  Thermometer,
  Zap,
  Activity,
  Heart,
  Gauge,
  Package
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface BatteryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BatteryModal({ isOpen, onClose }: BatteryModalProps) {
  const { systemStats } = useAppStore()
  const battery = systemStats?.battery

  const percent = battery?.percent ?? 0
  const temperature = battery?.temperature ?? 0
  const isCharging = battery?.isCharging ?? false
  const health = battery?.health ?? 'Unknown'
  const technology = battery?.technology ?? 'Unknown'
  const voltage = battery?.voltage ?? 0
  const capacity = battery?.capacity ?? 0

  const status = isCharging ? 'Charging' : 'Discharging'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Battery"
      icon={Battery}
    >
      <SectionHeader title="Battery Status" />
      <div className="space-y-0">
        <InfoRow
          label="Level"
          value={`${percent}%`}
          icon={Battery}
          valueColor={percent < 20 ? 'error' : percent < 50 ? 'warning' : 'success'}
        />
        <InfoRow
          label="Temperature"
          value={`${temperature}°C`}
          icon={Thermometer}
          valueColor={temperature > 45 ? 'error' : temperature > 38 ? 'warning' : 'muted'}
        />
        <InfoRow
          label="Status"
          value={status}
          icon={Zap}
          valueColor={isCharging ? 'success' : 'muted'}
        />
        <InfoRow
          label="Technology"
          value={technology}
          icon={Package}
        />
        <InfoRow
          label="Health"
          value={health}
          icon={Heart}
          valueColor={health === 'Good' ? 'success' : 'warning'}
        />
        <InfoRow
          label="Voltage"
          value={`${(voltage / 1000).toFixed(2)} V`}
          icon={Activity}
        />
        <InfoRow
          label="Capacity"
          value={`${capacity} mAh`}
          icon={Gauge}
        />
      </div>
    </Modal>
  )
}
