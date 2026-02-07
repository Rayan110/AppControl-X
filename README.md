# AppControlX

A powerful Android app control utility built with Kotlin + React hybrid architecture.

## Features

- **Freeze/Unfreeze Apps** - Disable apps without uninstalling
- **Force Stop Apps** - Kill running applications
- **Uninstall Apps** - Remove apps for current user
- **Clear Cache/Data** - Free up storage space
- **Background Restriction** - Control app background activity
- **System Monitoring** - Real-time CPU, RAM, Storage, Battery stats
- **Action History & Rollback** - View past actions and undo freeze/unfreeze
- **Safety Protection** - Prevents modification of critical system apps

## Screenshots

### Light Theme (Solarized)
Beautiful cream-colored theme with green accents.

### Dark Theme
Premium dark mode with purple accents and glassmorphism.

## Architecture

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

## Requirements

- Android 10+ (API 29+)
- Root access (Magisk/KernelSU) OR Shizuku

## Building

### Prerequisites

- JDK 17
- Node.js 20+
- Android SDK 34

### Build Steps

```bash
# Install web dependencies
cd web
npm install

# Build React app
npm run build

# Build Android APK
cd ..
./gradlew assembleDebug
```

### Output

APK will be at: `app/build/outputs/apk/debug/AppControlX-v3.0.0-debug.apk`

## Development

### Web (React)

```bash
cd web
npm run dev
```

Open http://localhost:3000 in browser for development.

### Android

Open the project in Android Studio and run on device/emulator.

## Tech Stack

### Native
- Kotlin 1.9
- Hilt (Dependency Injection)
- libsu (Root access)
- Shizuku API
- kotlinx.serialization

### Web
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Zustand (State Management)
- Recharts (Graphs)
- Lucide React (Icons)

## Credits & Acknowledgments

### Libraries
- [libsu](https://github.com/topjohnwu/libsu) by topjohnwu - Root shell
- [Shizuku](https://github.com/RikkaApps/Shizuku) by RikkaApps - Shell access without root
- [Lucide Icons](https://lucide.dev/) - Beautiful icon set
- [Recharts](https://recharts.org/) - React charting library
- [Zustand](https://github.com/pmndrs/zustand) - State management

### Code References
- [DeviceInfo](https://github.com/ahmmedrejowan/DeviceInfo) by ahmmedrejowan - Device information utilities adapted for system monitoring

### Theme
- Light theme inspired by [Solarized](https://ethanschoonover.com/solarized/) by Ethan Schoonover

### Tools
- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## License

Apache License 2.0

---

Made with care for Android power users - 2026
