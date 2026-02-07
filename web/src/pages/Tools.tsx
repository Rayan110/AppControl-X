import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { bridge } from '@/api/bridge'
import {
  ChevronRight,
  Sun,
  Palette,
  Bell,
  BellRing,
  Battery,
  Zap,
  Smartphone,
  Activity,
  ShieldQuestion,
  AppWindow,
  Rocket,
  Play,
  Package,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HiddenSetting {
  id: string
  icon: React.ElementType
  title: string
  description: string
  intents: string[]
}

const hiddenSettings: { section: string; items: HiddenSetting[] }[] = [
  {
    section: 'Display',
    items: [
      {
        id: 'extra-dim',
        icon: Sun,
        title: 'Extra Dim',
        description: 'Reduce brightness below minimum',
        intents: [
          'com.android.settings/com.android.settings.display.ReduceBrightColorsPreferenceFragment',
          'com.android.settings/com.android.settings.Settings$ReduceBrightColorsSettingsActivity'
        ]
      },
      {
        id: 'display-color',
        icon: Palette,
        title: 'Display Color',
        description: 'QColor, MiraVision, Screen mode',
        intents: [
          'com.qualcomm.qti.qcolor/com.qualcomm.qti.qcolor.QColorActivity',
          'com.mediatek.miravision.ui/com.mediatek.miravision.ui.MiraVisionActivity',
          'com.android.settings/com.android.settings.display.ColorModePreferenceFragment',
          'com.samsung.android.app.screenmode/com.samsung.android.app.screenmode.ScreenModeSettingsActivity'
        ]
      }
    ]
  },
  {
    section: 'Notifications',
    items: [
      {
        id: 'notification-log',
        icon: Bell,
        title: 'Notification Log',
        description: 'View all past notifications',
        intents: [
          'com.android.settings/com.android.settings.notification.NotificationStation',
          'com.miui.securitycenter/com.miui.notificationlog.ui.main.NotificationLogActivity',
          'com.android.settings/com.android.settings.Settings$NotificationStationActivity'
        ]
      },
      {
        id: 'notification-history',
        icon: BellRing,
        title: 'Notification History',
        description: 'Recently snoozed notifications',
        intents: [
          'com.android.settings/com.android.settings.notification.history.NotificationHistoryActivity',
          'com.android.settings/com.android.settings.Settings$NotificationHistoryActivity'
        ]
      }
    ]
  },
  {
    section: 'Battery',
    items: [
      {
        id: 'battery-optimization',
        icon: Battery,
        title: 'Battery Optimization',
        description: 'App battery usage settings',
        intents: [
          'com.android.settings/com.android.settings.Settings$AppBatteryUsageActivity',
          'com.android.settings/com.android.settings.Settings$HighPowerApplicationsActivity',
          'com.android.settings/com.android.settings.fuelgauge.PowerUsageSummary'
        ]
      },
      {
        id: 'power-mode',
        icon: Zap,
        title: 'Power Mode',
        description: 'Performance and battery saver',
        intents: [
          'com.android.settings/com.android.settings.fuelgauge.PowerModeSettings',
          'com.android.settings/com.android.settings.Settings$PowerModeSettingsActivity',
          'com.miui.powerkeeper/com.miui.powerkeeper.ui.HiddenAppsConfigActivity',
          'com.samsung.android.lool/com.samsung.android.sm.ui.battery.BatteryActivity'
        ]
      }
    ]
  },
  {
    section: 'System',
    items: [
      {
        id: 'device-info',
        icon: Smartphone,
        title: 'Device Info',
        description: 'Detailed device information',
        intents: [
          'com.android.settings/com.android.settings.Settings$DeviceInfoSettingsActivity',
          'com.android.settings/com.android.settings.DeviceInfoSettings'
        ]
      },
      {
        id: 'running-services',
        icon: Activity,
        title: 'Running Services',
        description: 'Device diagnostic and services',
        intents: [
          'com.android.devicediagnostics/com.android.devicediagnostics.MainActivity',
          'com.android.settings/com.android.settings.Settings$DevRunningServicesActivity',
          'com.android.settings/com.android.settings.applications.RunningServices'
        ]
      }
    ]
  },
  {
    section: 'Apps',
    items: [
      {
        id: 'unknown-sources',
        icon: ShieldQuestion,
        title: 'Unknown Sources',
        description: 'Install from unknown apps',
        intents: [
          'com.android.settings/com.android.settings.Settings$ManageExternalSourcesActivity',
          'com.android.settings/com.android.settings.applications.manageapplications.ManageExternalSourcesActivity'
        ]
      },
      {
        id: 'manage-apps',
        icon: AppWindow,
        title: 'Manage Apps',
        description: 'System app manager',
        intents: [
          'com.android.settings/com.android.settings.Settings$ManageApplicationsActivity',
          'com.android.settings/com.android.settings.applications.ManageApplications'
        ]
      },
      {
        id: 'autostart',
        icon: Rocket,
        title: 'Autostart Manager',
        description: 'Control app autostart (OEM)',
        intents: [
          'com.miui.securitycenter/com.miui.permcenter.autostart.AutoStartManagementActivity',
          'com.coloros.safecenter/com.coloros.privacypermissionsentry.PermissionTopActivity',
          'com.oplus.safecenter/com.oplus.safecenter.permission.startup.StartupAppListActivity',
          'com.vivo.permissionmanager/com.vivo.permissionmanager.activity.BgStartUpManagerActivity',
          'com.huawei.systemmanager/com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity',
          'com.oneplus.security/com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity',
          'com.samsung.android.lool/com.samsung.android.sm.ui.battery.BatteryActivity',
          'com.asus.mobilemanager/com.asus.mobilemanager.autostart.AutoStartActivity'
        ]
      }
    ]
  }
]

export default function Tools() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOpenSetting = async (setting: HiddenSetting) => {
    setLoading(setting.id)
    setError(null)

    try {
      const result = await bridge.openHiddenSetting(setting.intents)
      if (!result) {
        setError('Setting not available on this device')
      }
    } catch (e) {
      setError('Failed to open setting')
    } finally {
      setLoading(null)
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <PageContainer title="Tools">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-up">
          <div className="card p-3 border-error/50 flex items-center gap-3">
            <X size={16} className="text-error" />
            <span className="text-sm text-error flex-1">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Quick Actions */}
        <section className="animate-fade-in-up">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/apps')}
              className="card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package size={24} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-text-primary">App Manager</span>
              <span className="text-xs text-text-muted">Freeze, stop, uninstall</span>
            </button>
            <button
              onClick={() => navigate('/activity-launcher')}
              className="card p-4 flex flex-col items-center gap-2 hover:border-secondary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Play size={24} className="text-secondary" />
              </div>
              <span className="text-sm font-medium text-text-primary">Activity Launcher</span>
              <span className="text-xs text-text-muted">Launch any activity</span>
            </button>
          </div>
        </section>

        {/* Hidden Settings */}
        {hiddenSettings.map(({ section, items }, sectionIndex) => (
          <section key={section} className="animate-fade-in-up" style={{ animationDelay: `${(sectionIndex + 1) * 50}ms` }}>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
              {section}
            </h2>
            <div className="card overflow-hidden">
              {items.map((item, index) => (
                <SettingItem
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.description}
                  onClick={() => handleOpenSetting(item)}
                  loading={loading === item.id}
                  showBorder={index < items.length - 1}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}

interface SettingItemProps {
  icon: React.ElementType
  title: string
  subtitle: string
  onClick: () => void
  loading?: boolean
  showBorder?: boolean
}

function SettingItem({ icon: Icon, title, subtitle, onClick, loading, showBorder }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'w-full p-4 flex items-center gap-4 text-left',
        'hover:bg-surface-hover transition-colors',
        'active:bg-surface',
        showBorder && 'border-b border-card-border'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-text-secondary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-muted truncate">{subtitle}</p>
      </div>
      {loading ? (
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <ChevronRight size={18} className="text-text-muted flex-shrink-0" />
      )}
    </button>
  )
}
