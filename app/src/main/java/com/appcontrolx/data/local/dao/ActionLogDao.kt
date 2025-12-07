package com.appcontrolx.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.appcontrolx.data.local.entity.ActionLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ActionLogDao {
    
    @Query("SELECT * FROM action_logs ORDER BY timestamp DESC")
    fun getAllLogs(): Flow<List<ActionLogEntity>>
    
    @Query("SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentLogs(limit: Int): Flow<List<ActionLogEntity>>
    
    @Query("SELECT COUNT(*) FROM action_logs")
    suspend fun getLogCount(): Int
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: ActionLogEntity)
    
    @Query("DELETE FROM action_logs")
    suspend fun clearAllLogs()
    
    @Query("DELETE FROM action_logs WHERE id = :id")
    suspend fun deleteLog(id: Long)
}
