package com.appcontrolx.service

import android.content.Context
import androidx.preference.PreferenceManager
import com.appcontrolx.model.ExecutionMode
import com.appcontrolx.utils.Constants
import com.topjohnwu.superuser.Shell
import rikka.shizuku.Shizuku

class PermissionBridge(private val context: Context? = null) {
    
    private val prefs by lazy { 
        context?.let { PreferenceManager.getDefaultSharedPreferences(it) }
    }
    
    fun detectMode(): ExecutionMode {
        // First check saved preference
        val savedMode = prefs?.getString(Constants.PREFS_EXECUTION_MODE, null)
        
        // Validate saved mode is still available
        return when (savedMode) {
            Constants.MODE_ROOT -> {
                if (isRootAvailable()) ExecutionMode.Root
                else detectAvailableMode()
            }
            Constants.MODE_SHIZUKU -> {
                if (isShizukuReady()) ExecutionMode.Shizuku
                else detectAvailableMode()
            }
            Constants.MODE_NONE -> ExecutionMode.None
            else -> detectAvailableMode()
        }
    }
    
    private fun detectAvailableMode(): ExecutionMode {
        // 1. Check root first (highest priority)
        if (isRootAvailable()) {
            saveMode(Constants.MODE_ROOT)
            return ExecutionMode.Root
        }
        
        // 2. Check Shizuku
        if (isShizukuReady()) {
            saveMode(Constants.MODE_SHIZUKU)
            return ExecutionMode.Shizuku
        }
        
        // 3. Fallback
        return ExecutionMode.None
    }
    
    private fun saveMode(mode: String) {
        prefs?.edit()?.putString(Constants.PREFS_EXECUTION_MODE, mode)?.apply()
    }
    
    fun isRootAvailable(): Boolean {
        return try {
            Shell.isAppGrantedRoot() == true
        } catch (e: Exception) {
            false
        }
    }
    
    fun isShizukuAvailable(): Boolean {
        return try {
            Shizuku.pingBinder()
        } catch (e: Exception) {
            false
        }
    }
    
    fun isShizukuPermissionGranted(): Boolean {
        return try {
            Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }
    
    fun isShizukuReady(): Boolean {
        return isShizukuAvailable() && isShizukuPermissionGranted()
    }
    
    fun requestShizukuPermission() {
        try {
            if (isShizukuAvailable() && !isShizukuPermissionGranted()) {
                Shizuku.requestPermission(0)
            }
        } catch (e: Exception) {
            // Ignore
        }
    }
}
