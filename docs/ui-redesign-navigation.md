# UI Redesign: Navigation & App List

## Overview

Redesign navigasi utama AppControlX ke style DevCheck - clean header dengan icon, nama app di tengah, dan overflow menu.

---

## Current vs New Navigation

### Current (3 Tabs + Header dengan Mode)
```
┌─────────────────────────────────────────┐
│ AppControlX                          ⚙️ │  ← Settings icon
│ Root Mode ✓                             │  ← Mode indicator (HAPUS)
├─────────────────────────────────────────┤
│                                         │
│           [Dashboard Content]           │
│                                         │
├─────────────────────────────────────────┤
│  Dashboard  │    Apps    │  Settings    │  ← 3 tabs (bottom nav)
└─────────────────────────────────────────┘
```

### New (DevCheck Style)
```
┌─────────────────────────────────────────┐
│  🅰️      AppControlX                 ⋮  │  ← Icon | Name | Overflow
├─────────────────────────────────────────┤
│  Dashboard        Apps                  │  ← Tab bar (top, swipeable)
│  ═══════════                            │  ← Indicator under active tab
├─────────────────────────────────────────┤
│                                         │
│    ← SWIPE LEFT/RIGHT TO SWITCH TAB →   │
│                                         │
│           [Dashboard Content]           │
│              or [Apps List]             │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Key Changes:**
- ❌ Hapus "Root Mode ✓" indicator dari header
- ❌ Hapus bottom navigation
- ✅ Tab bar pindah ke atas (di bawah header)
- ✅ Header: Icon (kiri) | App Name (tengah) | Overflow (kanan)
- ✅ Hanya 2 tab: Dashboard & Apps
- ✅ **Swipe gesture** untuk pindah antar tab (ViewPager2)

---

## Header Layout Detail

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│   🅰️           AppControlX                       ⋮   │
│   ↑                 ↑                            ↑   │
│  Icon            App Name                    Overflow │
│  (40dp)          (center)                    Menu    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

- **Icon**: App icon/logo, 40dp, di kiri dengan padding
- **App Name**: "AppControlX", centered, bold, 20sp
- **Overflow**: 3-dot menu, di kanan
- **NO** mode indicator (Root/Shizuku) - dihapus!

---

## Tab Bar (Top Tabs - DevCheck Style)

```
┌───────────────────────────────────────────────────────┐
│   Dashboard        Apps                               │
│   ══════════                                          │
│   ↑ active indicator (accent color, 3dp height)      │
└───────────────────────────────────────────────────────┘
```

- Tab bar di bawah header (bukan bottom nav!)
- Indicator line di bawah tab aktif
- Warna indicator = accent color (hijau/primary)
- **Swipe left/right** untuk pindah tab (ViewPager2)

---

## Overflow Menu (⋮) Contents

```
┌─────────────────────────┐
│ Settings                │
│ Action Logs             │
│ About                   │
└─────────────────────────┘
```

Note: "Reset Setup" sudah ada di Settings, jadi tidak perlu di overflow menu.

---

## Apps List Redesign

### Current Apps List
```
┌─────────────────────────────────────────┐
│ 🔍 Search apps...                       │
├─────────────────────────────────────────┤
│ [User Apps] [System Apps]               │  ← Toggle chips
│ [All] [Running] [Frozen] [Restricted]   │  ← Filter chips
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📱 App Name                    [i]  │ │
│ │    com.example.app                  │ │
│ │    [RUNNING]                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📱 Another App                 [i]  │ │
│ │    com.another.app                  │ │
│ │    [FROZEN]                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### New Apps List (Simplified)
```
┌─────────────────────────────────────────┐
│ 🔍 Search apps...              [All ▼]  │  ← Search + Filter/Sort dropdown
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📱  Chrome                          │ │
│ │     com.android.chrome              │ │
│ │     v120.0.6099.144 • 245 MB        │ │  ← Version + size
│ │     ┌────────┐ ┌────────┐           │ │
│ │     │RUNNING │ │ 🔋 OK  │           │ │  ← Status badges
│ │     └────────┘ └────────┘           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📱  Instagram                       │ │
│ │     com.instagram.android           │ │
│ │     v312.0.0.34.111 • 180 MB        │ │
│ │     ┌────────┐ ┌──────────────┐     │ │
│ │     │ FROZEN │ │ 🔋 RESTRICTED│     │ │
│ │     └────────┘ └──────────────┘     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📱  Settings                    🔒  │ │  ← Lock icon = protected
│ │     com.android.settings            │ │
│ │     v14.0.0 • 45 MB                 │ │
│ │     ┌────────┐                      │ │
│ │     │RUNNING │                      │ │
│ │     └────────┘                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

Note: User/System/All toggle tidak perlu di Apps List karena sudah ada info di Dashboard.

---

## App Item Card Details

### Compact View (Default)
```
┌─────────────────────────────────────────────┐
│ 📱  App Name                            🔒  │  ← Icon + Name + Protected indicator
│     com.package.name                        │  ← Package name (smaller, gray)
│     v1.2.3 • 45 MB                          │  ← Version + Size
│     ┌────────┐ ┌──────────────┐             │
│     │RUNNING │ │ 🔋 RESTRICTED│             │  ← Status badges
│     └────────┘ └──────────────┘             │
└─────────────────────────────────────────────┘
```

### Status Badges
| Badge | Color | Meaning |
|-------|-------|---------|
| `RUNNING` | 🟢 Green | App is currently running |
| `STOPPED` | ⚪ Gray | App is not running |
| `FROZEN` | 🔵 Blue | App is disabled |
| `🔋 RESTRICTED` | 🟠 Orange | Background restricted |
| `🔋 OK` | 🟢 Green | Background allowed |

### Protected App Indicator
- 🔒 Lock icon di kanan atas untuk system/critical apps
- Tooltip: "Protected system app"

---

## Sort & Filter (Simplified Dropdown)

Single dropdown button yang combine sort + filter:

```
┌─────────────────────────────────────────┐
│ 🔍 Search apps...              [All ▼]  │
└─────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────┐
                    │ FILTER                  │
                    │ ─────────────────────── │
                    │ ● All apps              │
                    │ ○ Running               │
                    │ ○ Frozen                │
                    │ ○ Restricted            │
                    │ ═══════════════════════ │
                    │ SORT BY                 │
                    │ ─────────────────────── │
                    │ ● Name (A-Z)            │
                    │ ○ Name (Z-A)            │
                    │ ○ Size                  │
                    │ ○ Last updated          │
                    └─────────────────────────┘
