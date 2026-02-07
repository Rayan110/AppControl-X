package com.appcontrolx.model

import kotlinx.serialization.Serializable

@Serializable
enum class ExecutionMode {
    ROOT,
    SHIZUKU,
    NONE;

    val displayName: String
        get() = when (this) {
            ROOT -> "Root"
            SHIZUKU -> "Shizuku"
            NONE -> "View Only"
        }

    val canExecuteActions: Boolean
        get() = this != NONE
}

@Serializable
enum class SafetyLevel {
    CRITICAL,
    FORCE_STOP_ONLY,
    WARNING,
    SAFE
}

@Serializable
enum class AppAction {
    FREEZE,
    UNFREEZE,
    FORCE_STOP,
    UNINSTALL,
    CLEAR_CACHE,
    CLEAR_DATA,
    RESTRICT_BACKGROUND,
    ALLOW_BACKGROUND
}

@Serializable
data class AppActivities(
    val packageName: String,
    val appName: String,
    val isSystem: Boolean,
    val activities: List<String>
)

@Serializable
data class AppInfo(
    val packageName: String,
    val appName: String,
    val iconBase64: String?,
    val versionName: String,
    val isSystemApp: Boolean,
    val isEnabled: Boolean,
    val isRunning: Boolean,
    val isFrozen: Boolean,
    val isBackgroundRestricted: Boolean,
    val size: Long,
    val uid: Int,
    val safetyLevel: SafetyLevel
)

@Serializable
data class ActionResult(
    val success: Boolean,
    val message: String,
    val packageName: String,
    val action: AppAction
)

@Serializable
data class BatchProgress(
    val type: String = "progress",
    val current: Int,
    val total: Int,
    val packageName: String
)

@Serializable
data class BatchComplete(
    val type: String = "complete",
    val total: Int,
    val successCount: Int,
    val failureCount: Int
)
