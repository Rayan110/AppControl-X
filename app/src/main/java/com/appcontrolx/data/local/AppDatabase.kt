package com.appcontrolx.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.appcontrolx.data.local.dao.ActionLogDao
import com.appcontrolx.data.local.entity.ActionLogEntity

@Database(
    entities = [ActionLogEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun actionLogDao(): ActionLogDao
}
