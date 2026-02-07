package com.appcontrolx.domain

import com.appcontrolx.core.ShellManager
import com.appcontrolx.model.ActionResult
import com.appcontrolx.model.AppAction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppManager @Inject constructor(
    private val shellManager: ShellManager,
    private val safetyValidator: SafetyValidator
) {

    suspend fun executeAction(packageName: String, action: AppAction): ActionResult =
        withContext(Dispatchers.IO) {
            val validation = safetyValidator.validatePackageName(packageName)
            if (validation.isFailure) {
                return@withContext ActionResult(
                    success = false,
                    message = validation.exceptionOrNull()?.message ?: "Invalid package",
                    packageName = packageName,
                    action = action
                )
            }

            val actionValidation = safetyValidator.validateAction(packageName, action)
            if (actionValidation.isFailure) {
                return@withContext ActionResult(
                    success = false,
                    message = actionValidation.exceptionOrNull()?.message ?: "Action not allowed",
                    packageName = packageName,
                    action = action
                )
            }

            val command = generateCommand(packageName, action)
            val result = shellManager.execute(command)

            result.fold(
                onSuccess = {
                    ActionResult(
                        success = true,
                        message = "Success",
                        packageName = packageName,
                        action = action
                    )
                },
                onFailure = { error ->
                    ActionResult(
                        success = false,
                        message = error.message ?: "Command failed",
                        packageName = packageName,
                        action = action
                    )
                }
            )
        }

    suspend fun executeBatchAction(
        packages: List<String>,
        action: AppAction,
        onProgress: (current: Int, total: Int, packageName: String) -> Unit
    ): List<ActionResult> = withContext(Dispatchers.IO) {
        val results = mutableListOf<ActionResult>()
        val total = packages.size

        packages.forEachIndexed { index, packageName ->
            onProgress(index + 1, total, packageName)
            val result = executeAction(packageName, action)
            results.add(result)
        }

        results
    }

    private fun generateCommand(packageName: String, action: AppAction): String {
        return when (action) {
            AppAction.FREEZE -> "pm disable-user --user 0 $packageName"
            AppAction.UNFREEZE -> "pm enable $packageName"
            AppAction.FORCE_STOP -> "am force-stop $packageName"
            AppAction.UNINSTALL -> "pm uninstall -k --user 0 $packageName"
            AppAction.CLEAR_CACHE -> "pm clear --cache-only $packageName"
            AppAction.CLEAR_DATA -> "pm clear $packageName"
            AppAction.RESTRICT_BACKGROUND -> "appops set $packageName RUN_IN_BACKGROUND ignore"
            AppAction.ALLOW_BACKGROUND -> "appops set $packageName RUN_IN_BACKGROUND allow"
        }
    }
}
