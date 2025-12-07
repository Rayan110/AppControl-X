package com.appcontrolx.utils

object SafetyValidator {
    
    // Apps yang TIDAK BOLEH disentuh sama sekali
    private val CRITICAL_PACKAGES = setOf(
        // Self-protection
        "com.appcontrolx",
        // Android Core System
        "android",
        "com.android.systemui",
        "com.android.settings",
        "com.android.phone",
        "com.android.server.telecom",
        "com.android.providers.settings",
        "com.android.providers.contacts",
        "com.android.providers.telephony",
        "com.android.providers.media",
        "com.android.providers.downloads",
        "com.android.inputmethod.latin",
        "com.android.launcher3",
        "com.android.packageinstaller",
        "com.android.permissioncontroller",
        "com.android.shell",
        "com.android.se",
        "com.android.nfc",
        "com.android.bluetooth",
        "com.android.wifi",
        // Google Core
        "com.google.android.gms",
        "com.google.android.gsf",
        "com.android.vending",
        "com.google.android.packageinstaller",
        // Root/Shizuku
        "com.topjohnwu.magisk",
        "rikka.shizuku",
        "moe.shizuku.privileged.api"
    )
    
    // Apps yang HANYA BOLEH di-force stop (tidak boleh freeze/uninstall/disable)
    private val FORCE_STOP_ONLY_PACKAGES = setOf(
        // Xiaomi Security Apps
        "com.miui.securitycenter",
        "com.miui.securityadd",
        "com.miui.guardprovider",
        "com.miui.antispam",
        "com.xiaomi.finddevice",
        // Xiaomi System Apps
        "com.miui.powerkeeper",
        "com.miui.analytics",
        "com.miui.daemon",
        "com.miui.core",
        // Other OEM Security
        "com.samsung.android.lool",
        "com.samsung.android.sm",
        "com.coloros.safecenter",
        "com.oppo.safe"
    )
    
    // Apps yang perlu warning sebelum action
    private val WARNING_PACKAGES = setOf(
        "com.google.android.apps.messaging",
        "com.google.android.dialer",
        "com.google.android.contacts",
        "com.miui.home",
        "com.miui.miwallpaper"
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
    
    fun isCritical(packageName: String): Boolean = packageName in CRITICAL_PACKAGES
    
    fun isWarning(packageName: String): Boolean = packageName in WARNING_PACKAGES
    
    /**
     * Check if package can only be force-stopped (no freeze/uninstall/disable)
     * This is for security apps that shouldn't be disabled but can be temporarily stopped
     */
    fun isForceStopOnly(packageName: String): Boolean = packageName in FORCE_STOP_ONLY_PACKAGES
    
    /**
     * Get allowed actions for a package
     */
    fun getAllowedActions(packageName: String): Set<AllowedAction> {
        return when {
            isCritical(packageName) -> emptySet()
            isForceStopOnly(packageName) -> setOf(AllowedAction.FORCE_STOP)
            else -> AllowedAction.values().toSet()
        }
    }
    
    enum class AllowedAction {
        FORCE_STOP,
        FREEZE,
        UNFREEZE,
        UNINSTALL,
        RESTRICT_BACKGROUND,
        ALLOW_BACKGROUND
    }
}

data class ValidationResult(
    val blocked: List<String>,
    val warnings: List<String>,
    val safe: List<String>,
    val canProceed: Boolean
)
