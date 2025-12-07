# Building AppControlX

Panduan lengkap untuk build, setup development environment, dan cara kerja teknis aplikasi.

## Prerequisites

### Tools yang Dibutuhkan
- **Android Studio** Hedgehog (2023.1.1) atau lebih baru
- **JDK 17** (bundled dengan Android Studio)
- **Android SDK** API 33+ (Android 13)
- **Git** untuk version control

### Device Requirements untuk Testing
- Android 10+ (API 29 minimum)
- Salah satu dari:
  - Device dengan **Root access** (Magisk recommended)
  - Device dengan **Shizuku** terinstall
  - Device biasa (untuk test view-only mode)

## Setup Development Environment

### 1. Clone Repository
```bash
git clone https://github.com/user/AppControlX.git
cd AppControlX
```

### 2. Open di Android Studio
- File → Open → pilih folder `AppControlX`
- Tunggu Gradle sync selesai
- Jika ada error SDK, ikuti prompt untuk install missing SDK

### 3. Setup Signing (Optional untuk Debug)
Untuk debug build, tidak perlu signing config. APK akan otomatis di-sign dengan debug keystore.

## Build Commands

### Debug Build (Recommended untuk Development)
```bash
# Via terminal
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Release Build
```bash
# Perlu signing config di build.gradle.kts
./gradlew assembleRelease
```

### Run Tests
```bash
# Unit tests
./gradlew test

# Instrumented tests (perlu device/emulator)
./gradlew connectedAndroidTest
```

### Clean Build
```bash
./gradlew clean assembleDebug
```

## GitHub Actions CI/CD

Build otomatis akan berjalan setiap push ke branch `main`:

```yaml
# .github/workflows/android-ci.yml
name: Android CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      - name: Run Unit Tests
        run: ./gradlew test

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: app/build/outputs/apk/debug/app-debug.apk
```

---

## Cara Kerja Aplikasi (Technical Deep Dive)

### 0. User Setup (Onboarding Flow)

Setup wizard yang muncul saat pertama kali membuka aplikasi.

#### SetupActivity.kt
```kotlin
// SetupActivity.kt
class SetupActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivitySetupBinding
    private val setupPrefs by lazy { 
        getSharedPreferences("setup_prefs", MODE_PRIVATE) 
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Skip setup jika sudah selesai
        if (setupPrefs.getBoolean("setup_complete", false)) {
            startMainActivity()
            return
        }
        
        binding = ActivitySetupBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Setup ViewPager dengan fragments
        setupViewPager()
    }
    
    private fun setupViewPager() {
        val fragments = mutableListOf(
            ModeSelectionFragment(),
            PermissionsFragment()
        )
        
        // Tambah Xiaomi setup jika device Xiaomi
        if (XiaomiBridge(this, null).isXiaomiDevice()) {
            fragments.add(XiaomiSetupFragment())
        }
        
        fragments.add(SetupCompleteFragment())
        
        binding.viewPager.adapter = SetupPagerAdapter(this, fragments)
        binding.viewPager.isUserInputEnabled = false // Disable swipe
    }
    
    fun nextStep() {
        binding.viewPager.currentItem++
    }
    
    fun completeSetup() {
        setupPrefs.edit().putBoolean("setup_complete", true).apply()
        startMainActivity()
    }
    
    private fun startMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
```

#### ModeSelectionFragment.kt
```kotlin
// ModeSelectionFragment.kt
class ModeSelectionFragment : Fragment() {
    
    private lateinit var binding: FragmentModeSelectionBinding
    private val permissionBridge by lazy { PermissionBridge() }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        checkAvailableModes()
        setupModeSelection()
    }
    
    private fun checkAvailableModes() {
        // Check Root
        val hasRoot = Shell.isAppGrantedRoot() == true
        binding.radioRoot.isEnabled = hasRoot
        updateStatusView(binding.rootStatus, binding.rootIcon, hasRoot, 
            R.string.status_available, R.string.status_not_available)
        
        // Check Shizuku
        val hasShizuku = try {
            Shizuku.pingBinder()
        } catch (e: Exception) {
            false
        }
        binding.radioShizuku.isEnabled = hasShizuku
        updateStatusView(binding.shizukuStatus, binding.shizukuIcon, hasShizuku,
            R.string.status_running, R.string.status_not_running)
        
        // Auto-select best available mode
        when {
            hasRoot -> binding.radioRoot.isChecked = true
            hasShizuku -> binding.radioShizuku.isChecked = true
            else -> binding.radioViewOnly.isChecked = true
        }
    }
    
    private fun setupModeSelection() {
        binding.btnCheckRoot.setOnClickListener {
            // Request root permission
            lifecycleScope.launch {
                val result = Shell.cmd("id").exec()
                if (result.isSuccess) {
                    showToast("Root access granted!")
                    checkAvailableModes()
                } else {
                    showToast("Root access denied")
                }
            }
        }
        
        binding.btnInstallShizuku.setOnClickListener {
            // Open Shizuku on Play Store
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("market://details?id=moe.shizuku.privileged.api")
            }
            startActivity(intent)
        }
        
        binding.btnNext.setOnClickListener {
            saveSelectedMode()
            (activity as SetupActivity).nextStep()
        }
    }
    
    private fun saveSelectedMode() {
        val mode = when {
            binding.radioRoot.isChecked -> "root"
            binding.radioShizuku.isChecked -> "shizuku"
            else -> "none"
        }
        PreferenceManager.getDefaultSharedPreferences(requireContext())
            .edit().putString("execution_mode", mode).apply()
    }
}
```

#### PermissionsFragment.kt
```kotlin
// PermissionsFragment.kt
class PermissionsFragment : Fragment() {
    