```

### Button Text States
- Default: `[All ▼]`
- Filter active: `[Running ▼]` atau `[Frozen ▼]`
- Sort changed: tetap tampilkan filter, sort di-apply silently

### Implementation
```kotlin
data class AppListFilter(
    val filterType: FilterType = FilterType.ALL,
    val sortType: SortType = SortType.NAME_ASC
)

enum class FilterType(val displayName: String) {
    ALL("All"),
    RUNNING("Running"),
    FROZEN("Frozen"),
    RESTRICTED("Restricted")
}

enum class SortType(val displayName: String) {
    NAME_ASC("Name (A-Z)"),
    NAME_DESC("Name (Z-A)"),
    SIZE_DESC("Size"),
    UPDATED_DESC("Last updated")
}
```

### UI - BottomSheetDialog (cleaner than PopupMenu)
```kotlin
binding.btnFilter.setOnClickListener {
    FilterSortBottomSheet.show(childFragmentManager) { filter ->
        viewModel.setFilter(filter)
        binding.btnFilter.text = filter.filterType.displayName
    }
}
```

---

## App Detail Bottom Sheet (Redesigned)

```
┌─────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← Drag handle
│                                         │
│     ┌─────┐                             │
│     │ 📱  │  Chrome                     │
│     │     │  com.android.chrome         │
│     └─────┘  v120.0.6099.144            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Status        │ Running              │ │
│ │ Background    │ Allowed              │ │
│ │ Size          │ 245 MB               │ │
│ │ Installed     │ Jan 15, 2024         │ │
│ │ Updated       │ Dec 28, 2025         │ │
│ │ Target SDK    │ API 34               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ─────────────── Actions ─────────────── │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Launch  │ │  Stop   │ │  Info   │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Freeze  │ │Restrict │ │ Clear   │    │
│ │         │ │   BG    │ │ Cache   │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         🗑️ Uninstall                │ │  ← Danger zone
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Selection Mode (Batch Operations)

### When apps are selected:
```
┌─────────────────────────────────────────┐
│ ✕  3 selected              [Select All] │  ← Selection header
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☑️ 📱  Chrome                       │ │  ← Checkbox visible
│ │      com.android.chrome             │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☑️ 📱  Instagram                    │ │
│ │      com.instagram.android          │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☑️ 📱  Twitter                      │ │
│ │      com.twitter.android            │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────┐ │  ← Action bar
│ │ Stop  │ │Freeze │ │Restrict│ │ More │ │
│ └───────┘ └───────┘ └───────┘ └──────┘ │
└─────────────────────────────────────────┘
```

---

## Settings Screen (Accessed via Overflow Menu)

