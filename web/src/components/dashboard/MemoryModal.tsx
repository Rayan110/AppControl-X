import { Modal, ProgressBar, SectionHeader } from '@/components/ui/Modal'
import { MemoryStick } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatBytes } from '@/lib/utils'

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MemoryModal({ isOpen, onClose }: MemoryModalProps) {
  const { systemStats } = useAppStore()
  const ram = systemStats?.ram

  const ramUsed = ram?.usedBytes ?? 0
  const ramTotal = ram?.totalBytes ?? 1
  const ramFree = ram?.availableBytes ?? 0
  const ramPercent = ram?.usedPercent ?? 0

  const zramUsed = ram?.zramUsed ?? 0
  const zramTotal = ram?.zramTotal ?? 1
  const zramPercent = zramTotal > 0 ? (zramUsed / zramTotal) * 100 : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Memory"
      icon={MemoryStick}
    >
      <SectionHeader title="RAM" />
      <div className="mb-4">
        <div className="text-2xl font-bold text-text-primary mb-1">
          {formatBytes(ramTotal)}
        </div>
        <p className="text-sm text-text-muted mb-4">Total RAM</p>

        <ProgressBar
          value={ramPercent}
          label="Used"
          valueLabel={`${formatBytes(ramUsed)} / ${formatBytes(ramTotal)}`}
          color="primary"
        />

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-text-muted">Free</span>
          <span className="text-text-secondary">{formatBytes(ramFree)}</span>
        </div>
      </div>

      <SectionHeader title="ZRAM" />
      <div>
        <ProgressBar
          value={zramPercent}
          label="Used"
          valueLabel={`${formatBytes(zramUsed)} / ${formatBytes(zramTotal)}`}
          color="primary"
        />

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-text-muted">Free</span>
          <span className="text-text-secondary">{formatBytes(zramTotal - zramUsed)}</span>
        </div>
      </div>
    </Modal>
  )
}