    private lateinit var binding: FragmentPermissionsBinding
    
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        updatePermissionStatus()
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        updatePermissionStatus()
        setupPermissionButtons()
    }
    
    private fun updatePermissionStatus() {
        // Notification permission (Android 13+)
        val hasNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                requireContext(), 
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true // Not needed below Android 13
        }
        updateStatusView(binding.notificationStatus, binding.notificationIcon, hasNotification,
            R.string.status_granted, R.string.status_not_granted)
        binding.btnNotification.isEnabled = !hasNotification
        
        // Query all packages (auto-granted from manifest)
        updateStatusView(binding.queryPackagesStatus, binding.queryPackagesIcon, true,
            R.string.status_granted_auto, R.string.status_granted_auto)
        
        // Battery optimization
        val pm = requireContext().getSystemService(Context.POWER_SERVICE) as PowerManager
        val isIgnoring = pm.isIgnoringBatteryOptimizations(requireContext().packageName)
        updateStatusView(binding.batteryStatus, binding.batteryIcon, isIgnoring,
            R.string.status_exempted, R.string.status_not_exempted, 
            optionalIcon = R.drawable.ic_circle_outline)
    }
    
    // Helper function untuk update status dengan icon native
    private fun updateStatusView(
        textView: TextView, 
        iconView: ImageView, 
        isPositive: Boolean,
        positiveStringRes: Int,
        negativeStringRes: Int,
        optionalIcon: Int? = null
    ) {
        textView.text = getString(if (isPositive) positiveStringRes else negativeStringRes)
        iconView.setImageResource(
            when {
                isPositive -> R.drawable.ic_check_circle
                optionalIcon != null -> optionalIcon
                else -> R.drawable.ic_cancel
            }
        )
        iconView.setColorFilter(
            ContextCompat.getColor(requireContext(), 
                if (isPositive) R.color.status_positive 
                else if (optionalIcon != null) R.color.status_neutral
                else R.color.status_negative
            )
        )
    }
    
    private fun setupPermissionButtons() {
        binding.btnNotification.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        
        binding.btnBattery.setOnClickListener {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${requireContext().packageName}")
            }
            startActivity(intent)
        }
        
        binding.btnNext.setOnClickListener {
            (activity as SetupActivity).nextStep()
        }
    }
    
    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
    }
}
```

#### XiaomiSetupFragment.kt
```kotlin
// XiaomiSetupFragment.kt
class XiaomiSetupFragment : Fragment() {
    
    private lateinit var binding: FragmentXiaomiSetupBinding
    private val xiaomiBridge by lazy { XiaomiBridge(requireContext(), null) }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        detectXiaomiUI()
        setupButtons()
    }
    
    private fun detectXiaomiUI() {
        val ui = xiaomiBridge.getXiaomiUI()
        binding.tvDetectedUI.text = when (ui) {
            is XiaomiBridge.XiaomiUI.MIUI -> "MIUI ${ui.version} detected"
            is XiaomiBridge.XiaomiUI.HyperOS -> "HyperOS ${ui.version} detected"
            else -> "Unknown Xiaomi UI"
        }
    }
    
    private fun setupButtons() {
        binding.btnAutostart.setOnClickListener {
            val success = xiaomiBridge.openAutoStartSettings()
            if (!success) {
                showToast("Could not open Autostart settings")
            }
        }
        
        binding.btnBatterySaver.setOnClickListener {
            val success = xiaomiBridge.openBatterySaverSettings()
            if (!success) {
                showToast("Could not open Battery settings")
            }
        }
        
        binding.btnLockTutorial.setOnClickListener {
            showLockAppTutorial()
        }
        
        binding.btnNext.setOnClickListener {
            (activity as SetupActivity).nextStep()
        }
        
        binding.btnSkip.setOnClickListener {
            (activity as SetupActivity).nextStep()
        }
    }
    
    private fun showLockAppTutorial() {
        AlertDialog.Builder(requireContext())
            .setTitle(R.string.lock_app_title)
            .setMessage(R.string.lock_app_tutorial)
            .setPositiveButton(android.R.string.ok, null)
            .show()
    }
}

