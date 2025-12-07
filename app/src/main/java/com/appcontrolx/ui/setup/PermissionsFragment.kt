package com.appcontrolx.ui.setup

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentPermissionsBinding

class PermissionsFragment : Fragment() {
    
    private var _binding: FragmentPermissionsBinding? = null
    private val binding get() = _binding!!
    
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { updatePermissionStatus() }
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentPermissionsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        updatePermissionStatus()
        setupButtons()
    }
    
    private fun updatePermissionStatus() {
        // Notification
        val hasNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.POST_NOTIFICATIONS) == 
                PackageManager.PERMISSION_GRANTED
        } else true
        
        updateStatus(binding.notificationIcon, binding.notificationStatus, hasNotification,
            R.string.status_granted, R.string.status_not_granted)
        binding.btnNotification.isEnabled = !hasNotification
        
        // Query packages (auto)
        updateStatus(binding.queryPackagesIcon, binding.queryPackagesStatus, true,
            R.string.status_granted_auto, R.string.status_granted_auto)
        
        // Battery
        val pm = requireContext().getSystemService(Context.POWER_SERVICE) as PowerManager
        val isIgnoring = pm.isIgnoringBatteryOptimizations(requireContext().packageName)
        updateStatus(binding.batteryIcon, binding.batteryStatus, isIgnoring,
            R.string.status_exempted, R.string.status_not_exempted, R.drawable.ic_circle_outline)
    }
    
    private fun updateStatus(iconView: ImageView, textView: TextView, isPositive: Boolean,
                            positiveRes: Int, negativeRes: Int, neutralIcon: Int? = null) {
        textView.text = getString(if (isPositive) positiveRes else negativeRes)
        iconView.setImageResource(when {
            isPositive -> R.drawable.ic_check_circle
            neutralIcon != null -> neutralIcon
            else -> R.drawable.ic_cancel
        })
        iconView.setColorFilter(ContextCompat.getColor(requireContext(), when {
            isPositive -> R.color.status_positive
            neutralIcon != null -> R.color.status_neutral
            else -> R.color.status_negative
        }))
    }
    
    private fun setupButtons() {
        binding.btnNotification.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        
        binding.btnBattery.setOnClickListener {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${requireContext().packageName}")
            }
            startActivity(intent)
        }
        
        binding.btnNext.setOnClickListener {
            (activity as? SetupActivity)?.nextStep()
        }
    }
    
    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
