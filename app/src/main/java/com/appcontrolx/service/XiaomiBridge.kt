package com.appcontrolx.service

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import com.appcontrolx.executor.CommandExecutor

class XiaomiBridge(
    private val context: Context,
    private val executor: CommandExecutor?
) {
    
    sealed class XiaomiUI {
        object None : XiaomiUI()
        data class MIUI(val version: Int) : XiaomiUI()
        data class HyperOS(val version: Float) : XiaomiUI()
    }
    
    fun isXiaomiDevice(): Boolean {
        return Build.MANUFACTURER.equals("Xiaomi", ignoreCase = true) ||
               Build.BRAND.equals("Redmi", ignoreCase = true) ||
               Build.BRAND.equals("POCO", ignoreCase = true)
    }
    
    fun getXiaomiUI(): XiaomiUI {
        if (!isXiaomiDevice()) return XiaomiUI.None
        
        // Check HyperOS first
        val hyperOsVersion = getSystemProperty("ro.mi.os.version.name")
        if (hyperOsVersion.isNotBlank()) {
            val version = hyperOsVersion.replace("OS", "").toFloatOrNull() ?: 0f
            return XiaomiUI.HyperOS(version)
        }
        
        // Check MIUI
        val miuiVersion = getSystemProperty("ro.miui.ui.version.name")
        if (miuiVersion.isNotBlank()) {
            val version = miuiVersion.replace("V", "").toIntOrNull() ?: 0
            return XiaomiUI.MIUI(version)
        }
        
        return XiaomiUI.None
    }
    
    private fun getSystemProperty(key: String): String {
        return try {
            executor?.execute("getprop $key")?.getOrNull()?.trim() ?: ""
        } catch (e: Exception) {
            ""
        }
    }
    
    fun openAutoStartSettings(): Boolean {
        val intents = listOf(
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            },
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.permissions.AppPermissionsEditorActivity"
                )
            }
        )
        return tryStartActivities(intents)
    }
    
    fun openBatterySaverSettings(): Boolean {
        val intents = when (getXiaomiUI()) {
            is XiaomiUI.HyperOS -> listOf(
                Intent().apply {
                    component = ComponentName(
                        "com.miui.powerkeeper",
                        "com.miui.powerkeeper.ui.HiddenAppsContainerManagementActivity"
                    )
                }
            )
            is XiaomiUI.MIUI -> listOf(
                Intent().apply {
                    component = ComponentName(
                        "com.miui.powerkeeper",
                        "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"
                    )
                }
            )
            else -> emptyList()
        }
        return tryStartActivities(intents)
    }
    
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
}