// strings.xml
// <string name="lock_app_title">Lock App in Recents</string>
// <string name="lock_app_tutorial">Untuk mencegah AppControlX di-kill oleh sistem:\n\n1. Buka Recent Apps (tombol kotak)\n2. Swipe down pada AppControlX\n3. Tap ikon gembok (lock icon)\n\nIni akan mengunci app agar tidak di-kill saat clear recents.</string>
```

#### SetupCompleteFragment.kt
```kotlin
// SetupCompleteFragment.kt
class SetupCompleteFragment : Fragment() {
    
    private lateinit var binding: FragmentSetupCompleteBinding
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        showSetupSummary()
        
        binding.btnStart.setOnClickListener {
            (activity as SetupActivity).completeSetup()
        }
    }
    
    private fun showSetupSummary() {
        val prefs = PreferenceManager.getDefaultSharedPreferences(requireContext())
        val mode = prefs.getString("execution_mode", "none")
        
        binding.tvMode.text = when (mode) {
            "root" -> "Root Mode"
            "shizuku" -> "Shizuku Mode"
            else -> "View-Only Mode"
        }
        
        // Check notification
        val hasNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                requireContext(), 
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else true
        updateSummaryItem(binding.notificationIcon, binding.tvNotification, hasNotification,
            R.string.status_enabled, R.string.status_disabled)
        
        // Check Xiaomi
        val xiaomiBridge = XiaomiBridge(requireContext(), null)
        if (xiaomiBridge.isXiaomiDevice()) {
            binding.xiaomiSection.visibility = View.VISIBLE
            updateSummaryItem(binding.xiaomiIcon, binding.tvXiaomiSetup, true,
                R.string.status_configured, R.string.status_configured)
        } else {
            binding.xiaomiSection.visibility = View.GONE
        }
    }
    
    private fun updateSummaryItem(
        iconView: ImageView,
        textView: TextView,
        isPositive: Boolean,
        positiveRes: Int,
        negativeRes: Int
    ) {
        textView.text = getString(if (isPositive) positiveRes else negativeRes)
        iconView.setImageResource(
            if (isPositive) R.drawable.ic_check_circle else R.drawable.ic_cancel
        )
        iconView.setColorFilter(
            ContextCompat.getColor(requireContext(),
                if (isPositive) R.color.status_positive else R.color.status_negative
            )
        )
    }
}
```

#### Resources - Drawable Icons (Material Icons)

Gunakan Material Icons dari library atau buat vector drawable:

```xml
<!-- res/drawable/ic_check_circle.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM10,17l-5,-5 1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z"/>
</vector>

<!-- res/drawable/ic_cancel.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M12,2C6.47,2 2,6.47 2,12s4.47,10 10,10 10,-4.47 10,-10S17.53,2 12,2zM17,15.59L15.59,17 12,13.41 8.41,17 7,15.59 10.59,12 7,8.41 8.41,7 12,10.59 15.59,7 17,8.41 13.41,12 17,15.59z"/>
</vector>

<!-- res/drawable/ic_circle_outline.xml -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM12,20c-4.42,0 -8,-3.58 -8,-8s3.58,-8 8,-8 8,3.58 8,8 -3.58,8 -8,8z"/>
</vector>
```

#### Resources - Strings
```xml
<!-- res/values/strings.xml -->
<resources>
    <string name="app_name">AppControlX</string>
    
    <!-- Status strings -->
    <string name="status_available">Available</string>
    <string name="status_not_available">Not available</string>
    <string name="status_running">Running</string>
    <string name="status_not_running">Not running</string>
    <string name="status_granted">Granted</string>
    <string name="status_not_granted">Not granted</string>
    <string name="status_granted_auto">Granted (from manifest)</string>
    <string name="status_exempted">Exempted</string>
    <string name="status_not_exempted">Not exempted</string>
    <string name="status_enabled">Enabled</string>
    <string name="status_disabled">Disabled</string>
    <string name="status_configured">Configured</string>
    
    <!-- Lock app tutorial -->
    <string name="lock_app_title">Lock App in Recents</string>
    <string name="lock_app_tutorial">Untuk mencegah AppControlX di-kill oleh sistem:\n\n1. Buka Recent Apps (tombol kotak)\n2. Swipe down pada AppControlX\n3. Tap ikon gembok (lock icon)\n\nIni akan mengunci app agar tidak di-kill saat clear recents.</string>
</resources>
```

#### Resources - Colors
```xml
<!-- res/values/colors.xml -->
<resources>
    <color name="status_positive">#4CAF50</color>  <!-- Green -->
    <color name="status_negative">#F44336</color>  <!-- Red -->
    <color name="status_neutral">#9E9E9E</color>   <!-- Gray -->
