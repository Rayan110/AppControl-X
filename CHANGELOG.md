# Changelog

All notable changes to AppControlX.

## [3.0.0] - 2026-02-07 (v3 UI Rewrite)

### 🎉 Complete UI Rewrite
This is a complete UI rewrite with React + TypeScript hybrid architecture.

### Added
- **Solarized Light Theme** - Beautiful cream-colored light theme (#FDF6E3) as default
- **Premium Dark Theme** - Purple accent dark mode with glassmorphism
- **Dashboard Modals** - Clickable cards with detailed info:
  - Memory Modal (RAM + ZRAM usage)
  - Storage Modal (Apps, System, Available breakdown)
  - Display Modal (GPU, Resolution, Refresh rate)
  - Battery Modal (Health, Temperature, Voltage, Remaining time)
  - Network Modal (WiFi/Mobile status, Signal strength)
- **Real-time CPU Monitoring** - 400ms polling for live CPU frequency display
- **Enhanced Device Info** - Comprehensive device information with processor name mapping:
  - Device model, brand, and marketing name
  - Processor name (Snapdragon 8 Gen 4, etc.) with SoC model mapping
  - Android version with codename (Baklava, Vanilla Ice Cream, etc.)
  - Uptime and deep sleep time with percentage
  - GPU name detection from SoC model
  - ZRAM usage monitoring
  - Storage filesystem detection (f2fs, ext4)
  - Network info (WiFi SSID, speed, signal strength, mobile type)
- **Action History with Rollback** - View past actions and rollback freeze/unfreeze operations
- **Execution Mode Selection** - Choose between Root, Shizuku, or View-Only from Settings
- **Access Loss Detection** - Automatic detection and warning when Root/Shizuku access is lost
- **Setup Wizard** - Guided first-time setup with theme selection
- **Functional Settings Modals**:
  - Execution Mode selector
  - Accent Color info
  - Animations toggle
  - Notifications toggle
  - App Information

### Changed
- **Architecture** - Migrated to React + TypeScript + Tailwind CSS in WebView
- **Theme System** - CSS variables with `:root` and `.dark` class switching
- **State Management** - Zustand with persist middleware for theme/settings
- **Button Styling** - Rounded corners (0.75rem) with proper active states
- **Dashboard** - No more hardcoded values, all data from native bridge
- **App List** - Removed "isRunning" detection (unreliable on modern Android)

### Removed
- Legacy Jetpack Compose UI
- Running app detection badge and filter
- Mock data in production builds (only available in dev mode)

### Fixed
- Theme not applying correctly on first load
- Text colors not adapting to light/dark theme
- Click highlight color showing wrong color
- Build errors with unused imports

---

## [2.0.0] - 2026-01 (v2 Rewrite)

### 🎉 Complete Rewrite
This is a complete rewrite of AppControlX with modern architecture and new features.

### Added
- **Dashboard** - System monitoring with real-time updates
  - CPU usage and temperature
  - Battery status and temperature
  - RAM and Storage usage
  - Network status
  - Display info (resolution, refresh rate)
  - GPU info (requires root)
  - Device info with uptime and deep sleep time
- **Setup Wizard** - Guided first-time setup with mode selection
- **Mode Loss Detection** - Automatic detection when Root/Shizuku access is lost
- **Display Refresh Rate Control** - Set min/max refresh rate (Root/Shizuku)
- **Feature Quick Access Cards** - Navigate to features from Dashboard
- **Batch Progress UI** - Visual progress during batch operations

### Changed
- **Architecture** - Complete rewrite with clean MVVM + Hilt DI
- **App Detection** - More accurate using dumpsys + PackageManager
- **Material 3** - Updated to latest Material Design 3
- **Navigation** - Bottom navigation with Dashboard, Apps, Settings

---

## [1.1.0] - 2025-12

### Added
- Showcase website (index.html) with responsive design, 3 themes, image gallery
- Expanded background ops viewer in app detail
- Other Projects backlinks section in website

### Fixed
- App info sheet stacking bug
- Duplicate Activity Launcher in Tools layout
- ProGuard rules for Rollback/ActionLog Gson serialization

### Changed
- Autostart Manager now supports 13 OEM brands

---

## [1.0.0] - 2025-12

### Added
- Setup wizard with mode selection (Root/Shizuku/View-Only)
- App list with User/System app filter
- Batch selection and operations with progress tracking
- Freeze/Unfreeze, Force Stop, Background Restriction
- Clear Cache/Data, Uninstall, Launch App
- Activity Launcher with search
- Action Logs & Rollback
- Settings with theme/language selection
- Safety validation for system apps

### Platform Support
- Root mode via libsu
- Shizuku mode with UserService
- View-Only mode for browsing

---

## Architecture (v3)

```
┌─────────────────────────────────────┐
│     React UI (WebView)              │
│     TypeScript + Tailwind           │
├─────────────────────────────────────┤
│     JavaScript Bridge               │
│     @JavascriptInterface            │
├─────────────────────────────────────┤
│     Kotlin Native Layer             │
│     libsu + Shizuku                 │
└─────────────────────────────────────┘
```

### Web Stack
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Zustand (State)
- Recharts (Graphs)
- Lucide React (Icons)

### Native Stack
- Kotlin 1.9
- Hilt DI
- libsu 5.2.2
- Shizuku-API 13.1.5
- kotlinx.serialization

## Tech Requirements

- Android 10+ (API 29+)
- Target SDK 34 (Android 14)
- Root access (Magisk/KernelSU) OR Shizuku
