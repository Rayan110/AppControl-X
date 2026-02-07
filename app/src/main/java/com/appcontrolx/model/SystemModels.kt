package com.appcontrolx.model

import kotlinx.serialization.Serializable

@Serializable
data class SystemStats(
    val cpu: CpuStats,
    val gpu: GpuStats,
    val ram: RamStats,
    val storage: StorageStats,
    val battery: BatteryStats,
    val network: NetworkStats,
    val display: DisplayStats
)

@Serializable
data class CpuStats(
    val usagePercent: Float,
    val temperature: Float?,
    val cores: Int,
    val coreFrequencies: List<Long>
)

@Serializable
data class GpuStats(
    val name: String,
    val temperature: Float?
)

@Serializable
data class RamStats(
    val totalBytes: Long,
    val usedBytes: Long,
    val availableBytes: Long,
    val usedPercent: Float,
    val zramTotal: Long,
    val zramUsed: Long
)

@Serializable
data class StorageStats(
    val totalBytes: Long,
    val usedBytes: Long,
    val availableBytes: Long,
    val usedPercent: Float,
    val appsBytes: Long,
    val systemBytes: Long,
    val filesystem: String
)

@Serializable
data class BatteryStats(
    val percent: Int,
    val temperature: Float,
    val isCharging: Boolean,
    val health: String,
    val technology: String,
    val voltage: Int,
    val capacity: Int,
    val remainingTime: String
)

@Serializable
data class NetworkStats(
    val wifi: WifiStats,
    val mobile: MobileStats,
    val sim: SimStats
)

@Serializable
data class WifiStats(
    val connected: Boolean,
    val ssid: String,
    val ip: String,
    val speed: Int,
    val signal: Int,
    val signalDbm: Int
)

@Serializable
data class MobileStats(
    val connected: Boolean,
    val type: String
)

@Serializable
data class SimStats(
    val present: Boolean
)

@Serializable
data class DisplayStats(
    val gpu: String,
    val resolution: String,
    val density: Int,
    val screenSize: String,
    val frameRate: Int
)

@Serializable
data class DeviceInfo(
    val model: String,
    val brand: String,
    val processor: String,
    val androidVersion: String,
    val uptime: String,
    val deepSleep: String,
    val deepSleepPercent: Int
)

@Serializable
data class RealtimeStatus(
    val cpuFrequencies: List<Long>,
    val cpuTemp: Float?,
    val gpuTemp: Float?
)
