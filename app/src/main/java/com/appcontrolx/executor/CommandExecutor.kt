package com.appcontrolx.executor

interface CommandExecutor {
    fun execute(command: String): Result<String>
    fun executeBatch(commands: List<String>): Result<Unit>
}
