package com.appcontrolx.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.appcontrolx.utils.Constants
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

@Singleton
class SettingsDataStore @Inject constructor(
    private val context: Context
) {
    private object Keys {
        val EXECUTION_MODE = stringPreferencesKey(Constants.PREFS_EXECUTION_MODE)
        val THEME = intPreferencesKey(Constants.PREFS_THEME)
        val CONFIRM_ACTIONS = booleanPreferencesKey(Constants.PREFS_CONFIRM_ACTIONS)
        val PROTECT_SYSTEM = booleanPreferencesKey(Constants.PREFS_PROTECT_SYSTEM)
        val AUTO_SNAPSHOT = booleanPreferencesKey(Constants.PREFS_AUTO_SNAPSHOT)
        val SETUP_COMPLETE = booleanPreferencesKey(Constants.PREFS_SETUP_COMPLETE)
        val LAST_VERSION = intPreferencesKey("last_shown_version")
    }
    
    val executionMode: Flow<String> = context.dataStore.data
        .map { it[Keys.EXECUTION_MODE] ?: Constants.MODE_NONE }
    
    val theme: Flow<Int> = context.dataStore.data
        .map { it[Keys.THEME] ?: -1 }
    
    val confirmActions: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.CONFIRM_ACTIONS] ?: true }
    
    val protectSystem: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.PROTECT_SYSTEM] ?: true }
    
    val autoSnapshot: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.AUTO_SNAPSHOT] ?: true }
    
    val setupComplete: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.SETUP_COMPLETE] ?: false }
    
    val lastVersion: Flow<Int> = context.dataStore.data
        .map { it[Keys.LAST_VERSION] ?: 0 }
    
    suspend fun setExecutionMode(mode: String) {
        context.dataStore.edit { it[Keys.EXECUTION_MODE] = mode }
    }
    
    suspend fun setTheme(theme: Int) {
        context.dataStore.edit { it[Keys.THEME] = theme }
    }
    
    suspend fun setConfirmActions(confirm: Boolean) {
        context.dataStore.edit { it[Keys.CONFIRM_ACTIONS] = confirm }
    }
    
    suspend fun setProtectSystem(protect: Boolean) {
        context.dataStore.edit { it[Keys.PROTECT_SYSTEM] = protect }
    }
    
    suspend fun setAutoSnapshot(auto: Boolean) {
        context.dataStore.edit { it[Keys.AUTO_SNAPSHOT] = auto }
    }
    
    suspend fun setSetupComplete(complete: Boolean) {
        context.dataStore.edit { it[Keys.SETUP_COMPLETE] = complete }
    }
    
    suspend fun setLastVersion(version: Int) {
        context.dataStore.edit { it[Keys.LAST_VERSION] = version }
    }
}
