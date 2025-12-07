package com.appcontrolx.executor

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.os.IBinder
import com.appcontrolx.IShellService
import rikka.shizuku.Shizuku

class ShizukuExecutor(private val context: Context) : CommandExecutor {
    
    private var shellService: IShellService? = null
    
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            shellService = IShellService.Stub.asInterface(service)
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            shellService = null
        }
    }
    
    fun bindService() {
        if (!Shizuku.pingBinder()) return
        
        // TODO: Implement UserService binding
        // This requires AIDL setup
    }
    
    fun unbindService() {
        shellService = null
    }
    
    override fun execute(command: String): Result<String> {
        val service = shellService 
            ?: return Result.failure(Exception("Shizuku service not bound"))
        
        return try {
            val output = service.exec(command)
            if (output.startsWith("ERROR:")) {
                Result.failure(Exception(output))
            } else {
                Result.success(output)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun executeBatch(commands: List<String>): Result<Unit> {
        commands.forEach { cmd ->
            val result = execute(cmd)
            if (result.isFailure) return Result.failure(result.exceptionOrNull()!!)
        }
        return Result.success(Unit)
    }
}
