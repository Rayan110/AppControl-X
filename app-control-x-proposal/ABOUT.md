# About AppControlX

## App Info

| | |
|---|---|
| **App Name** | AppControlX |
| **Package** | com.appcontrolx |
| **Version** | 1.0.0 |
| **Min SDK** | Android 10 (API 29) |
| **Target SDK** | Android 14 (API 34) |
| **License** | GPL-3.0 |

## Deskripsi

**AppControlX** adalah aplikasi Android untuk mengontrol perilaku aplikasi lain terhadap baterai dan sistem. Dengan dukungan Root atau Shizuku, AppControlX dapat:

- **Freeze/Unfreeze** aplikasi tanpa uninstall
- **Uninstall** aplikasi untuk current user
- **Kontrol battery optimization** secara programmatic
- **MIUI/HyperOS support** untuk device Xiaomi/Redmi/POCO
- **Rollback** ke state sebelumnya jika ada masalah

## Kenapa AppControlX?

| Fitur | App Lain | AppControlX |
|-------|----------|-------------|
| Batch operation | ❌ Satu-satu | ✅ Multiple apps sekaligus |
| User interaction | ❌ Perlu konfirmasi | ✅ Auto (dengan fallback manual) |
| MIUI support | ⚠️ Partial | ✅ Full (MIUI 12-14) |
| HyperOS support | ❌ Tidak ada | ✅ Full (HyperOS 1-2) |
| Rollback | ❌ Tidak ada | ✅ Auto snapshot & restore |
| Open source | ⚠️ Varies | ✅ GPL-3.0 |

## Supported Platforms

| Platform | Version | Support Level |
|----------|---------|---------------|
| Android Stock | 10 - 15 | ✅ Full |
| MIUI | 12 - 14 | ✅ Full |
| HyperOS | 1.0 - 2.0 | ✅ Full |
| Custom ROM | Android 10+ | ✅ Full |
| Samsung OneUI | 3.0+ | ⚠️ Basic (no vendor-specific) |
| ColorOS/OxygenOS | 11+ | ⚠️ Basic (no vendor-specific) |

## Mode Operasi

### Root Mode
- Akses penuh ke semua fitur
- Eksekusi command langsung via `su`
- Tidak perlu setup tambahan (selain root)

