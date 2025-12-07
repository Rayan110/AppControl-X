# AppControlX

Aplikasi Android untuk **freeze, uninstall, disable, dan kontrol battery optimization** secara programmatic tanpa user input — menggunakan Root atau Shizuku.

## Konsep Utama

> **Zero User Input** — Semua aksi dieksekusi langsung via shell command tanpa perlu interaksi manual dari user (tidak perlu klik dialog, tidak perlu buka settings).

## Target Platform

| Platform | Version | Status |
|----------|---------|--------|
| **Android Stock** | 10 - 15 | ✅ Full Support |
| **MIUI** | 12 - 14 | ✅ Full Support |
| **HyperOS** | 1.0 - 2.0 | ✅ Full Support |
| **Custom ROM** | Android 10+ | ✅ Full Support |

## Latar Belakang

Aplikasi serupa seperti Greenify, Servicely, dan Hail sudah ada, namun AppControlX fokus pada:
- **Batch operation** — Eksekusi aksi ke banyak app sekaligus
- **No user interaction** — Semua via command, tidak perlu konfirmasi manual
- **MIUI/HyperOS support** — Handle battery restriction khusus Xiaomi
- **Rollback safety** — Bisa restore state jika ada masalah

## Fitur Utama

### 1. App List Management
- Menampilkan semua aplikasi terinstal
- Filter: **User Apps** / **System Apps**
- Multi-select dengan checkbox

### 2. App Control Actions (Tanpa User Input)

| Action | Command | Deskripsi |
|--------|---------|-----------|
| **Freeze** | `pm disable-user --user 0 <pkg>` | App tetap terinstall tapi tidak bisa dijalankan |
| **Unfreeze** | `pm enable <pkg>` | Aktifkan kembali app yang di-freeze |
| **Uninstall** | `pm uninstall -k --user 0 <pkg>` | Hapus app untuk current user (data tetap) |
| **Force Stop** | `am force-stop <pkg>` | Hentikan paksa app yang sedang berjalan |

### 3. Battery Optimization Control (Tanpa User Input)

| Action | Command | Deskripsi |
|--------|---------|-----------|
| **Restrict Background** | `appops set <pkg> RUN_IN_BACKGROUND ignore` | Blokir app dari running di background |
| **Allow Background** | `appops set <pkg> RUN_IN_BACKGROUND allow` | Izinkan app running di background |
| **Disable Wake Lock** | `appops set <pkg> WAKE_LOCK ignore` | Blokir app dari keeping CPU awake |
| **Whitelist Doze** | `cmd deviceidle whitelist +<pkg>` | Exclude app dari Doze mode |

### 4. Xiaomi Support (MIUI 12-14 & HyperOS 1-2)

| Action | MIUI | HyperOS | Method |
|--------|------|---------|--------|
| **Disable Autostart** | ✅ | ✅ | Shell / Intent fallback |
| **Battery Saver Whitelist** | ✅ | ✅ | Shell / Intent fallback |
| **Background Restriction** | ✅ | ✅ | `appops` command |
| **Open Settings** | ✅ | ✅ | Intent (fallback) |

**Perbedaan MIUI vs HyperOS:**
- MIUI: `ro.miui.ui.version.name` = V12, V13, V14
- HyperOS: `ro.mi.os.version.name` = OS1.0, OS1.5, OS2.0
- Package names sama (`com.miui.securitycenter`, `com.miui.powerkeeper`)
- Beberapa Activity class berbeda (handled otomatis)

### 5. Fallback System (Manual Mode)

Jika command gagal atau tidak tersedia, aplikasi akan fallback ke manual mode:

| Action | Auto (Command) | Fallback (Manual) |
|--------|----------------|-------------------|
| **Freeze** | `pm disable-user` | Buka App Info → Disable button |
| **Uninstall** | `pm uninstall` | Buka App Info → Uninstall button |
| **Restrict BG** | `appops set` | Buka Battery Settings → Restrict |
| **Xiaomi Autostart** | Shell command | Buka Security Center → Autostart |
| **Xiaomi Battery** | Shell command | Buka PowerKeeper settings |

