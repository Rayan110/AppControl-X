package com.appcontrolx.executor

import com.topjohnwu.superuser.Shell

class RootExecutor : CommandExecutor {
    
    override fun execute(command: String): Result<String> {
        return try {
            val result = Shell.cmd(command).exec()
            if (result.isSuccess) {
                Result.success(result.out.joinToString("\n"))
            } else {
                Result.failure(Exception(result.err.joinToString("\n")))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun executeBatch(commands: List<String>): Result<Unit> {
        return try {
            val result = Shell.cmd(*commands.toTypedArray()).exec()
            if (result.isSuccess) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(result.err.joinToString("\n")))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
