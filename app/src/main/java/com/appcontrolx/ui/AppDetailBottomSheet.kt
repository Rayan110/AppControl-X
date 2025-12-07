package com.appcontrolx.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.appcontrolx.R
import com.appcontrolx.databinding.BottomSheetAppDetailBinding
import com.appcontrolx.executor.CommandExecutor
import com.appcontrolx.executor.RootExecutor
import com.appcontrolx.model.AppInfo
import com.appcontrolx.model.ExecutionMode
import com.appcontrolx.service.BatteryPolicyManager
import com.appcontrolx.service.PermissionBridge
import com.appcontrolx.utils.SafetyValidator
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppDetailBottomSheet : BottomSheetDialogFragment() {
    
    private var _binding: BottomSheetAppDetailBinding? = null
    private val binding get() = _binding!!
    
    private var appInfo: AppInfo? = null
    private var executor: CommandExecutor? = null
    private var policyManager: BatteryPolicyManager? = null
    private var executionMode: ExecutionMode = ExecutionMode.None
    
    var onActionCompleted: (() -> Unit)? = null
    
    companion object {
        const val TAG = "AppDetailBottomSheet"
        private const val ARG_PACKAGE_NAME = "package_name"
        private const val ARG_APP_NAME = "app_name"
        private const val ARG_IS_ENABLED = "is_enabled"
        private const val ARG_IS_SYSTEM = "is_system"
        
        fun newInstance(app: AppInfo): AppDetailBottomSheet {
            return AppDetailBottomSheet().apply {
                arguments = Bundle().apply {
                    putString(ARG_PACKAGE_NAME, app.packageName)
                    putString(ARG_APP_NAME, app.appName)
                    putBoolean(ARG_IS_ENABLED, app.isEnabled)
                    putBoolean(ARG_IS_SYSTEM, app.isSystemApp)
                }
            }
        }
    }
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = BottomSheetAppDetailBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupExecutor()
        loadAppInfo()
        setupButtons()
    }
    
    private fun setupExecutor() {
        executionMode = PermissionBridge().detectMode()
        if (executionMode is ExecutionMode.Root) {
            executor = RootExecutor()
            policyManager = BatteryPolicyManager(executor!!)
        }
    }
    
    private fun loadAppInfo() {
        val packageName = arguments?.getString(ARG_PACKAGE_NAME) ?: return
        val appName = arguments?.getString(ARG_APP_NAME) ?: packageName
        val isEnabled = arguments?.getBoolean(ARG_IS_ENABLED, true) ?: true
        
        try {
            val pm = requireContext().packageManager
            val packageInfo = pm.getPackageInfo(packageName, 0)
            val appIcon = pm.getApplicationIcon(packageName)
            
            binding.ivAppIcon.setImageDrawable(appIcon)
            binding.tvAppName.text = appName
            binding.tvPackageName.text = packageName
            binding.tvVersion.text = getString(R.string.detail_version_format, 
                packageInfo.versionName ?: "Unknown", packageInfo.longVersionCode)
            
            // App size
            val appFile = File(packageInfo.applicationInfo.sourceDir)
            binding.tvAppSize.text = formatFileSize(appFile.length())
            
            // Install path
            binding.tvInstallPath.text = packageInfo.applicationInfo.sourceDir
            
            // Dates
            val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            binding.tvInstallDate.text = dateFormat.format(Date(packageInfo.firstInstallTime))
            binding.tvUpdateDate.text = dateFormat.format(Date(packageInfo.lastUpdateTime))
            
            // Status
            binding.tvStatus.text = if (isEnabled) {
                getString(R.string.status_enabled)
            } else {
                getString(R.string.status_disabled)
            }
            binding.tvStatus.setTextColor(resources.getColor(
                if (isEnabled) R.color.status_positive else R.color.status_negative, null))
            
            // Update button text based on state
            binding.btnToggleEnable.text = if (isEnabled) {
                getString(R.string.action_disable)
            } else {
                getString(R.string.action_enable)
            }
            
            // Store for actions
            appInfo = AppInfo(
                packageName = packageName,
                appName = appName,
                icon = appIcon,
                isSystemApp = arguments?.getBoolean(ARG_IS_SYSTEM, false) ?: false,
                isEnabled = isEnabled
            )
            
        } catch (e: Exception) {
            Toast.makeText(context, R.string.error_load_app_info, Toast.LENGTH_SHORT).show()
            dismiss()
        }
    }
    
    private fun setupButtons() {
        val packageName = arguments?.getString(ARG_PACKAGE_NAME) ?: return
        val hasMode = executionMode !is ExecutionMode.None
        
        // Get allowed actions based on safety rules
        val allowedActions = SafetyValidator.getAllowedActions(packageName)
        val isForceStopOnly = SafetyValidator.isForceStopOnly(packageName)
        val isCritical = SafetyValidator.isCritical(packageName)
        
        // Force Stop - allowed for most apps except critical
        binding.btnForceStop.isEnabled = hasMode && !isCritical
        
        // Freeze/Disable - not allowed for force-stop-only or critical apps
        binding.btnToggleEnable.isEnabled = hasMode && 
            SafetyValidator.AllowedAction.FREEZE in allowedActions
        
        // Background restriction - not allowed for force-stop-only or critical apps
        binding.btnToggleBackground.isEnabled = hasMode && 
            SafetyValidator.AllowedAction.RESTRICT_BACKGROUND in allowedActions
        
        // Uninstall - not allowed for force-stop-only or critical apps
        binding.btnUninstall.isEnabled = hasMode && 
            SafetyValidator.AllowedAction.UNINSTALL in allowedActions
        
        // Show warning for protected apps
        if (isForceStopOnly) {
            binding.btnToggleEnable.alpha = 0.5f
            binding.btnToggleBackground.alpha = 0.5f
            binding.btnUninstall.alpha = 0.5f
        }
        
        binding.btnForceStop.setOnClickListener {
            if (isCritical) {
                showProtectedWarning()
                return@setOnClickListener
            }
            executeAction { policyManager?.forceStop(appInfo!!.packageName) }
        }
        
        binding.btnToggleEnable.setOnClickListener {
            if (isForceStopOnly || isCritical) {
                showProtectedWarning()
                return@setOnClickListener
            }
            val app = appInfo ?: return@setOnClickListener
            if (app.isEnabled) {
                executeAction { policyManager?.freezeApp(app.packageName) }
            } else {
                executeAction { policyManager?.unfreezeApp(app.packageName) }
            }
        }
        
        binding.btnToggleBackground.setOnClickListener {
            if (isForceStopOnly || isCritical) {
                showProtectedWarning()
                return@setOnClickListener
            }
            executeAction { policyManager?.restrictBackground(appInfo!!.packageName) }
        }
        
        binding.btnUninstall.setOnClickListener {
            if (isForceStopOnly || isCritical) {
                showProtectedWarning()
                return@setOnClickListener
            }
            executeAction { policyManager?.uninstallApp(appInfo!!.packageName) }
        }
        
        binding.btnOpenSettings.setOnClickListener {
            openAppSettings()
        }
    }
    
    private fun showProtectedWarning() {
        Toast.makeText(context, R.string.error_protected_app, Toast.LENGTH_SHORT).show()
    }
    
    private fun executeAction(action: suspend () -> Result<Unit>?) {
        if (policyManager == null) {
            Toast.makeText(context, R.string.error_mode_required_message, Toast.LENGTH_SHORT).show()
            return
        }
        
        lifecycleScope.launch {
            try {
                val result = withContext(Dispatchers.IO) { action() }
                if (result?.isSuccess == true) {
                    Toast.makeText(context, R.string.action_success, Toast.LENGTH_SHORT).show()
                    onActionCompleted?.invoke()
                    dismiss()
                } else {
                    Toast.makeText(context, R.string.action_failed_generic, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, e.message ?: getString(R.string.error_unknown), Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun openAppSettings() {
        val packageName = appInfo?.packageName ?: return
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, R.string.error_open_settings, Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun formatFileSize(size: Long): String {
        return when {
            size >= 1024 * 1024 * 1024 -> String.format("%.2f GB", size / (1024.0 * 1024 * 1024))
            size >= 1024 * 1024 -> String.format("%.2f MB", size / (1024.0 * 1024))
            size >= 1024 -> String.format("%.2f KB", size / 1024.0)
            else -> "$size B"
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
