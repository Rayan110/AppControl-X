package com.appcontrolx.core

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.os.IBinder
import com.appcontrolx.BuildConfig
import com.appcontrolx.IShellService
import com.appcontrolx.model.ExecutionMode
import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import rikka.shizuku.Shizuku
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ShellManager @Inject constructor(
    private val context: Context
) {
    private var currentMode: ExecutionMode = ExecutionMode.NONE
    private var shellService: IShellService? = null
    private var serviceLatch = CountDownLatch(1)
    private var isBound = false

    private val userServiceArgs by lazy {
        Shizuku.UserServiceArgs(
            ComponentName(BuildConfig.APPLICATION_ID, ShellService::class.java.name)
        )
            .daemon(false)
            .processNameSuffix("shell")
            .debuggable(BuildConfig.DEBUG)
            .version(BuildConfig.VERSION_CODE)
    }

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            shellService = IShellService.Stub.asInterface(service)
            serviceLatch.countDown()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            shellService = null
            isBound = false
        }
    }

    fun initialize(): ExecutionMode {
        currentMode = detectMode()
        if (currentMode == ExecutionMode.SHIZUKU) {
            bindShizukuService()
        }
        return currentMode
    }

    fun getMode(): ExecutionMode = currentMode

    fun setMode(modeName: String) {
        currentMode = when (modeName.uppercase()) {
            "ROOT" -> if (isRootAvailable()) ExecutionMode.ROOT else throw IllegalStateException("Root not available")
            "SHIZUKU" -> if (isShizukuReady()) {
                bindShizukuService()
                ExecutionMode.SHIZUKU
            } else throw IllegalStateException("Shizuku not available")
            else -> ExecutionMode.NONE
        }
    }

    fun isShizukuAvailable(): Boolean {
        return try {
            Shizuku.pingBinder()
        } catch (e: Exception) {
            false
        }
    }

    fun isShizukuGranted(): Boolean {
        return try {
            Shizuku.pingBinder() &&
                Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }

    private fun isShizukuReady(): Boolean {
        return isShizukuAvailable() && isShizukuGranted()
    }

    private fun detectMode(): ExecutionMode {
        return when {
            isRootAvailable() -> ExecutionMode.ROOT
            isShizukuReady() -> ExecutionMode.SHIZUKU
            else -> ExecutionMode.NONE
        }
    }

    private fun isRootAvailable(): Boolean {
        return try {
            Shell.isAppGrantedRoot() == true
        } catch (e: Exception) {
            false
        }
    }

    private fun bindShizukuService() {
        if (!Shizuku.pingBinder() || isBound) return
        try {
            serviceLatch = CountDownLatch(1)
            Shizuku.bindUserService(userServiceArgs, serviceConnection)
            isBound = true
        } catch (e: Exception) {
            currentMode = ExecutionMode.NONE
        }
    }

    suspend fun execute(command: String): Result<String> = withContext(Dispatchers.IO) {
        if (!isCommandAllowed(command)) {
            return@withContext Result.failure(SecurityException("Command not allowed: $command"))
        }

        when (currentMode) {
            ExecutionMode.ROOT -> executeViaRoot(command)
            ExecutionMode.SHIZUKU -> executeViaShizuku(command)
            ExecutionMode.NONE -> Result.failure(IllegalStateException("No execution mode available"))
        }
    }

    private fun executeViaRoot(command: String): Result<String> {
        return try {
            val shell = Shell.Builder.create()
                .setFlags(Shell.FLAG_REDIRECT_STDERR)
                .setTimeout(30)
                .build("su")

            if (!shell.isRoot) {
                return Result.failure(IllegalStateException("Root access denied"))
            }

            val result = shell.newJob().add(command).exec()
            if (result.isSuccess) {
                Result.success(result.out.joinToString("\n"))
            } else {
                Result.failure(Exception(result.err.joinToString("\n").ifEmpty { "Command failed" }))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun executeViaShizuku(command: String): Result<String> {
        val service = getShizukuService()
            ?: return Result.failure(IllegalStateException("Shizuku service not available"))

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

    private fun getShizukuService(timeoutMs: Long = 3000): IShellService? {
        if (shellService != null) return shellService
        if (!isBound) bindShizukuService()
        serviceLatch.await(timeoutMs, TimeUnit.MILLISECONDS)
        return shellService
    }

    private fun isCommandAllowed(command: String): Boolean {
        val trimmed = command.trim().lowercase()

        if (BLOCKED_PATTERNS.any { trimmed.contains(it.lowercase()) }) {
            return false
        }

        return ALLOWED_COMMANDS.any { trimmed.startsWith(it.lowercase()) }
    }

    fun cleanup() {
        if (isBound) {
            try {
                Shizuku.unbindUserService(userServiceArgs, serviceConnection, true)
            } catch (_: Exception) {}
        }
        shellService = null
        isBound = false
    }

    companion object {
        val ALLOWED_COMMANDS = setOf(
            "pm disable",
            "pm enable",
            "pm uninstall",
            "pm clear",
            "pm list",
            "am force-stop",
            "appops set",
            "appops get",
            "cmd appops",
            "dumpsys activity",
            "dumpsys package",
            "dumpsys battery",
            "ps -A",
            "cat /proc",
            "cat /sys",
            "settings put",
            "settings get",
            "settings delete"
        )

        val BLOCKED_PATTERNS = listOf(
            "rm -rf /",
            "rm -rf /*",
            "format",
            "mkfs",
            "dd if=",
            "> /dev/",
            "reboot",
            "shutdown",
            "su -c",
            "chmod 777 /",
            "; rm",
            "&& rm",
            "| rm",
            "rm -rf"
        )
    }
}
