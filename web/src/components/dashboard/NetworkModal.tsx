import { Modal, InfoRow, SectionHeader } from '@/components/ui/Modal'
import { Wifi, Signal, Globe, Smartphone, CreditCard } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface NetworkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NetworkModal({ isOpen, onClose }: NetworkModalProps) {
  const { systemStats } = useAppStore()
  const network = systemStats?.network

  const wifi = network?.wifi
  const mobile = network?.mobile
  const sim = network?.sim

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Network"
      icon={Wifi}
    >
      <SectionHeader title="Wi-Fi" />
      <div className="space-y-0">
        <InfoRow
          label="Status"
          value={wifi?.connected ? 'Connected' : 'Disconnected'}
          icon={Wifi}
          valueColor={wifi?.connected ? 'success' : 'error'}
        />
        {wifi?.connected && (
          <>
            <InfoRow
              label="SSID"
              value={wifi.ssid || 'Unknown'}
              icon={Signal}
            />
            <InfoRow
              label="IP Address"
              value={wifi.ip || 'Unknown'}
              icon={Globe}
            />
            <InfoRow
              label="Speed"
              value={`${wifi.speed || 0} Mbps`}
              icon={Signal}
            />
            <InfoRow
              label="Signal"
              value={`${wifi.signal || 0}% (${wifi.signalDbm || 0} dBm)`}
              icon={Signal}
              valueColor={
                (wifi.signal || 0) > 70
                  ? 'success'
                  : (wifi.signal || 0) > 40
                  ? 'warning'
                  : 'error'
              }
            />
          </>
        )}
      </div>

      <SectionHeader title="Mobile Data" />
      <div className="space-y-0">
        <InfoRow
          label="Status"
          value={mobile?.connected ? 'Connected' : 'Disconnected'}
          icon={Smartphone}
          valueColor={mobile?.connected ? 'success' : 'muted'}
        />
        {mobile?.connected && (
          <InfoRow
            label="Type"
            value={mobile.type || 'Unknown'}
            icon={Signal}
          />
        )}
      </div>

      <SectionHeader title="SIM Card" />
      <div className="space-y-0">
        <InfoRow
          label="Status"
          value={sim?.present ? 'Present' : 'Not present'}
          icon={CreditCard}
          valueColor={sim?.present ? 'success' : 'muted'}
        />
      </div>
    </Modal>
  )
}