```
┌─────────────────────────────────────────────────────────────────┐
│                      ACTION EXECUTION                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Try Command    │
                    │  (Auto Mode)    │
                    └─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      ┌───────────────┐               ┌───────────────┐
      │   SUCCESS     │               │    FAILED     │
      │   Log & Done  │               │   Fallback    │
      └───────────────┘               └───────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Open Settings  │
                                    │  (Manual Mode)  │
                                    │                 │
                                    │  Intent to:     │
                                    │  - App Info     │
                                    │  - Battery      │
                                    │  - MIUI Center  │
                                    └─────────────────┘
```

### 6. Advanced Features
- **Batch Operation** — Eksekusi ke multiple apps sekaligus
- **Action Log** — Simpan history aksi dalam JSON
- **Rollback** — Restore state sebelum aksi dieksekusi
- **Safety Validation** — Block aksi ke critical system apps

## User Setup (Onboarding)

Saat pertama kali membuka aplikasi, user akan dihadapkan dengan setup wizard untuk memastikan semua permission dan konfigurasi sudah benar.

### Setup Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FIRST LAUNCH                                        │
│                      "Welcome to AppControlX"                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Execution Mode Selection                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Pilih mode eksekusi yang tersedia di device kamu:                     │  │
│  │                                                                        │  │
│  │  ○ Root Mode (Recommended)                                             │  │
│  │    Full control, semua fitur tersedia                                  │  │
│  │    [Check Root Status]                                                 │  │
│  │                                                                        │  │
│  │  ○ Shizuku Mode                                                        │  │
│  │    Tanpa root, perlu Shizuku app                                       │  │
│  │    [Install Shizuku] [Check Shizuku]                                   │  │
│  │                                                                        │  │
│  │  ○ View-Only Mode                                                      │  │
│  │    Hanya bisa melihat daftar aplikasi                                  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Permissions                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  AppControlX memerlukan beberapa permission:                           │  │
│  │                                                                        │  │
│  │  ☐ Notification Permission                                             │  │
│  │    Untuk notifikasi progress dan hasil aksi                            │  │
│  │    [Grant Permission]                                                  │  │
│  │                                                                        │  │
│  │  ☐ Query All Packages                                                  │  │
│  │    Untuk melihat semua aplikasi terinstall                             │  │
│  │    Status: ✓ Granted (auto dari manifest)                              │  │
│  │                                                                        │  │
│  │  ☐ Battery Optimization Exemption (Optional)                           │  │
│  │    Agar AppControlX tidak di-kill sistem                               │  │
│  │    [Request Exemption]                                                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Xiaomi Setup (Only for MIUI/HyperOS)                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Device Xiaomi terdeteksi! Setup tambahan diperlukan:                  │  │
│  │                                                                        │  │
│  │  ☐ Autostart Permission                                                │  │
│  │    Izinkan AppControlX autostart                                       │  │
│  │    [Open Autostart Settings]                                           │  │
│  │                                                                        │  │
│  │  ☐ Battery Saver Whitelist                                             │  │
│  │    Tambahkan ke whitelist battery saver                                │  │
│  │    [Open Battery Settings]                                             │  │
│  │                                                                        │  │
│  │  ☐ Lock App in Recents (Optional)                                      │  │
│  │    Kunci app di recent apps agar tidak di-kill                         │  │
│  │    [Show Tutorial]                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Confirmation                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Setup Complete! ✓                                                     │  │
│  │                                                                        │  │
│  │  Mode: Root Mode                                                       │  │
│  │  Notifications: ✓ Enabled                                              │  │
│  │  Xiaomi Setup: ✓ Complete                                              │  │
│  │                                                                        │  │
│  │  [Start Using AppControlX]                                             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Setup Steps Detail

| Step | Requirement | Mandatory | Platform |
|------|-------------|-----------|----------|
| 1. Mode Selection | Root / Shizuku / None | ✅ Yes | All |
| 2a. Notification | `POST_NOTIFICATIONS` | ✅ Yes | Android 13+ |
| 2b. Query Packages | `QUERY_ALL_PACKAGES` | ✅ Yes (auto) | Android 11+ |
| 2c. Battery Exemption | `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | ⚠️ Optional | All |
| 3a. Xiaomi Autostart | Security Center | ⚠️ Recommended | MIUI/HyperOS |
| 3b. Xiaomi Battery | PowerKeeper | ⚠️ Recommended | MIUI/HyperOS |

## Mode Eksekusi

```
┌─────────────────────────────────────────────────────────────┐
│                    PermissionBridge                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Root (su)     │    Shizuku      │      Non-root           │
│   Full Control  │  Elevated API   │     View Only           │
│   ✓ All Action  │  ✓ All Action   │     ✗ No Action         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

