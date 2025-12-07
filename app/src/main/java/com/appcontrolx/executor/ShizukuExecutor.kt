package com.appcontrolx.executor

import android.content.ComponentName
import android.content.ServiceConnection
import android.os.IBinder
import com.appcontrolx.BuildConfig
import com.appcontrolx.IShellService
import rikka.shizuku.Shizuku
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class ShizukuExecutor : CommandExecutor {
    
    private var shellService: IShellService? = null
    private val serviceLatch = CountDownLatch(1)
    
    private val userServiceArgs = Shizuku.UserServiceArgs(
        ComponentName(BuildConfig.APPLICATION_ID, ShellService::class.java.name)
    )
        .daemon(false)
        .processNameSuffix("shell")
        .debuggable(BuildConfig.DEBUG)
        .version(BuildConfig.VERSION_CODE)
    
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            shellService = IShellService.Stub.asInterface(service)
            serviceLatch.countDown()
        }
        
        override fun onServiceDisconnected(name: ComponentName?) {
            shellService = null
        }
    }
    
    init {
        bindService()
    }
    
    private fun bindService() {
        if (!Shizuku.pingBinder()) return
        try {
            Shizuku.bindUserService(userServiceArgs, serviceConnection)
        } catch (e: Exception) {
            // Shizuku not ready
        }
    }
    
    fun unbindService() {
        try {
            Shizuku.unbindUserService(userServiceArgs, serviceConnection, true)
        } catch (e: Exception) {
            // Ignore
        }
        shellService = null
    }
    
    override fun execute(command: String): Result<String> {
        // Wait for service to connect (max 3 seconds)
        if (shellService == null) {
            serviceLatch.await(3, TimeUnit.SECONDS)
        }
        
        val service = shellService
            ?: return Result.failure(Exception("Shizuku service not available"))
        
        return try {
            val output = service.exec(command)
            if (output.startsWith("ERROR:")) {
                Result.failure(Exception(output.removePrefix("ERROR:")))
            } else {
                Result.success(output)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun executeBatch(commands: List<String>): Result<Unit> {
        for (cmd in commands) {
            execute(cmd) // Best effort, continue on failure
        }
        return Result.success(Unit)
    }
    
    companion object {
        fun isAvailable(): Boolean {
            return try {
                Shizuku.pingBinder()
            } catch (e: Exception) {
                false
            }
        }
    }
}