### Shizuku Mode
- Fitur sama dengan Root
- Tidak perlu root device
- Perlu install [Shizuku](https://shizuku.rikka.app/) dan aktifkan via ADB/Wireless ADB

### View-Only Mode
- Hanya bisa melihat daftar aplikasi
- Tidak bisa eksekusi aksi
- Fallback jika tidak ada Root/Shizuku

## Requirements

### Untuk Full Features (Root)
- Device dengan Root access (Magisk recommended)
- Android 10 atau lebih baru

### Untuk Full Features (Shizuku)
- [Shizuku](https://play.google.com/store/apps/details?id=moe.shizuku.privileged.api) terinstall
- Shizuku diaktifkan via ADB atau Wireless ADB
- Android 10 atau lebih baru

### Untuk View-Only
- Android 10 atau lebih baru
- Tidak perlu Root atau Shizuku

## Permissions

| Permission | Kegunaan | Mandatory |
|------------|----------|-----------|
| `QUERY_ALL_PACKAGES` | Melihat semua aplikasi terinstall | ✅ Yes |
| `POST_NOTIFICATIONS` | Notifikasi progress dan hasil | ✅ Yes (Android 13+) |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Agar app tidak di-kill | ⚠️ Optional |
| `moe.shizuku.manager.permission.API_V23` | Integrasi Shizuku | ⚠️ If using Shizuku |

## First-Time Setup

Saat pertama kali membuka AppControlX, kamu akan melewati setup wizard:

1. **Mode Selection** — Pilih Root, Shizuku, atau View-Only
2. **Permissions** — Grant notification dan battery exemption
3. **Xiaomi Setup** — Konfigurasi autostart dan battery saver (khusus MIUI/HyperOS)
4. **Complete** — Mulai menggunakan AppControlX

## Credits & Acknowledgments

### Libraries
- [libsu](https://github.com/topjohnwu/libsu) by topjohnwu — Root shell execution
- [Shizuku-API](https://github.com/RikkaApps/Shizuku-API) by RikkaApps — Elevated API access
- [Gson](https://github.com/google/gson) by Google — JSON serialization

### Inspirasi
- [Greenify](https://play.google.com/store/apps/details?id=com.oasisfeng.greenify) — Hibernate apps
- [Hail](https://github.com/aistra0528/Hail) — Freeze apps
- [AppOpsX](https://github.com/nickcao/awesome-shizuku) — AppOps management

### Resources
- [Don't Kill My App](https://dontkillmyapp.com/) — Vendor battery restriction database
- [Awesome Shizuku](https://github.com/nickcao/awesome-shizuku) — Shizuku apps collection

## Developer

| | |
|---|---|
| **Developer** | [Your Name] |
| **GitHub** | [github.com/username/AppControlX](https://github.com) |
| **Email** | contact@example.com |

## Changelog

### v1.0.0 (Initial Release)
- First-time setup wizard (onboarding)
- App list dengan filter User/System apps
- Freeze/Unfreeze apps
- Uninstall apps (current user)
- Battery optimization control
- Xiaomi support (MIUI 12-14, HyperOS 1-2)
- Rollback system
- Fallback manual mode

## License

```
AppControlX - Android App Control Tool
Copyright (C) 2024

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```

---

## UI Preview (About Screen)

```
┌─────────────────────────────────────────┐
│              AppControlX                │
│                 v1.0.0                  │
│                                         │
│     [App Icon]                          │
│                                         │
│  Control your apps, save your battery   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [ic_list] Features                     │
│  * Freeze/Unfreeze apps                 │
│  * Battery optimization control         │
│  * MIUI support                         │
│  * Rollback system                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [ic_settings] Current Mode:            │
│  [Root/Shizuku/None]                    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [ic_code] Libraries                    │
│  * libsu by topjohnwu                   │
│  * Shizuku-API by RikkaApps             │
│  * Gson by Google                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [GitHub]  [Rate App]  [Share]          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Made by [Developer]                    │
│  Licensed under GPL-3.0                 │
│                                         │
└─────────────────────────────────────────┘
```

Note: Semua icon menggunakan Material Icons (vector drawable), bukan emoji.

## About Fragment Implementation

```kotlin
// AboutFragment.kt
class AboutFragment : Fragment() {
    
    private lateinit var binding: FragmentAboutBinding
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentAboutBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupAppInfo()
        setupCurrentMode()
        setupLinks()
    }
    
    private fun setupAppInfo() {
        val packageInfo = requireContext().packageManager
            .getPackageInfo(requireContext().packageName, 0)
        
        binding.apply {
            tvAppName.text = getString(R.string.app_name)
            tvVersion.text = "v${packageInfo.versionName}"
        }
    }
    
    private fun setupCurrentMode() {
        val permissionBridge = PermissionBridge()
        val mode = permissionBridge.detectMode()
        
        binding.tvCurrentMode.text = when (mode) {
            is ExecutionMode.Root -> "Root Mode"
            is ExecutionMode.Shizuku -> "Shizuku Mode"
            is ExecutionMode.None -> "View-Only Mode"
        }
    }
    
    private fun setupLinks() {
        binding.apply {
            btnGithub.setOnClickListener {
                openUrl("https://github.com/username/AppControlX")
            }
            
            btnRateApp.setOnClickListener {
                openPlayStore()
            }
            
            btnShare.setOnClickListener {
                shareApp()
            }
        }
    }
    
    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
    
    private fun openPlayStore() {
        try {
            startActivity(Intent(
                Intent.ACTION_VIEW,
                Uri.parse("market://details?id=${requireContext().packageName}")
            ))
        } catch (e: Exception) {
            openUrl("https://play.google.com/store/apps/details?id=${requireContext().packageName}")
        }
    }
    
    private fun shareApp() {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, getString(R.string.app_name))
            putExtra(Intent.EXTRA_TEXT, 
                "Check out AppControlX - Control your apps, save your battery!\n" +
                "https://play.google.com/store/apps/details?id=${requireContext().packageName}"
            )
        }
        startActivity(Intent.createChooser(intent, "Share via"))
    }
}
```