- **Root (su)** → Full control mode, akses penuh ke semua fitur
- **Shizuku** → Elevated API tanpa root, fitur sama dengan root
- **Non-root** → View-only mode, hanya bisa melihat daftar aplikasi

## Struktur Proyek

```
📁 AppControlX/
 ┣ 📁 app/
 ┃  ┗ 📁 src/main/
 ┃     ┣ 📁 java/com/appcontrolx/
 ┃     ┃  ┣ 📁 ui/
 ┃     ┃  ┃  ┣ 📄 MainActivity.kt
 ┃     ┃  ┃  ┣ 📄 AppListFragment.kt
 ┃     ┃  ┃  ┣ 📄 SettingsFragment.kt
 ┃     ┃  ┃  ┣ 📄 AboutFragment.kt
 ┃     ┃  ┃  ┣ 📁 setup/
 ┃     ┃  ┃  ┃  ┣ 📄 SetupActivity.kt
 ┃     ┃  ┃  ┃  ┣ 📄 ModeSelectionFragment.kt
 ┃     ┃  ┃  ┃  ┣ 📄 PermissionsFragment.kt
 ┃     ┃  ┃  ┃  ┣ 📄 XiaomiSetupFragment.kt
 ┃     ┃  ┃  ┃  ┗ 📄 SetupCompleteFragment.kt
 ┃     ┃  ┃  ┗ 📁 adapter/
 ┃     ┃  ┃     ┗ 📄 AppListAdapter.kt
 ┃     ┃  ┃
 ┃     ┃  ┣ 📁 data/
 ┃     ┃  ┃  ┣ 📄 AppRepository.kt
 ┃     ┃  ┃  ┗ 📄 ActionLogRepository.kt
 ┃     ┃  ┃
 ┃     ┃  ┣ 📁 model/
 ┃     ┃  ┃  ┣ 📄 AppInfo.kt
 ┃     ┃  ┃  ┣ 📄 ActionLog.kt
 ┃     ┃  ┃  ┗ 📄 ExecutionMode.kt
 ┃     ┃  ┃
 ┃     ┃  ┣ 📁 service/
 ┃     ┃  ┃  ┣ 📄 AppFetcher.kt
 ┃     ┃  ┃  ┣ 📄 BatteryPolicyManager.kt
 ┃     ┃  ┃  ┣ 📄 MIUIBridge.kt
 ┃     ┃  ┃  ┣ 📄 PermissionBridge.kt
 ┃     ┃  ┃  ┗ 📄 FallbackManager.kt
 ┃     ┃  ┃
 ┃     ┃  ┣ 📁 executor/
 ┃     ┃  ┃  ┣ 📄 CommandExecutor.kt
 ┃     ┃  ┃  ┣ 📄 RootExecutor.kt
 ┃     ┃  ┃  ┗ 📄 ShizukuExecutor.kt
 ┃     ┃  ┃
 ┃     ┃  ┣ 📁 rollback/
 ┃     ┃  ┃  ┣ 📄 RollbackManager.kt
 ┃     ┃  ┃  ┗ 📄 StateSnapshot.kt
 ┃     ┃  ┃
 ┃     ┃  ┗ 📁 utils/
 ┃     ┃     ┣ 📄 Constants.kt
 ┃     ┃     ┣ 📄 Extensions.kt
 ┃     ┃     ┗ 📄 SafetyValidator.kt
 ┃     ┃
 ┃     ┣ 📁 res/
 ┃     ┃  ┣ 📁 layout/
 ┃     ┃  ┣ 📁 values/
 ┃     ┃  ┗ 📁 drawable/
 ┃     ┃
 ┃     ┗ 📄 AndroidManifest.xml
 ┃
 ┣ 📁 .github/workflows/
 ┃  ┗ 📄 android-ci.yml
 ┃
 ┣ 📄 build.gradle.kts
 ┣ 📄 settings.gradle.kts
 ┗ 📄 README.md
```

### Modul & Tanggung Jawab

