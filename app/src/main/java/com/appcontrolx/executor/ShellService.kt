package com.appcontrolx.executor

import com.appcontrolx.IShellService
import java.io.BufferedReader

class ShellService : IShellService.Stub() {
    
    override fun exec(command: String): String {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val output = process.inputStream.bufferedReader().use(BufferedReader::readText)
            val error = process.errorStream.bufferedReader().use(BufferedReader::readText)
            val exitCode = process.waitFor()
            
            if (exitCode == 0) {
                output.trim()
            } else {
                val errorMsg = error.ifBlank { output }.trim()
                "ERROR:${errorMsg.ifBlank { "Exit code $exitCode" }}"
            }
        } catch (e: Exception) {
            "ERROR:${e.message}"
        }
    }
    
    override fun execReturnCode(command: String): Int {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            process.waitFor()
        } catch (e: Exception) {
            -1
        }
    }
}
