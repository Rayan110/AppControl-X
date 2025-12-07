# AppControlX

Android app untuk **freeze, uninstall, disable, dan kontrol battery optimization** secara programmatic — menggunakan Root atau Shizuku.

## Features

- Freeze/Unfreeze apps tanpa uninstall
- Uninstall apps untuk current user
- Kontrol battery optimization (restrict/allow background)
- MIUI 12-14 & HyperOS 1-2 support
- Batch operations
- Rollback system
- Fallback ke manual mode jika command gagal

## Requirements

- Android 10+ (API 29)
- Root access (Magisk) atau Shizuku

## Build

```bash
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

## Tech Stack

- Kotlin
- Material 3
- libsu (Root)
- Shizuku API
- Navigation Component
- ViewBinding

## License

GPL-3.0
