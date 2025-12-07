package com.appcontrolx.service

import com.appcontrolx.model.ExecutionMode
import com.topjohnwu.superuser.Shell
import rikka.shizuku.Shizuku

class PermissionBridge {
    
    fun detectMode(): ExecutionMode {
        // 1. Check root first (highest priority)
        if (Shell.isAppGrantedRoot() == true) {
            return ExecutionMode.Root
        }
        
        // 2. Check Shizuku
        try {
            if (Shizuku.pingBinder() && 
                Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                return ExecutionMode.Shizuku
            }
        } catch (e: Exception) {
            // Shizuku not available
        }
        
        // 3. Fallback
        return ExecutionMode.None
    }
    
    fun isRootAvailable(): Boolean {
        return Shell.isAppGrantedRoot() == true
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
}
