package com.appcontrolx.domain

import com.appcontrolx.model.AppAction
import com.appcontrolx.model.SafetyLevel
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SafetyValidator @Inject constructor() {

    fun getSafetyLevel(packageName: String): SafetyLevel {
        return when {
            isCritical(packageName) -> SafetyLevel.CRITICAL
            isForceStopOnly(packageName) -> SafetyLevel.FORCE_STOP_ONLY
            isWarning(packageName) -> SafetyLevel.WARNING
            else -> SafetyLevel.SAFE
        }
    }

    fun getAllowedActions(packageName: String): Set<AppAction> {
        return when (getSafetyLevel(packageName)) {
            SafetyLevel.CRITICAL -> emptySet()
            SafetyLevel.FORCE_STOP_ONLY -> setOf(AppAction.FORCE_STOP)
            SafetyLevel.WARNING, SafetyLevel.SAFE -> AppAction.entries.toSet()
        }
    }

    fun validateAction(packageName: String, action: AppAction): Result<Unit> {
        val allowed = getAllowedActions(packageName)
        return if (action in allowed) {
            Result.success(Unit)
        } else {
            Result.failure(SecurityException("Action $action not allowed for $packageName"))
        }
    }

    fun validatePackageName(packageName: String): Result<Unit> {
        if (packageName.isBlank()) {
            return Result.failure(IllegalArgumentException("Package name is empty"))
        }
        if (packageName.length > 255) {
            return Result.failure(IllegalArgumentException("Package name too long"))
        }
        if (hasInjectionAttempt(packageName)) {
            return Result.failure(SecurityException("Injection attempt detected"))
        }
        if (!isValidFormat(packageName)) {
            return Result.failure(IllegalArgumentException("Invalid package name format"))
        }
        return Result.success(Unit)
    }

    private fun isCritical(packageName: String): Boolean = packageName in CRITICAL_PACKAGES

    private fun isForceStopOnly(packageName: String): Boolean = packageName in FORCE_STOP_ONLY_PACKAGES

    private fun isWarning(packageName: String): Boolean = packageName in WARNING_PACKAGES

    private fun hasInjectionAttempt(packageName: String): Boolean {
        return INJECTION_CHARS.any { it in packageName }
    }

    private fun isValidFormat(packageName: String): Boolean {
        return PACKAGE_PATTERN.matches(packageName)
    }

    companion object {
        private val PACKAGE_PATTERN = Regex("^[a-zA-Z][a-zA-Z0-9_]*(\\.[a-zA-Z][a-zA-Z0-9_]*)+$")
        private val INJECTION_CHARS = setOf(';', '&', '|', '`', '$', '\'', '"', '\n', '\r', '\\', '(', ')', '<', '>', '{', '}', '[', ']', ' ')

        private val CRITICAL_PACKAGES = setOf(
            "com.appcontrolx",
            "android",
            "com.android.systemui",
            "com.android.settings",
            "com.android.phone",
            "com.android.server.telecom",
            "com.android.providers.settings",
            "com.android.providers.contacts",
            "com.android.providers.telephony",
            "com.android.providers.media",
            "com.android.providers.media.module",
            "com.android.shell",
            "com.android.bluetooth",
            "com.android.wifi",
            "com.android.networkstack",
            "com.android.permissioncontroller",
            "com.android.packageinstaller",
            "com.android.launcher3",
            "com.android.webview",
            "com.google.android.gms",
            "com.google.android.gsf",
            "com.android.vending",
            "com.google.android.webview",
            "com.miui.system",
            "com.miui.securitycenter",
            "com.miui.home",
            "com.xiaomi.xmsf",
            "com.lbe.security.miui",
            "com.samsung.android.providers.context",
            "com.sec.android.app.launcher",
            "com.coloros.systemui",
            "com.oppo.launcher",
            "com.oneplus.launcher",
            "com.huawei.android.launcher",
            "com.topjohnwu.magisk",
            "rikka.shizuku",
            "moe.shizuku.privileged.api",
            "me.weishu.kernelsu"
        )

        private val FORCE_STOP_ONLY_PACKAGES = setOf(
            "com.miui.powerkeeper",
            "com.miui.securityadd",
            "com.samsung.android.lool",
            "com.samsung.android.sm",
            "com.coloros.safecenter",
            "com.huawei.systemmanager",
            "com.google.android.apps.adm"
        )

        private val WARNING_PACKAGES = setOf(
            "com.google.android.apps.messaging",
            "com.google.android.dialer",
            "com.google.android.contacts"
        )
    }
}