```
┌─────────────────────────────────────────┐
│ ←  Settings                             │  ← Back button
├─────────────────────────────────────────┤
│                                         │
│ EXECUTION                               │
│ ┌─────────────────────────────────────┐ │
│ │ Current Mode                        │ │
│ │ Root Mode ✓                  [Change]│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ APPEARANCE                              │
│ ┌─────────────────────────────────────┐ │
│ │ Theme                               │ │
│ │ System Default                    > │ │
│ ├─────────────────────────────────────┤ │
│ │ Dynamic Colors                   🔘 │ │
│ │ Use colors from wallpaper           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ DISPLAY                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Min Refresh Rate                    │ │
│ │ 60 Hz                             > │ │
│ ├─────────────────────────────────────┤ │
│ │ Max Refresh Rate                    │ │
│ │ 120 Hz                            > │ │
│ ├─────────────────────────────────────┤ │
│ │ Reset Refresh Rate                > │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ SAFETY                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Confirm Actions                  🔘 │ │
│ │ Show confirmation before actions    │ │
│ ├─────────────────────────────────────┤ │
│ │ Protect System Apps              🔘 │ │
│ │ Prevent actions on critical apps    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ACTION LOGS                             │
│ ┌─────────────────────────────────────┐ │
│ │ View Action Logs                  > │ │
│ │ 24 actions logged                   │ │
│ ├─────────────────────────────────────┤ │
│ │ Rollback Last Action              > │ │
│ │ Restore previous app states         │ │
│ ├─────────────────────────────────────┤ │
│ │ Clear Action Logs                 > │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ DATA                                    │
│ ┌─────────────────────────────────────┐ │
│ │ Reset Setup                       > │ │
│ │ Restart the setup wizard            │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Navigation Flow

```
                    ┌─────────────┐
                    │   App Start │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐       ┌────────────────┐
     │ Setup Wizard   │       │   Main App     │
     │ (First Launch) │       │ (Setup Done)   │
     └───────┬────────┘       └───────┬────────┘
             │                        │
             ▼                        ▼
     ┌────────────────────────────────────────┐
     │           Top Tab Bar (ViewPager2)      │
     │  ┌──────────────┐  ┌──────────────┐    │
     │  │  Dashboard   │  │    Apps      │    │
     │  └──────────────┘  └──────────────┘    │
     └────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐       ┌────────────────┐
     │   Dashboard    │       │   Apps List    │
     │   Fragment     │       │   Fragment     │
     └────────────────┘       └───────┬────────┘
                                      │
                                      ├──► App Detail Sheet
                                      │
                                      └──► Batch Actions
             
     Overflow Menu (⋮) ──────────────────────┐
                                             │
                        ├──► Settings (Full Screen)
                        ├──► Action Logs (Bottom Sheet)
                        ├──► About (Full Screen)
                        └──► Reset Setup
```

---

## Implementation Tasks

### Phase 1: Navigation Restructure
- [ ] Remove BottomNavigationView from `activity_main.xml`
- [ ] Add TabLayout + ViewPager2 for top tabs
- [ ] Update header: Icon (left) | Title (center) | Overflow (right)
- [ ] Remove "Root Mode ✓" indicator from header
- [ ] Create overflow menu XML (`menu_main.xml`)
- [ ] Update `MainActivity.kt` - Handle TabLayout + ViewPager2
- [ ] Create `MainPagerAdapter.kt` for ViewPager2

### Phase 2: Apps List Redesign
- [ ] Update `fragment_app_list.xml` - New layout (tanpa segmented button)
- [ ] Update `item_app.xml` - New card design with badges
- [ ] Add sort dropdown
- [ ] Update `AppListAdapter.kt` - New ViewHolder
- [ ] Update `AppListViewModel.kt` - Add sort logic

### Phase 3: App Detail Redesign
- [ ] Update `bottom_sheet_app_detail.xml` - New layout
- [ ] Update `AppDetailBottomSheet.kt` - New bindings

### Phase 4: Settings as Full Screen
- [ ] Create `SettingsActivity.kt` or keep as Fragment
- [ ] Update navigation to open Settings from overflow menu

### Phase 5: Polish
- [ ] Add swipe gesture for tab switching
- [ ] Add animations for tab switching
- [ ] Test on different screen sizes

---

## Notes

- **NO bottom navigation** - pakai TabLayout di atas
- **NO mode indicator** di header (Root Mode ✓ dihapus)
- Header: Icon | AppControlX | ⋮
- Tab bar: Dashboard | Apps (dengan indicator line)
- Swipe gesture untuk pindah tab (ViewPager2)
- Settings, Action Logs, About → via overflow menu
- Settings jadi full-screen activity/fragment


---

## Improvement: Running Apps Detection (Android 12+)

### Problem
Current detection using `dumpsys activity processes` tidak akurat di Android 12+. `ActivityManager.getRunningAppProcesses()` juga sudah deprecated dan tidak reliable.

### Solution: Multi-Method Detection (Greenify Style)

Greenify menggunakan kombinasi beberapa metode:

#### 1. ApplicationInfo.FLAG_STOPPED (Primary)
```kotlin
// Check if app has been launched since device boot
val appInfo = packageManager.getApplicationInfo(packageName, 0)
val isStopped = (appInfo.flags and ApplicationInfo.FLAG_STOPPED) != 0

