import { Modal, InfoRow, SectionHeader } from '@/components/ui/Modal'
import { Monitor, Cpu, Maximize2, Grid3X3, Zap } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface DisplayModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DisplayModal({ isOpen, onClose }: DisplayModalProps) {
  const { systemStats } = useAppStore()
  const display = systemStats?.display

  const gpu = display?.gpu ?? 'Unknown'
  const resolution = display?.resolution ?? 'Unknown'
  const density = display?.density ?? 0
  const screenSize = display?.screenSize ?? 'Unknown'
  const frameRate = display?.frameRate ?? 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Display"
      icon={Monitor}
    >
      <SectionHeader title="Display Information" />
      <div className="space-y-0">
        <InfoRow
          label="GPU"
          value={gpu}
          icon={Cpu}
        />
        <InfoRow
          label="Resolution"
          value={resolution}
          icon={Maximize2}
        />
        <InfoRow
          label="Density"
          value={`${density} dpi`}
          icon={Grid3X3}
        />
        <InfoRow
          label="Screen size"
          value={screenSize}
          icon={Monitor}
        />
        <InfoRow
          label="Frame rate"
          value={`${frameRate} Hz`}
          icon={Zap}
          valueColor="primary"
        />
      </div>
    </Modal>
  )
}
