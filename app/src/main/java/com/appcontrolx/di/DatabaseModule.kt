package com.appcontrolx.di

import android.content.Context
import androidx.room.Room
import com.appcontrolx.data.local.AppDatabase
import com.appcontrolx.data.local.SettingsDataStore
import com.appcontrolx.data.local.dao.ActionLogDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context
    ): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "appcontrolx_db"
        ).fallbackToDestructiveMigration()
         .build()
    }
    
    @Provides
    @Singleton
    fun provideActionLogDao(database: AppDatabase): ActionLogDao {
        return database.actionLogDao()
    }
    
    @Provides
    @Singleton
    fun provideSettingsDataStore(
        @ApplicationContext context: Context
    ): SettingsDataStore {
        return SettingsDataStore(context)
    }
}
