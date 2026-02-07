package com.appcontrolx.domain

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import com.appcontrolx.core.ShellManager
import com.appcontrolx.model.AppInfo
import com.appcontrolx.model.ExecutionMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppScanner @Inject constructor(
    private val context: Context,
    private val shellManager: ShellManager
) {
    private val packageManager: PackageManager = context.packageManager
    private val safetyValidator = SafetyValidator()

    private var cachedApps: List<AppInfo>? = null
    private var cacheTimestamp: Long = 0
    private val cacheValidityMs = 30_000L

    suspend fun scanAllApps(forceRefresh: Boolean = false): List<AppInfo> = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        if (!forceRefresh && cachedApps != null && (now - cacheTimestamp) < cacheValidityMs) {
            return@withContext cachedApps!!
        }

        val runningPackages = getRunningPackages()
        val packages = packageManager.getInstalledPackages(PackageManager.GET_META_DATA)

        val apps = packages.mapNotNull { pkg ->
            try {
                val appInfo = pkg.applicationInfo ?: return@mapNotNull null
                val isSystemApp = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val isEnabled = appInfo.enabled
                val isFrozen = !isEnabled
                val isRunning = pkg.packageName in runningPackages

                AppInfo(
                    packageName = pkg.packageName,
                    appName = appInfo.loadLabel(packageManager).toString(),
                    iconBase64 = getIconBase64(appInfo),
                    versionName = pkg.versionName ?: "",
                    isSystemApp = isSystemApp,
                    isEnabled = isEnabled,
                    isRunning = isRunning,
                    isFrozen = isFrozen,
                    isBackgroundRestricted = false,
                    size = getAppSize(appInfo),
                    uid = appInfo.uid,
                    safetyLevel = safetyValidator.getSafetyLevel(pkg.packageName)
                )
            } catch (e: Exception) {
                null
            }
        }.sortedBy { it.appName.lowercase() }

        cachedApps = apps
        cacheTimestamp = now
        apps
    }

    fun invalidateCache() {
        cachedApps = null
        cacheTimestamp = 0
    }

    private suspend fun getRunningPackages(): Set<String> {
        val running = mutableSetOf<String>()

        if (shellManager.getMode() != ExecutionMode.NONE) {
            try {
                val result = shellManager.execute("dumpsys activity processes")
                result.onSuccess { output ->
                    val appPattern = Regex("""ProcessRecord\{[^}]+\s+\d+:([a-zA-Z][a-zA-Z0-9_.]*)/""")
                    appPattern.findAll(output).forEach { match ->
                        match.groupValues.getOrNull(1)?.let { running.add(it) }
                    }
                }
            } catch (_: Exception) {}
        }

        return running
    }

    private fun getAppSize(appInfo: ApplicationInfo): Long {
        return try {
            appInfo.sourceDir?.let { java.io.File(it).length() } ?: 0L
        } catch (e: Exception) {
            0L
        }
    }

    private fun getIconBase64(appInfo: ApplicationInfo): String? {
        return try {
            val drawable = appInfo.loadIcon(packageManager)
            val bitmap = drawableToBitmap(drawable)
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 80, stream)
            Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
        } catch (e: Exception) {
            null
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable && drawable.bitmap != null) {
            return drawable.bitmap
        }

        val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 48
        val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 48

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}
