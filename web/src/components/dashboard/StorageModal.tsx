import { Modal, ProgressBar, StorageDot, SectionHeader, InfoRow } from '@/components/ui/Modal'
import { HardDrive } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatBytes } from '@/lib/utils'

interface StorageModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StorageModal({ isOpen, onClose }: StorageModalProps) {
  const { systemStats } = useAppStore()
  const storage = systemStats?.storage

  const totalBytes = storage?.totalBytes ?? 0
  const usedBytes = storage?.usedBytes ?? 0
  const freeBytes = storage?.availableBytes ?? 0
  const usedPercent = storage?.usedPercent ?? 0
  const appsBytes = storage?.appsBytes ?? 0
  const systemBytes = storage?.systemBytes ?? 0
  const filesystem = storage?.filesystem ?? 'Unknown'

  // Calculate "other" data
  const otherBytes = usedBytes - appsBytes - systemBytes

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Storage"
      icon={HardDrive}
    >
      <div className="mb-4">
        <div className="text-2xl font-bold text-text-primary mb-1">
          {formatBytes(totalBytes)}
        </div>
        <p className="text-sm text-text-muted mb-4">Total Storage</p>

        <ProgressBar
          value={usedPercent}
          showLabels={false}
          color="primary"
        />

        <div className="mt-4 space-y-2">
          <StorageDot
            color="bg-primary"
            label="Apps & Data"
            value={formatBytes(appsBytes)}
          />
          <StorageDot
            color="bg-secondary"
            label="System"
            value={formatBytes(systemBytes)}
          />
          {otherBytes > 0 && (
            <StorageDot
              color="bg-warning"
              label="Other"
              value={formatBytes(otherBytes)}
            />
          )}
          <StorageDot
            color="bg-surface-hover"
            label="Free"
            value={formatBytes(freeBytes)}
          />
        </div>
      </div>

      <SectionHeader title="Internal Storage" />
      <div className="space-y-0">
        <InfoRow label="Filesystem" value={filesystem} />
        <InfoRow label="/data partition" value={formatBytes(totalBytes)} />
        <InfoRow label="Used" value={`${usedPercent.toFixed(1)}%`} />
      </div>
    </Modal>
  )
}
