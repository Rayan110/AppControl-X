package com.appcontrolx.rollback

import android.content.Context
import com.appcontrolx.executor.CommandExecutor
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File
import java.util.UUID

class RollbackManager(
    private val context: Context,
    private val executor: CommandExecutor
) {
    private val gson = Gson()
    private val snapshotFile = File(context.filesDir, "rollback_snapshot.json")
    private val historyFile = File(context.filesDir, "action_history.json")
    
    fun saveSnapshot(packages: List<String>): StateSnapshot {
        val states = packages.map { pkg ->
            val bgStatus = executor.execute("appops get $pkg RUN_IN_BACKGROUND")
            val wlStatus = executor.execute("appops get $pkg WAKE_LOCK")
            val enabledStatus = executor.execute("pm list packages -e | grep $pkg")
            
            AppState(
                packageName = pkg,
                runInBackground = parseAppOpsValue(bgStatus.getOrDefault("")),
                wakeLock = parseAppOpsValue(wlStatus.getOrDefault("")),
                isEnabled = enabledStatus.getOrDefault("").contains(pkg),
                timestamp = System.currentTimeMillis()
            )
        }
        
        val snapshot = StateSnapshot(
            id = UUID.randomUUID().toString(),
            states = states,
            createdAt = System.currentTimeMillis()
        )
        
        snapshotFile.writeText(gson.toJson(snapshot))
        return snapshot
    }
    
    fun getLastSnapshot(): StateSnapshot? {
        if (!snapshotFile.exists()) return null
        return try {
            gson.fromJson(snapshotFile.readText(), StateSnapshot::class.java)
        } catch (e: Exception) {
            null
        }
    }
    
    fun rollback(): Result<Unit> {
        val snapshot = getLastSnapshot() 
            ?: return Result.failure(Exception("No snapshot found"))
        
        val commands = snapshot.states.flatMap { state ->
            mutableListOf<String>().apply {
                add("appops set ${state.packageName} RUN_IN_BACKGROUND ${state.runInBackground}")
                add("appops set ${state.packageName} WAKE_LOCK ${state.wakeLock}")
                if (state.isEnabled) {
                    add("pm enable ${state.packageName}")
                }
            }
        }
        
        return executor.executeBatch(commands)
    }
    
    fun logAction(action: ActionLog) {
        val history = getActionHistory().toMutableList()
        history.add(0, action) // Add to beginning
        
        // Keep only last 100 actions
        val trimmed = history.take(100)
        historyFile.writeText(gson.toJson(trimmed))
    }
    
    fun getActionHistory(): List<ActionLog> {
        if (!historyFile.exists()) return emptyList()
        return try {
            val type = object : TypeToken<List<ActionLog>>() {}.type
            gson.fromJson(historyFile.readText(), type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    fun clearHistory() {
        historyFile.delete()
        snapshotFile.delete()
    }
    
    private fun parseAppOpsValue(output: String): String {
        return when {
            output.contains("ignore") -> "ignore"
            output.contains("deny") -> "deny"
            else -> "allow"
        }
    }
}

data class StateSnapshot(
    val id: String,
    val states: List<AppState>,
    val createdAt: Long
)

data class AppState(
    val packageName: String,
    val runInBackground: String,
    val wakeLock: String,
    val isEnabled: Boolean,
    val timestamp: Long
)

data class ActionLog(
    val id: String = UUID.randomUUID().toString(),
    val action: String,
    val packages: List<String>,
    val success: Boolean,
    val message: String?,
    val timestamp: Long = System.currentTimeMillis()
)
