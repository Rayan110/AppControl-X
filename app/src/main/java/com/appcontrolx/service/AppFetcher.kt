package com.appcontrolx.service

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.appcontrolx.model.AppInfo

class AppFetcher(private val context: Context) {
    
    fun getAllApps(): List<AppInfo> {
        val pm = context.packageManager
        val packages = pm.getInstalledPackages(PackageManager.GET_META_DATA)
        
        return packages.mapNotNull { pkg ->
            try {
                AppInfo(
                    packageName = pkg.packageName,
                    appName = pkg.applicationInfo.loadLabel(pm).toString(),
                    icon = pkg.applicationInfo.loadIcon(pm),
                    isSystemApp = (pkg.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
                    isEnabled = pkg.applicationInfo.enabled
                )
            } catch (e: Exception) {
                null
            }
        }.sortedBy { it.appName.lowercase() }
    }
    
    fun getUserApps(): List<AppInfo> = getAllApps().filter { !it.isSystemApp }
    
    fun getSystemApps(): List<AppInfo> = getAllApps().filter { it.isSystemApp }
}
