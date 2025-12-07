package com.appcontrolx.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "action_logs")
data class ActionLogEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val action: String,
    val packages: String, // JSON array of package names
    val timestamp: Long,
    val success: Boolean,
    val message: String? = null
)