</resources>
```

#### AndroidManifest.xml - Permissions
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Required Permissions -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    
    <!-- Shizuku -->
    <uses-permission android:name="moe.shizuku.manager.permission.API_V23" />
    
    <application>
        <!-- Setup sebagai launcher activity -->
        <activity
            android:name=".ui.setup.SetupActivity"
            android:exported="true"
            android:theme="@style/Theme.AppControlX.Setup">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity
            android:name=".ui.MainActivity"
            android:exported="false" />
            
        <!-- Shizuku Provider -->
        <provider
            android:name="rikka.shizuku.ShizukuProvider"
            android:authorities="${applicationId}.shizuku"
            android:enabled="true"
            android:exported="true"
            android:multiprocess="false"
            android:permission="android.permission.INTERACT_ACROSS_USERS_FULL" />
    </application>
</manifest>
```

---

### 1. Permission Detection (PermissionBridge)

Aplikasi pertama kali akan mendeteksi mode eksekusi yang tersedia:

```kotlin
// PermissionBridge.kt
sealed class ExecutionMode {
    object Root : ExecutionMode()      // su binary tersedia
    object Shizuku : ExecutionMode()   // Shizuku service running
    object None : ExecutionMode()      // Fallback view-only
}

class PermissionBridge {
    fun detectMode(): ExecutionMode {
        // 1. Cek root dulu (prioritas tertinggi)
        if (Shell.isAppGrantedRoot() == true) {
            return ExecutionMode.Root
        }
        
        // 2. Cek Shizuku
        if (Shizuku.pingBinder() && Shizuku.checkSelfPermission() == PERMISSION_GRANTED) {
            return ExecutionMode.Shizuku
        }
        
        // 3. Fallback
        return ExecutionMode.None
    }
}
```

**Referensi:**
- [libsu by topjohnwu](https://github.com/topjohnwu/libsu) - Library untuk root shell execution
- [Shizuku API](https://github.com/RikkaApps/Shizuku-API) - Official Shizuku integration

### 2. Fetching Installed Apps (AppFetcher)

Menggunakan `PackageManager` untuk mendapatkan daftar aplikasi:

```kotlin
// AppFetcher.kt
class AppFetcher(private val context: Context) {
    
    fun getAllApps(): List<AppInfo> {
        val pm = context.packageManager
        val packages = pm.getInstalledPackages(PackageManager.GET_META_DATA)
        
        return packages.map { pkg ->
            AppInfo(
                packageName = pkg.packageName,
                appName = pkg.applicationInfo.loadLabel(pm).toString(),
                icon = pkg.applicationInfo.loadIcon(pm),
                isSystemApp = (pkg.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
                isEnabled = pkg.applicationInfo.enabled
            )
        }
    }
    
    fun getUserApps(): List<AppInfo> = getAllApps().filter { !it.isSystemApp }
    fun getSystemApps(): List<AppInfo> = getAllApps().filter { it.isSystemApp }
}
```

**Android 11+ Package Visibility:**

Mulai Android 11 (API 30), app tidak bisa melihat semua installed packages secara default. Untuk AppControlX yang perlu list SEMUA apps:

```xml
<!-- AndroidManifest.xml -->
<manifest>
    <!-- RECOMMENDED: Query all packages -->
    <!-- Perlu justifikasi saat submit ke Play Store -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    
    <!-- ALTERNATIVE: Query specific intents only -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>
</manifest>
```

> 📝 **Play Store Note**: Jika menggunakan `QUERY_ALL_PACKAGES`, siapkan justifikasi:
> *"App management tool that needs to display and control all installed applications for battery optimization purposes."*

### 3. Background Restriction via AppOps

**AppOps** adalah sistem internal Android untuk mengontrol permission per-app. Kita menggunakan command `appops` via shell:

```kotlin
// BatteryPolicyManager.kt
class BatteryPolicyManager(private val executor: CommandExecutor) {
    
    // Matikan background activity
    fun restrictBackground(packageName: String): Result<Unit> {
        val commands = listOf(
            "appops set $packageName RUN_IN_BACKGROUND ignore",
            "appops set $packageName RUN_ANY_IN_BACKGROUND ignore",
            "appops set $packageName WAKE_LOCK ignore"
        )
        return executor.executeBatch(commands)
    }
    
    // Kembalikan ke default
    fun allowBackground(packageName: String): Result<Unit> {
        val commands = listOf(
            "appops set $packageName RUN_IN_BACKGROUND allow",
            "appops set $packageName RUN_ANY_IN_BACKGROUND allow",
            "appops set $packageName WAKE_LOCK allow"
        )
        return executor.executeBatch(commands)
    }
    
    // Cek status current
    fun getBackgroundStatus(packageName: String): BackgroundStatus {
        val result = executor.execute("appops get $packageName RUN_IN_BACKGROUND")
        return when {
            result.contains("ignore") -> BackgroundStatus.RESTRICTED
            result.contains("allow") -> BackgroundStatus.ALLOWED
            else -> BackgroundStatus.DEFAULT
        }
    }
}
```

**AppOps Operations yang Digunakan:**

| Operation | Kode | Fungsi |
|-----------|------|--------|
| `RUN_IN_BACKGROUND` | 63 | Kontrol background execution |
| `RUN_ANY_IN_BACKGROUND` | 70 | Kontrol semua background activity |
| `WAKE_LOCK` | 40 | Kontrol wake lock (keep CPU awake) |
| `START_FOREGROUND` | 76 | Kontrol foreground service |

**Referensi:**
- [Android AppOpsManager](https://developer.android.com/reference/android/app/AppOpsManager)
- [AppOps Operations List](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/app/AppOpsManager.java)

### 4. Root Execution (libsu)

Menggunakan **libsu** dari topjohnwu (pembuat Magisk):

```kotlin
// RootExecutor.kt
class RootExecutor : CommandExecutor {
    
    override fun execute(command: String): Result<String> {
        return try {
            val result = Shell.cmd(command).exec()
            if (result.isSuccess) {
                Result.success(result.out.joinToString("\n"))
            } else {
                Result.failure(Exception(result.err.joinToString("\n")))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun executeBatch(commands: List<String>): Result<Unit> {
        return try {
            val result = Shell.cmd(*commands.toTypedArray()).exec()
            if (result.isSuccess) Result.success(Unit)
            else Result.failure(Exception(result.err.joinToString("\n")))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

**Setup libsu di Application class:**

```kotlin
// App.kt
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Konfigurasi libsu
        Shell.enableVerboseLogging = BuildConfig.DEBUG
        Shell.setDefaultBuilder(
            Shell.Builder.create()
                .setFlags(Shell.FLAG_MOUNT_MASTER)
                .setTimeout(10)
        )
    }
}
```

**Referensi:** [libsu Documentation](https://github.com/topjohnwu/libsu)

### 5. Shizuku Execution

**Shizuku** memungkinkan elevated API access tanpa root dengan cara menjalankan service di ADB shell level.

> ⚠️ **Note**: `Shizuku.newProcess()` sudah deprecated. Gunakan **UserService** pattern.

#### Step 1: Buat AIDL Interface
```aidl
// src/main/aidl/com/appcontrolx/IShellService.aidl
package com.appcontrolx;

interface IShellService {
    String exec(String command);
    int execReturnCode(String command);
}
```

#### Step 2: Implement Service (berjalan di Shizuku process)
```kotlin
// ShellService.kt
class ShellService : IShellService.Stub() {
    
    override fun exec(command: String): String {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val output = process.inputStream.bufferedReader().readText()
            process.waitFor()
            output
        } catch (e: Exception) {
            "ERROR: ${e.message}"
        }
    }
    
    override fun execReturnCode(command: String): Int {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            process.waitFor()
        } catch (e: Exception) {
            -1
        }
    }
}
```

#### Step 3: Bind Service via Shizuku
```kotlin
// ShizukuExecutor.kt
class ShizukuExecutor(private val context: Context) : CommandExecutor {
    
