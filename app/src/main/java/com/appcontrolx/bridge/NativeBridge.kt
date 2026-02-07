package com.appcontrolx.bridge

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.appcontrolx.core.ShellManager
import com.appcontrolx.domain.AppManager
import com.appcontrolx.domain.AppScanner
import com.appcontrolx.domain.SafetyValidator
import com.appcontrolx.domain.SystemMonitor
import com.appcontrolx.model.AppAction
import com.appcontrolx.model.AppActivityFilter
import com.appcontrolx.model.BatchComplete
import com.appcontrolx.model.BatchProgress
import com.appcontrolx.model.RealtimeStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NativeBridge @Inject constructor(
    private val context: Context,
    private val appScanner: AppScanner,
    private val appManager: AppManager,
    private val systemMonitor: SystemMonitor,
    private val shellManager: ShellManager,
    private val safetyValidator: SafetyValidator
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val mainHandler = Handler(Looper.getMainLooper())
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var monitorJob: Job? = null
    private var realtimeMonitorJob: Job? = null
    private var webView: WebView? = null

    fun setWebView(webView: WebView) {
        this.webView = webView
    }

    @JavascriptInterface
    fun getExecutionMode(): String {
        val mode = shellManager.initialize()
        return mode.name
    }

    @JavascriptInterface
    fun setExecutionMode(modeName: String): Boolean {
        return try {
            shellManager.setMode(modeName)
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun checkShizukuAccess(): String {
        val available = shellManager.isShizukuAvailable()
        val granted = shellManager.isShizukuGranted()
        return json.encodeToString(mapOf("available" to available, "granted" to granted))
    }

    @JavascriptInterface
    fun getAppList(filterJson: String): String {
        return runBlocking {
            // TODO: Implement AppFilter parsing and filtering in AppScanner
            // For now, just return all apps
            val apps = appScanner.scanAllApps(includeIcons = false)
            json.encodeToString(apps)
        }
    }

    @JavascriptInterface
    fun getAppIcon(packageName: String): String {
        return runBlocking {
            val icon = appScanner.getAppIcon(packageName)
            json.encodeToString(mapOf("packageName" to packageName, "iconBase64" to icon))
        }
    }

    @JavascriptInterface
    fun getAppDetail(packageName: String): String {
        return runBlocking {
            val apps = appScanner.scanAllApps()
            val app = apps.find { it.packageName == packageName }
            app?.let { json.encodeToString(it) } ?: "{}"
        }
    }

    @JavascriptInterface
    fun executeAction(packageName: String, actionName: String): String {
        return runBlocking {
            val action = try {
                AppAction.valueOf(actionName)
            } catch (e: Exception) {
                return@runBlocking json.encodeToString(
                    mapOf("success" to false, "message" to "Invalid action")
                )
            }

            val result = appManager.executeAction(packageName, action)
            if (result.success) {
                appScanner.invalidateCache()
            }
            json.encodeToString(result)
        }
    }

    @JavascriptInterface
    fun executeBatchAction(packagesJson: String, actionName: String, callbackId: String) {
        scope.launch {
            val packages = try {
                json.decodeFromString<List<String>>(packagesJson)
            } catch (e: Exception) {
                sendCallback(callbackId, json.encodeToString(BatchComplete(total = 0, successCount = 0, failureCount = 0)))
                return@launch
            }

            val action = try {
                AppAction.valueOf(actionName)
            } catch (e: Exception) {
                sendCallback(callbackId, json.encodeToString(BatchComplete(total = 0, successCount = 0, failureCount = 0)))
                return@launch
            }

            var successCount = 0
            var failureCount = 0

            appManager.executeBatchAction(packages, action) { current, total, packageName ->
                val progress = BatchProgress(current = current, total = total, packageName = packageName)
                sendCallback(callbackId, json.encodeToString(progress))
            }.forEach { result ->
                if (result.success) successCount++ else failureCount++
            }

            appScanner.invalidateCache()

            val complete = BatchComplete(
                total = packages.size,
                successCount = successCount,
                failureCount = failureCount
            )
            sendCallback(callbackId, json.encodeToString(complete))
        }
    }

    @JavascriptInterface
    fun getSystemStats(): String {
        val stats = systemMonitor.getSystemStats()
        return json.encodeToString(stats)
    }

    @JavascriptInterface
    fun getDeviceInfo(): String {
        val info = systemMonitor.getDeviceInfo()
        return json.encodeToString(info)
    }

    @JavascriptInterface
    fun startSystemMonitor(intervalMs: Int) {
        monitorJob?.cancel()
        monitorJob = scope.launch {
            while (isActive) {
                val stats = systemMonitor.getSystemStats()
                val statsJson = json.encodeToString(stats)
                mainHandler.post {
                    webView?.evaluateJavascript("window.onSystemStatsUpdate('$statsJson')", null)
                }
                delay(intervalMs.toLong())
            }
        }
    }

    @JavascriptInterface
    fun stopSystemMonitor() {
        monitorJob?.cancel()
        monitorJob = null
    }

    @JavascriptInterface
    fun startRealtimeMonitor(intervalMs: Int) {
        realtimeMonitorJob?.cancel()
        realtimeMonitorJob = scope.launch {
            while (isActive) {
                val status = systemMonitor.getRealtimeStatus()
                val statusJson = json.encodeToString(status)
                mainHandler.post {
                    webView?.evaluateJavascript("window.onRealtimeStatusUpdate('$statusJson')", null)
                }
                delay(intervalMs.toLong())
            }
        }
    }

    @JavascriptInterface
    fun stopRealtimeMonitor() {
        realtimeMonitorJob?.cancel()
        realtimeMonitorJob = null
    }

    @JavascriptInterface
    fun getActionHistory(): String {
        return "[]"
    }

    @JavascriptInterface
    fun getSafetyStatus(packageName: String): String {
        val level = safetyValidator.getSafetyLevel(packageName)
        return json.encodeToString(mapOf("level" to level.name))
    }

    @JavascriptInterface
    fun requestShizukuPermission() {
        // Shizuku permission request handled by native activity
    }

    @JavascriptInterface
    fun checkRootAccess(): Boolean {
        return shellManager.getMode().name == "ROOT"
    }

    @JavascriptInterface
    fun openHiddenSetting(intentsJson: String): Boolean {
        return try {
            val intents = json.decodeFromString<List<String>>(intentsJson)
            var success = false
            for (intentStr in intents) {
                try {
                    val parts = intentStr.split("/")
                    if (parts.size == 2) {
                        val intent = Intent().apply {
                            component = ComponentName(parts[0], parts[1])
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        context.startActivity(intent)
                        success = true
                        break
                    }
                } catch (e: Exception) {
                    continue
                }
            }
            success
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun getActivities(filterJson: String): String {
        return runBlocking {
            val filter = try {
                json.decodeFromString<AppActivityFilter>(filterJson)
            } catch (e: Exception) {
                AppActivityFilter()
            }

            val activities = appScanner.scanAppActivities(filter)
            json.encodeToString(activities)
        }
    }

    @JavascriptInterface
    fun launchActivity(packageName: String, activityName: String): Boolean {
        val mode = shellManager.getMode()

        return try {
            if (mode == com.appcontrolx.model.ExecutionMode.NONE) {
                // Standard Intent launch (only works if exported)
                launchViaIntent(packageName, activityName)
            } else {
                // Shell launch (can launch non-exported activities)
                val result = shellManager.execute("am start -n $packageName/$activityName")
                result.isSuccess
            }
        } catch (e: Exception) {
            false
        }
    }

    private fun launchViaIntent(packageName: String, activityName: String): Boolean {
        return try {
            val intent = Intent().apply {
                component = ComponentName(packageName, activityName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun launchApp(packageName: String): Boolean {
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun openAppSettings(packageName: String): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun clearCache(packageName: String): String {
        return runBlocking {
            val result = appManager.executeAction(packageName, AppAction.CLEAR_CACHE)
            if (result.success) {
                appScanner.invalidateCache()
            }
            json.encodeToString(result)
        }
    }

    @JavascriptInterface
    fun clearData(packageName: String): String {
        return runBlocking {
            val result = appManager.executeAction(packageName, AppAction.CLEAR_DATA)
            if (result.success) {
                appScanner.invalidateCache()
            }
            json.encodeToString(result)
        }
    }

    private fun sendCallback(callbackId: String, data: String) {
        val escapedData = data.replace("'", "\\'")
        mainHandler.post {
            webView?.evaluateJavascript("window.onNativeCallback('$callbackId', '$escapedData')", null)
        }
    }

    private fun <T> runBlocking(block: suspend () -> T): T {
        return kotlinx.coroutines.runBlocking { block() }
    }

    fun cleanup() {
        monitorJob?.cancel()
        realtimeMonitorJob?.cancel()
        scope.cancel()
        shellManager.cleanup()
    }
}
