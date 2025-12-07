package com.appcontrolx.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.appcontrolx.data.repository.AppRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first
import timber.log.Timber

@HiltWorker
class AppSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val repository: AppRepository
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            Timber.d("Starting app sync worker")
            
            // Pre-fetch apps to cache
            repository.getUserApps().first()
            repository.getSystemApps().first()
            
            Timber.d("App sync completed successfully")
            Result.success()
        } catch (e: Exception) {
            Timber.e(e, "App sync failed")
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
    
    companion object {
        const val WORK_NAME = "app_sync_worker"
    }
}