| Modul | File | Fungsi |
|-------|------|--------|
| **UI Layer** | `MainActivity.kt`, `AppListFragment.kt` | Entry point, navigasi, tampilan daftar aplikasi |
| **Data Layer** | `AppRepository.kt`, `ActionLogRepository.kt` | Abstraksi data, caching, persistence |
| **Model** | `AppInfo.kt`, `ActionLog.kt`, `ExecutionMode.kt` | Data class untuk app info, log aksi, enum mode |
| **Service** | `AppFetcher.kt`, `BatteryPolicyManager.kt`, `FallbackManager.kt` | Business logic, policy management, fallback handling |
| **Executor** | `RootExecutor.kt`, `ShizukuExecutor.kt` | Eksekusi command sesuai mode |
| **Rollback** | `RollbackManager.kt`, `StateSnapshot.kt` | Simpan state & restore jika error |
| **Utils** | `SafetyValidator.kt`, `Constants.kt` | Validasi safety, konstanta sistem |

## Flow Aplikasi

### Flow Utama (Main Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              APP LAUNCH                                       │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PermissionBridge.detect()                            │
│                    Cek ketersediaan Root / Shizuku                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   ROOT (su)   │       │   SHIZUKU     │       │   NON-ROOT    │
    │  Full Control │       │ Elevated API  │       │  View Only    │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          AppFetcher.getApps()                                │
