package com.appcontrolx.utils

object SafetyValidator {
    
    private val CRITICAL_PACKAGES = setOf(
        "com.android.systemui",
        "com.android.settings",
        "com.android.phone",
        "com.android.server.telecom",
        "com.android.providers.settings",
        "com.android.providers.contacts",
        "com.android.inputmethod.latin",
        "com.android.launcher3",
        "com.google.android.gms",
        "com.google.android.gsf",
        "com.android.vending",
        "android"
    )
    
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
    
    fun isCritical(packageName: String): Boolean = packageName in CRITICAL_PACKAGES
    
    fun isWarning(packageName: String): Boolean = packageName in WARNING_PACKAGES
}

data class ValidationResult(
    val blocked: List<String>,
    val warnings: List<String>,
    val safe: List<String>,
    val canProceed: Boolean
)
