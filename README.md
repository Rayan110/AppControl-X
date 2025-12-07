# AppControlX

A powerful Android application for controlling app behavior, battery optimization, and system management — using Root or Shizuku.

## Overview

AppControlX provides granular control over installed applications without requiring manual user interaction. It executes shell commands directly via Root or Shizuku to freeze, unfreeze, uninstall apps, and manage battery optimization settings.

## Features

### App Control
- **Freeze/Unfreeze** - Disable apps without uninstalling (keeps data intact)
- **Uninstall** - Remove apps for current user while preserving data
- **Force Stop** - Immediately terminate running applications
- **Batch Operations** - Apply actions to multiple apps simultaneously

### Battery Optimization
- **Restrict Background** - Block apps from running in background
- **Allow Background** - Permit background execution
- **Wake Lock Control** - Prevent apps from keeping CPU awake
- **Doze Whitelist** - Exclude apps from battery optimization

### Platform Support
| Platform | Version | Support |
|----------|---------|---------|
| Android Stock | 10 - 15 | Full |
| MIUI | 12 - 14 | Full |
| HyperOS | 1.0 - 2.0 | Full |
| Custom ROM | Android 10+ | Full |

### Safety Features
- **Rollback System** - Automatically saves state before actions, allows restoration
- **Safety Validation** - Blocks actions on critical system apps
- **Fallback Mode** - Opens system settings if commands fail

## Requirements

- Android 10+ (API 29)
- One of the following:
  - **Root access** (Magisk recommended)
  - **Shizuku** installed and activated

## Installation

### From Release
1. Download the latest APK from [Releases](https://github.com/risunCode/AppControl-X/releases)
2. Install on your device
3. Complete the setup wizard

### Build from Source
```bash
git clone https://github.com/risunCode/AppControl-X.git
cd AppControl-X
./gradlew assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

## Architecture

The app follows **MVVM (Model-View-ViewModel)** architecture with **Repository pattern** and uses **Hilt** for dependency injection.

```
com.appcontrolx/
├── data/
│   ├── local/          # Room Database, DataStore
│   └── repository/     # Data repositories
├── di/                 # Hilt modules
├── executor/           # Command execution (Root/Shizuku)
├── model/              # Data classes
├── presentation/
│   └── viewmodel/      # ViewModels
├── rollback/           # State management & rollback
├── service/            # Business logic
├── ui/                 # Activities, Fragments, Adapters
├── utils/              # Helpers & validators
└── worker/             # WorkManager workers
```

### Key Components

| Component | Description |
|-----------|-------------|
| `AppRepository` | Central data access layer |
| `AppListViewModel` | UI state management for app list |
| `PermissionBridge` | Detects available execution mode (Root/Shizuku/None) |
| `RootExecutor` | Executes commands via libsu with security validation |
| `ShizukuExecutor` | Executes commands via Shizuku UserService |
| `BatteryPolicyManager` | Manages appops and battery settings |
| `RollbackManager` | Saves snapshots and restores previous state |
| `SafetyValidator` | Prevents actions on critical system apps |
| `SettingsDataStore` | Persistent settings with DataStore |
| `AppDatabase` | Room database for action logs |

## Tech Stack

- **Language**: Kotlin 1.9
- **Architecture**: MVVM + Repository Pattern
- **DI**: Hilt 2.50
- **UI**: Material 3, ViewBinding
- **Database**: Room 2.6
- **Preferences**: DataStore
- **Async**: Coroutines + Flow
- **Navigation**: Jetpack Navigation Component
- **Background**: WorkManager
- **Root**: [libsu](https://github.com/topjohnwu/libsu) by topjohnwu
- **Shizuku**: [Shizuku-API](https://github.com/RikkaApps/Shizuku-API) by RikkaApps
- **Build**: Gradle 8.2, AGP 8.2.0
- **CI/CD**: GitHub Actions

## Localization

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Default |
| Indonesian | `id` | Complete |

## Theme Support

- Light Mode
- Dark Mode
- System Default (follows device setting)

## Commands Reference

### App Control
```bash
pm disable-user --user 0 <package>    # Freeze
pm enable <package>                    # Unfreeze
pm uninstall -k --user 0 <package>    # Uninstall (keep data)
am force-stop <package>                # Force stop
```

### Battery Control
```bash
appops set <package> RUN_IN_BACKGROUND ignore    # Restrict
appops set <package> RUN_IN_BACKGROUND allow     # Allow
appops set <package> WAKE_LOCK ignore            # Disable wake lock
cmd deviceidle whitelist +<package>              # Doze whitelist
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [libsu](https://github.com/topjohnwu/libsu) - Root shell library
- [Shizuku](https://github.com/RikkaApps/Shizuku) - Elevated API access
- [Don't Kill My App](https://dontkillmyapp.com/) - Vendor battery restriction database