│                   Fetch semua aplikasi terinstal                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            MAIN SCREEN                                        │
│                    ┌─────────────┬─────────────┐                             │
│                    │  User Apps  │ System Apps │                             │
│                    └─────────────┴─────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Flow Aksi (Action Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         USER SELECTS APPS                                     │
│                    [✓] Twitter  [✓] Instagram  [✓] Facebook                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         SELECT ACTION                                         │
│         ┌─────────────────┬─────────────────┬─────────────────┐              │
│         │ Turn Off BG     │ Disable App     │ Uninstall       │              │
│         └─────────────────┴─────────────────┴─────────────────┘              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SafetyValidator.validate(apps)                            │
│              Cek apakah ada system-critical app yang dipilih                 │
│                                                                              │
│    BLOCKED: com.android.systemui, com.android.settings, com.android.phone   │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │   BLOCKED     │               │    VALID      │
            │ Show Warning  │               │   Continue    │
            └───────────────┘               └───────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    RollbackManager.saveSnapshot()                            │
│                 Simpan state sebelum eksekusi aksi                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       CommandExecutor.execute()                              │
│                                                                              │
│    if (mode == ROOT)     → RootExecutor.run(command)                         │
│    if (mode == SHIZUKU)  → ShizukuExecutor.run(command)                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │    SUCCESS    │               │    FAILED     │
            │   Log Action  │               │   Rollback    │
            └───────────────┘               └───────────────┘
```

### Flow MIUI (Khusus Xiaomi)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      MIUIBridge.isXiaomiDevice()                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │  NON-XIAOMI   │               │    XIAOMI     │
            │ Standard Flow │               │  MIUI Bridge  │
            └───────────────┘               └───────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ Hook SecurityService         │
                                    │ Override Battery Restriction │
                                    │ Apply MIUI-specific policy   │
                                    └──────────────────────────────┘
```

### Flow Rollback

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         USER TRIGGERS ROLLBACK                                │
│                    atau ERROR saat eksekusi aksi                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    RollbackManager.getLastSnapshot()                         │
│                      Load state terakhir dari JSON                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    CommandExecutor.restore(snapshot)                         │
│                                                                              │
│    for each app in snapshot:                                                 │
│        appops set $pkg RUN_IN_BACKGROUND allow                               │
│        appops set $pkg WAKE_LOCK allow                                       │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           ROLLBACK COMPLETE                                   │
│                    Apps restored ke state sebelumnya                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Command Reference

### App Control Commands
```bash
# FREEZE - Disable app tanpa uninstall
pm disable-user --user 0 com.twitter.android
# Result: App icon hilang, tidak bisa dijalankan

# UNFREEZE - Enable app kembali
pm enable com.twitter.android
# Result: App kembali normal

# UNINSTALL - Hapus untuk current user (keep data)
pm uninstall -k --user 0 com.twitter.android
# Result: App dihapus, data tetap ada di /data

# FORCE STOP - Hentikan paksa
am force-stop com.twitter.android
# Result: App langsung berhenti
```

### Battery Optimization Commands
```bash
# RESTRICT BACKGROUND - Blokir background execution
appops set com.twitter.android RUN_IN_BACKGROUND ignore
appops set com.twitter.android RUN_ANY_IN_BACKGROUND ignore
appops set com.twitter.android WAKE_LOCK ignore

# ALLOW BACKGROUND - Izinkan background execution
appops set com.twitter.android RUN_IN_BACKGROUND allow
appops set com.twitter.android RUN_ANY_IN_BACKGROUND allow
appops set com.twitter.android WAKE_LOCK allow

# DOZE WHITELIST - Exclude dari battery optimization
cmd deviceidle whitelist +com.twitter.android

# REMOVE FROM WHITELIST
cmd deviceidle whitelist -com.twitter.android
```

### MIUI Specific Commands
```bash
# Cek apakah MIUI
getprop ro.miui.ui.version.name

# Cek versi MIUI
getprop ro.miui.ui.version.code

# Standard appops juga bekerja di MIUI dengan root
appops set com.twitter.android RUN_IN_BACKGROUND ignore
```

### Batch Operation Example
```bash
# Freeze multiple apps sekaligus
for pkg in com.twitter.android com.instagram.android com.facebook.katana; do
  pm disable-user --user 0 $pkg
done

# Restrict background untuk multiple apps
for pkg in com.twitter.android com.instagram.android com.facebook.katana; do
  appops set $pkg RUN_IN_BACKGROUND ignore
  appops set $pkg WAKE_LOCK ignore
done
```

## Tech Stack & Requirements

- **Min SDK**: Android 10 (API 29)
- **Target SDK**: Android 13+ (API 33+)
- **Language**: Kotlin
- **Build**: Gradle + GitHub Actions
- **Output**: `app-debug.apk` (debug-only, unsigned)

## CI/CD Pipeline

```yaml
name: Android CI

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - run: ./gradlew assembleDebug
      - run: ./gradlew test
```

## Catatan Penting

> ⚠️ **Safety First**
> - Rollback wajib untuk mencegah disable app kritis
> - Batch operation harus ada validasi (jangan disable `com.android.systemui`)
> - Fallback mode memastikan aplikasi tetap berguna tanpa root/Shizuku

> 📱 **MIUI Support**
> - Perlu modul khusus karena MIUI override battery restriction
> - Hook ke SecurityService untuk kontrol penuh

## Referensi

- [ManageSensors](https://github.com) - Contoh penggunaan AppOps + Shizuku
- [ShizukuApps](https://github.com/nickcao/ShizukuApps) - Daftar aplikasi berbasis Shizuku
- [Awesome Shizuku](https://github.com/nickcao/awesome-shizuku) - Kompilasi proyek Shizuku open source

## Rencana Implementasi

### Phase 1: Foundation (Week 1-2)
```
✓ Setup project structure & Gradle config
✓ Implement PermissionBridge (detect root/Shizuku/none)
✓ Implement AppFetcher (fetch installed apps)
✓ Basic UI: MainActivity + AppListFragment
✓ AppListAdapter dengan checkbox selection
```

### Phase 2: Core Features (Week 3-4)
```
✓ Implement CommandExecutor interface
✓ RootExecutor untuk eksekusi via su
✓ ShizukuExecutor untuk eksekusi via Shizuku API
✓ BatteryPolicyManager (appops commands)
✓ SafetyValidator (block critical apps)
```

### Phase 3: Advanced Features (Week 5-6)
```
✓ RollbackManager + StateSnapshot
✓ ActionLogRepository (JSON persistence)
✓ MIUIBridge untuk device Xiaomi
✓ Settings screen (preferences)
```

### Phase 4: Polish & Release (Week 7-8)
```
✓ UI/UX improvements
✓ Error handling & edge cases
✓ Unit tests & integration tests
✓ GitHub Actions CI/CD
✓ Documentation
```

## Dependency yang Digunakan

```kotlin
// settings.gradle.kts - WAJIB untuk libsu
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }  // Required for libsu
    }
}
```

```kotlin
// build.gradle.kts (app)
dependencies {
    // AndroidX Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    
    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.6")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.6")
    
    // Shizuku (Maven Central)
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")
    
    // Root - libsu (JitPack)
    implementation("com.github.topjohnwu.libsu:core:5.2.2")
    implementation("com.github.topjohnwu.libsu:service:5.2.2")
    
    // JSON (untuk rollback state)
    implementation("com.google.code.gson:gson:2.10.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

## License

GPL 3
