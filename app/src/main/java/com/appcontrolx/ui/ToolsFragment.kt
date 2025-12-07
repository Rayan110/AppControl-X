package com.appcontrolx.ui

import android.content.ComponentName
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentToolsBinding

class ToolsFragment : Fragment() {
    
    private var _binding: FragmentToolsBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentToolsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupHiddenSettings()
        setupActivityLauncher()
    }
    
    private fun setupHiddenSettings() {
        // Display Settings
        binding.itemExtraDim.setOnClickListener {
            openHiddenSetting("com.android.settings", "com.android.settings.display.ReduceBrightColorsPreferenceFragment")
        }
        
        // Notification Settings
        binding.itemNotificationLog.setOnClickListener {
            openHiddenSetting("com.android.settings", "com.android.settings.notification.NotificationStation")
        }
        
        binding.itemNotificationHistory.setOnClickListener {
            openHiddenSetting("com.android.settings", "com.android.settings.notification.history.NotificationHistoryActivity")
        }
        
        // Battery Settings
        binding.itemBatteryOptimization.setOnClickListener {
            try {
                startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
            } catch (e: Exception) {
                openHiddenSetting("com.android.settings", "com.android.settings.Settings\$HighPowerApplicationsActivity")
            }
        }
        
        // Performance Settings
        binding.itemPerformanceMode.setOnClickListener {
            openHiddenSetting("com.android.settings", "com.android.settings.Settings\$GameDashboardActivity")
        }
        
        // Developer Options
        binding.itemDeveloperOptions.setOnClickListener {
            try {
                startActivity(Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS))
            } catch (e: Exception) {
                showError()
            }
        }
        
        // Running Services
        binding.itemRunningServices.setOnClickListener {
            openHiddenSetting("com.android.settings", "com.android.settings.Settings\$DevRunningServicesActivity")
        }
    }
    
    private fun setupActivityLauncher() {
        binding.itemActivityLauncher.setOnClickListener {
            val bottomSheet = ActivityLauncherBottomSheet.newInstance()
            bottomSheet.show(childFragmentManager, ActivityLauncherBottomSheet.TAG)
        }
    }
    
    private fun openHiddenSetting(packageName: String, className: String) {
        try {
            val intent = Intent().apply {
                component = ComponentName(packageName, className)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            // Try alternative method
            try {
                val intent = Intent().apply {
                    action = "android.settings.SETTINGS"
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(intent)
                Toast.makeText(context, R.string.tools_navigate_manually, Toast.LENGTH_LONG).show()
            } catch (e2: Exception) {
                showError()
            }
        }
    }
    
    private fun showError() {
        Toast.makeText(context, R.string.tools_not_available, Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
