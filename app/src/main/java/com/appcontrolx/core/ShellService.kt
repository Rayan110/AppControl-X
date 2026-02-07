package com.appcontrolx.core

import android.os.Binder
import com.appcontrolx.IShellService
import java.io.BufferedReader
import java.io.InputStreamReader

class ShellService : IShellService.Stub() {

    override fun exec(command: String): String {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val errorReader = BufferedReader(InputStreamReader(process.errorStream))

            val output = StringBuilder()
            var line: String?

            while (reader.readLine().also { line = it } != null) {
                output.appendLine(line)
            }

            val exitCode = process.waitFor()
            if (exitCode != 0) {
                val error = StringBuilder()
                while (errorReader.readLine().also { line = it } != null) {
                    error.appendLine(line)
                }
                "ERROR:${error.toString().trim().ifEmpty { "Exit code: $exitCode" }}"
            } else {
                output.toString().trim()
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

    override fun onTransact(code: Int, data: android.os.Parcel, reply: android.os.Parcel?, flags: Int): Boolean {
        try {
            return super.onTransact(code, data, reply, flags)
        } catch (e: Exception) {
            throw e
        }
    }
}