// FLAG_STOPPED = true  → App never launched / force-stopped
// FLAG_STOPPED = false → App has been launched (may be running)
```

**Pros:** Reliable, no special permission needed
**Cons:** Only tells if app was "awakened", not if currently running

#### 2. UsageStatsManager (Secondary)
```kotlin
// Requires PACKAGE_USAGE_STATS permission (user must enable manually)
val usageStatsManager = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
val endTime = System.currentTimeMillis()
val startTime = endTime - 60_000 // Last 1 minute

val events = usageStatsManager.queryEvents(startTime, endTime)
while (events.hasNextEvent()) {
    val event = UsageEvents.Event()
    events.getNextEvent(event)
    
    if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
        // App moved to foreground
    } else if (event.eventType == UsageEvents.Event.ACTIVITY_PAUSED) {
        // App moved to background
    }
}
```

**Pros:** Accurate foreground detection
**Cons:** Requires user to manually enable permission

#### 3. Running Services Check (Root/Shizuku)
```kotlin
// Via shell command
val result = executor.execute("dumpsys activity services $packageName")
// Parse output to check if app has running services
```

#### 4. Process Check via /proc (Root only)
```kotlin
// Read /proc to get actual running processes
val result = executor.execute("cat /proc/*/cmdline 2>/dev/null | tr '\\0' '\\n' | sort -u")
// Parse to get list of running package names
```

### Recommended Implementation

```kotlin
enum class AppRunningState {
    RUNNING,      // Confirmed running (foreground or background service)
    AWAKENED,     // Has been launched but may not be running now
    STOPPED,      // Never launched or force-stopped
    UNKNOWN       // Cannot determine
}

suspend fun getAppRunningState(packageName: String, mode: ExecutionMode): AppRunningState {
    // 1. Check FLAG_STOPPED first (fast, no permission)
    val appInfo = packageManager.getApplicationInfo(packageName, 0)
    val isStopped = (appInfo.flags and ApplicationInfo.FLAG_STOPPED) != 0
    
    if (isStopped) {
        return AppRunningState.STOPPED
    }
    
    // 2. If Root/Shizuku available, check running services & /proc
    if (mode == ExecutionMode.Root || mode == ExecutionMode.Shizuku) {
        // Check /proc for actual running processes (most accurate)
        val isInProc = checkProcProcesses(packageName)
        if (isInProc) {
            return AppRunningState.RUNNING
        }
        
        // Check running services via dumpsys
        val hasRunningService = checkRunningServices(packageName)
        if (hasRunningService) {
            return AppRunningState.RUNNING
        }
        
        // Not in /proc and no running services = just awakened
        return AppRunningState.AWAKENED
    }
    
    // 3. Non-root mode: Use UsageStats if permission granted
    if (mode == ExecutionMode.None && hasUsageStatsPermission()) {
        val isRecentlyActive = checkRecentUsage(packageName, timeWindowMs = 60_000)
        if (isRecentlyActive) {
            return AppRunningState.RUNNING
        }
        return AppRunningState.AWAKENED
    }
    
    // 4. No way to determine - app was awakened but can't confirm
    return AppRunningState.AWAKENED
}
```

### Detection Priority by Mode

| Mode | Primary | Secondary | Fallback |
|------|---------|-----------|----------|
| **Root** | /proc check | dumpsys services | FLAG_STOPPED |
| **Shizuku** | dumpsys services | FLAG_STOPPED | - |
| **None (View-Only)** | UsageStatsManager | FLAG_STOPPED | - |

### UI Display

| State | Badge | Color |
|-------|-------|-------|
| RUNNING | `RUNNING` | 🟢 Green |
| AWAKENED | `AWAKE` | 🟡 Yellow |
| STOPPED | `STOPPED` | ⚪ Gray |
| UNKNOWN | (no badge) | - |

### Files to Update
- `AppScanner.kt` - Add new detection methods
- `AppInfo.kt` - Add `runningState: AppRunningState` field
- `SystemInfo.kt` - Add `AppRunningState` enum
- `AppListAdapter.kt` - Update badge display logic