    private var shellService: IShellService? = null
    
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            shellService = IShellService.Stub.asInterface(service)
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            shellService = null
        }
    }
    
    fun bindService() {
        if (!Shizuku.pingBinder()) return
        
        val args = Shizuku.UserServiceArgs(
            ComponentName(context, ShellService::class.java)
        ).daemon(false).processNameSuffix("shell")
        
        Shizuku.bindUserService(args, serviceConnection)
    }
    
    override fun execute(command: String): Result<String> {
        val service = shellService 
            ?: return Result.failure(Exception("Shizuku service not bound"))
        
        return try {
            val output = service.exec(command)
            if (output.startsWith("ERROR:")) {
                Result.failure(Exception(output))
            } else {
                Result.success(output)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

**Setup Shizuku di AndroidManifest.xml:**

```xml
<manifest>
    <!-- Shizuku permission -->
    <uses-permission android:name="moe.shizuku.manager.permission.API_V23" />
    
    <application>
        <!-- Shizuku provider -->
        <provider
            android:name="rikka.shizuku.ShizukuProvider"
            android:authorities="${applicationId}.shizuku"
            android:enabled="true"
            android:exported="true"
            android:multiprocess="false"
            android:permission="android.permission.INTERACT_ACROSS_USERS_FULL" />
    </application>
</manifest>
```

**Referensi:**
- [Shizuku](https://github.com/RikkaApps/Shizuku)
- [Shizuku-API](https://github.com/RikkaApps/Shizuku-API)

### 6. Xiaomi UI Handling (MIUI & HyperOS)

Xiaomi memiliki 2 UI yang berbeda:
- **MIUI** (versi 10-14) — UI lama, masih digunakan di beberapa device
- **HyperOS** (versi 1-2) — UI baru, menggantikan MIUI sejak 2023

Keduanya punya battery restriction yang override Android standard.

#### Perbedaan MIUI vs HyperOS

| Aspek | MIUI 12-14 | HyperOS 1-2 |
|-------|------------|-------------|
| Property | `ro.miui.ui.version.name` = V12-V14 | `ro.mi.os.version.name` = OS1.x |
| Security Center | `com.miui.securitycenter` | `com.miui.securitycenter` (sama) |
| PowerKeeper | `com.miui.powerkeeper` | `com.miui.powerkeeper` (sama) |
| Battery UI | PowerCenter | Redesigned Battery UI |
| Autostart | AutoStartManagementActivity | AutoStartManagementActivity (sama) |

#### Detection Code

```kotlin
// XiaomiBridge.kt (renamed from MIUIBridge)
class XiaomiBridge(
    private val context: Context,
    private val executor: CommandExecutor
) {
    
    // ========== Device Detection ==========
    
    fun isXiaomiDevice(): Boolean {
        return Build.MANUFACTURER.equals("Xiaomi", ignoreCase = true) ||
               Build.BRAND.equals("Redmi", ignoreCase = true) ||
               Build.BRAND.equals("POCO", ignoreCase = true)
    }
    
    fun getXiaomiUI(): XiaomiUI {
        if (!isXiaomiDevice()) return XiaomiUI.None
        
        // Check HyperOS first (newer)
        val hyperOsVersion = getSystemProperty("ro.mi.os.version.name")
        if (hyperOsVersion.isNotBlank()) {
            val version = parseHyperOSVersion(hyperOsVersion)
            return XiaomiUI.HyperOS(version)
        }
        
        // Check MIUI
        val miuiVersion = getSystemProperty("ro.miui.ui.version.name")
        if (miuiVersion.isNotBlank()) {
            val version = parseMIUIVersion(miuiVersion)
            return XiaomiUI.MIUI(version)
        }
        
        return XiaomiUI.None
    }
    
    private fun getSystemProperty(key: String): String {
        return try {
            executor.execute("getprop $key").getOrNull()?.trim() ?: ""
        } catch (e: Exception) {
            ""
        }
    }
    
    private fun parseMIUIVersion(version: String): Int {
        // V14, V13, V12, etc.
        return version.replace("V", "").toIntOrNull() ?: 0
    }
    
    private fun parseHyperOSVersion(version: String): Float {
        // OS1.0, OS1.5, OS2.0, etc.
        return version.replace("OS", "").toFloatOrNull() ?: 0f
    }
    
    // ========== UI Detection Result ==========
    
    sealed class XiaomiUI {
        object None : XiaomiUI()
        data class MIUI(val version: Int) : XiaomiUI()      // 10, 11, 12, 13, 14
        data class HyperOS(val version: Float) : XiaomiUI() // 1.0, 1.5, 2.0
    }
    
    // ========== Autostart Settings ==========
    
    fun openAutoStartSettings(): Boolean {
        // Same activity for both MIUI and HyperOS
        val intents = listOf(
            // Primary - works on MIUI 10+ and HyperOS
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            },
            // Fallback - older MIUI
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.permissions.AppPermissionsEditorActivity"
                )
            },
            // HyperOS alternative path
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.MainAc498tivity"
                )
            }
        )
        
        return tryStartActivities(intents)
    }
    
    // ========== Battery Settings ==========
    
    fun openBatterySaverSettings(): Boolean {
        val ui = getXiaomiUI()
        
        val intents = when (ui) {
            is XiaomiUI.HyperOS -> listOf(
                // HyperOS 1-2 battery settings
                Intent().apply {
                    component = ComponentName(
                        "com.miui.powerkeeper",
                        "com.miui.powerkeeper.ui.HiddenAppsContainerManagementActivity"
                    )
                },
                Intent().apply {
                    component = ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.powercenter.PowerSettings"
                    )
                }
            )
            is XiaomiUI.MIUI -> listOf(
                // MIUI 12-14 battery settings
                Intent().apply {
                    component = ComponentName(
                        "com.miui.powerkeeper",
                        "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"
                    )
                },
                Intent().apply {
                    component = ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.powercenter.PowerSettings"
                    )
                }
            )
            else -> emptyList()
        }
        
        return tryStartActivities(intents)
    }
    
    // ========== App-specific Battery Settings ==========
    
    fun openAppBatterySettings(packageName: String): Boolean {
        val intents = listOf(
            // Direct app battery settings (MIUI 12+ / HyperOS)
            Intent().apply {
                component = ComponentName(
                    "com.miui.powerkeeper",
                    "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"
                )
                putExtra("package_name", packageName)
            },
            // Alternative
            Intent("miui.intent.action.POWER_HIDE_MODE_APP_LIST").apply {
                putExtra("package_name", packageName)
            }
        )
        
        return tryStartActivities(intents)
    }
    
    // ========== Helper ==========
    
    private fun tryStartActivities(intents: List<Intent>): Boolean {
        return intents.any { intent ->
            try {
                context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                true
            } catch (e: Exception) {
                false
            }
        }
    }
    
    // ========== Root-based Methods (Requires Root) ==========
    
    // Disable battery optimization via appops (works on MIUI with root)
    fun disableBatteryOptimization(packageName: String): Result<Unit> {
        // Standard Android appops juga bekerja di MIUI dengan root
        val commands = listOf(
            "appops set $packageName RUN_IN_BACKGROUND allow",
            "appops set $packageName RUN_ANY_IN_BACKGROUND allow",
            // MIUI specific - whitelist dari battery saver
            "cmd deviceidle whitelist +$packageName"
        )
        return executor.executeBatch(commands)
    }
}
```

**Xiaomi UI Detection Commands:**
```bash
# MIUI Detection
getprop ro.miui.ui.version.name       # Output: V14, V13, V12, etc.
getprop ro.miui.ui.version.code       # Output: 14, 13, 12, etc.

# HyperOS Detection
getprop ro.mi.os.version.name         # Output: OS1.0, OS1.5, OS2.0, etc.
getprop ro.mi.os.version.code         # Output: 1, 2, etc.

# Common Xiaomi props
getprop ro.build.version.incremental  # Build number
getprop ro.product.mod_device         # Device codename
```

**Supported Xiaomi UI Versions:**

| UI | Version | Android Base | Status |
|----|---------|--------------|--------|
| MIUI | 12 | Android 10-11 | ✅ Supported |
| MIUI | 13 | Android 11-12 | ✅ Supported |
| MIUI | 14 | Android 13 | ✅ Supported |
| HyperOS | 1.0 | Android 14 | ✅ Supported |
| HyperOS | 1.5 | Android 14 | ✅ Supported |
| HyperOS | 2.0 | Android 15 | ✅ Supported |

**Referensi:**
- [Don't Kill My App - Xiaomi](https://dontkillmyapp.com/xiaomi) - Database battery restrictions
- [MIUI/HyperOS Hidden Settings](https://github.com/nickcao/awesome-shizuku)

### 7. Safety Validation

Mencegah user disable critical system apps:

```kotlin
// SafetyValidator.kt
object SafetyValidator {
    
    // Apps yang TIDAK BOLEH di-disable
    private val CRITICAL_PACKAGES = setOf(
        "com.android.systemui",
        "com.android.settings",
        "com.android.phone",
        "com.android.server.telecom",
        "com.android.providers.settings",
        "com.android.providers.contacts",
        "com.android.inputmethod.latin",
        "com.android.launcher3",
        "com.google.android.gms",           // Google Play Services
        "com.google.android.gsf",           // Google Services Framework
        "com.android.vending",              // Play Store
        "android"                           // System
    )
    
    // Apps yang WARNING tapi boleh di-disable
    private val WARNING_PACKAGES = setOf(
        "com.google.android.apps.messaging",
        "com.google.android.dialer",
        "com.google.android.contacts"
    )
    
    fun validate(packages: List<String>): ValidationResult {
        val blocked = packages.filter { it in CRITICAL_PACKAGES }
        val warnings = packages.filter { it in WARNING_PACKAGES }
        val safe = packages.filter { it !in CRITICAL_PACKAGES && it !in WARNING_PACKAGES }
        
        return ValidationResult(
            blocked = blocked,
            warnings = warnings,
            safe = safe,
            canProceed = blocked.isEmpty()
        )
    }
}

data class ValidationResult(
    val blocked: List<String>,
    val warnings: List<String>,
    val safe: List<String>,
    val canProceed: Boolean
)
```

### 8. Rollback System

Menyimpan state sebelum eksekusi untuk recovery:

```kotlin
// RollbackManager.kt
class RollbackManager(
    private val context: Context,
    private val executor: CommandExecutor
) {
    private val gson = Gson()
    private val snapshotFile = File(context.filesDir, "rollback_snapshot.json")
    
    // Simpan state sebelum aksi
    fun saveSnapshot(packages: List<String>): StateSnapshot {
        val states = packages.map { pkg ->
            val bgStatus = executor.execute("appops get $pkg RUN_IN_BACKGROUND")
            val wlStatus = executor.execute("appops get $pkg WAKE_LOCK")
            
            AppState(
                packageName = pkg,
                runInBackground = parseAppOpsValue(bgStatus.getOrDefault("")),
                wakeLock = parseAppOpsValue(wlStatus.getOrDefault("")),
                timestamp = System.currentTimeMillis()
            )
        }
        
        val snapshot = StateSnapshot(
            id = UUID.randomUUID().toString(),
            states = states,
            createdAt = System.currentTimeMillis()
        )
        
        // Persist ke file
        snapshotFile.writeText(gson.toJson(snapshot))
        
        return snapshot
    }
    
    // Restore dari snapshot
    fun rollback(): Result<Unit> {
        if (!snapshotFile.exists()) {
            return Result.failure(Exception("No snapshot found"))
        }
        
        val snapshot = gson.fromJson(snapshotFile.readText(), StateSnapshot::class.java)
        
        val commands = snapshot.states.flatMap { state ->
            listOf(
                "appops set ${state.packageName} RUN_IN_BACKGROUND ${state.runInBackground}",
                "appops set ${state.packageName} WAKE_LOCK ${state.wakeLock}"
            )
        }
        
        return executor.executeBatch(commands)
    }
    
    private fun parseAppOpsValue(output: String): String {
        return when {
            output.contains("ignore") -> "ignore"
            output.contains("deny") -> "deny"
            else -> "allow"
        }
    }
}

data class StateSnapshot(
    val id: String,
    val states: List<AppState>,
    val createdAt: Long
)

data class AppState(
    val packageName: String,
    val runInBackground: String,
    val wakeLock: String,
    val timestamp: Long
)
```

---

### 9. Fallback System (Manual Mode)

Jika command gagal, aplikasi akan fallback ke manual mode dengan membuka settings yang relevan:

```kotlin
// FallbackManager.kt
class FallbackManager(private val context: Context) {
    
    // Buka App Info untuk disable/uninstall manual
    fun openAppInfo(packageName: String): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    // Buka Battery Optimization settings
    fun openBatterySettings(packageName: String): Boolean {
        return try {
            // Try specific app battery settings first (Android 6+)
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            // Fallback to general battery settings
            openGeneralBatterySettings()
        }
    }
    
    // Buka general battery optimization list
    fun openGeneralBatterySettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    // Buka Accessibility settings (untuk beberapa fitur)
    fun openAccessibilitySettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }
}
```

### Integrasi Fallback dengan Action Executor

```kotlin
// ActionExecutor.kt
class ActionExecutor(
    private val commandExecutor: CommandExecutor,
    private val fallbackManager: FallbackManager,
    private val miuiBridge: MIUIBridge
) {
    
    suspend fun freezeApp(packageName: String): ActionResult {
        // Try auto mode first
        val result = commandExecutor.execute("pm disable-user --user 0 $packageName")
        
        return if (result.isSuccess) {
            ActionResult.Success(ActionMode.AUTO)
        } else {
            // Fallback to manual
            fallbackManager.openAppInfo(packageName)
            ActionResult.Fallback(
                message = "Silakan tap 'Disable' di halaman App Info",
                mode = ActionMode.MANUAL
            )
        }
    }
    
    suspend fun restrictBackground(packageName: String): ActionResult {
        val result = commandExecutor.execute(
            "appops set $packageName RUN_IN_BACKGROUND ignore"
        )
        
        return if (result.isSuccess) {
            ActionResult.Success(ActionMode.AUTO)
        } else {
            // Check if MIUI
            if (miuiBridge.isXiaomiDevice()) {
                miuiBridge.openBatterySaverSettings()
                ActionResult.Fallback(
                    message = "Silakan atur battery saver untuk app ini di MIUI Settings",
                    mode = ActionMode.MANUAL
                )
            } else {
                fallbackManager.openBatterySettings(packageName)
                ActionResult.Fallback(
                    message = "Silakan atur battery optimization di Settings",
                    mode = ActionMode.MANUAL
                )
            }
        }
    }
}

sealed class ActionResult {
    data class Success(val mode: ActionMode) : ActionResult()
    data class Fallback(val message: String, val mode: ActionMode) : ActionResult()
    data class Error(val error: String) : ActionResult()
}

enum class ActionMode {
    AUTO,   // Command berhasil dieksekusi
    MANUAL  // User perlu action manual
}
```

---

## Referensi & Resources

### Libraries
| Library | Kegunaan | Link |
|---------|----------|------|
| libsu | Root shell execution | [GitHub](https://github.com/topjohnwu/libsu) |
| Shizuku-API | Elevated API tanpa root | [GitHub](https://github.com/RikkaApps/Shizuku-API) |
| Gson | JSON serialization | [GitHub](https://github.com/google/gson) |

### Proyek Serupa (Referensi)
| Proyek | Deskripsi | Link |
|--------|-----------|------|
| Greenify | Hibernate apps | [Play Store](https://play.google.com/store/apps/details?id=com.oasisfeng.greenify) |
| Servicely | Control background services | [GitHub](https://github.com/nickcao/awesome-shizuku) |
| AppOpsX | AppOps manager | [GitHub](https://github.com/nickcao/awesome-shizuku) |
| Hail | Freeze apps | [GitHub](https://github.com/nickcao/awesome-shizuku) |

### Dokumentasi Android
- [AppOpsManager](https://developer.android.com/reference/android/app/AppOpsManager)
- [PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager)
- [Background Execution Limits](https://developer.android.com/about/versions/oreo/background)

### Komunitas
- [XDA Developers](https://forum.xda-developers.com/)
- [Awesome Shizuku](https://github.com/nickcao/awesome-shizuku)
- [Don't Kill My App](https://dontkillmyapp.com/) - Database vendor-specific battery restrictions
