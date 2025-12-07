package com.appcontrolx.ui.setup

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.preference.PreferenceManager
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentModeSelectionBinding
import com.appcontrolx.service.PermissionBridge
import com.appcontrolx.utils.Constants
import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.launch

class ModeSelectionFragment : Fragment() {
    
    private var _binding: FragmentModeSelectionBinding? = null
    private val binding get() = _binding!!
    
    private val permissionBridge by lazy { PermissionBridge() }
    private var selectedMode: String = Constants.MODE_NONE
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentModeSelectionBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        checkAvailableModes()
        setupRadioButtons()
        setupButtons()
    }
    
    private fun checkAvailableModes() {
        val hasRoot = permissionBridge.isRootAvailable()
        binding.radioRoot.isEnabled = hasRoot
        binding.cardRoot.isEnabled = hasRoot
        binding.cardRoot.alpha = if (hasRoot) 1f else 0.5f
        updateStatus(binding.rootStatusIcon, binding.rootStatusText, hasRoot,
            R.string.status_available, R.string.status_not_available)
        
        val hasShizuku = permissionBridge.isShizukuAvailable()
        binding.radioShizuku.isEnabled = hasShizuku
        binding.cardShizuku.isEnabled = hasShizuku
        binding.cardShizuku.alpha = if (hasShizuku) 1f else 0.5f
        updateStatus(binding.shizukuStatusIcon, binding.shizukuStatusText, hasShizuku,
            R.string.status_running, R.string.status_not_running)
        
        // Auto-select best available mode
        selectedMode = when {
            hasRoot -> Constants.MODE_ROOT
            hasShizuku -> Constants.MODE_SHIZUKU
            else -> Constants.MODE_NONE
        }
        updateSelection()
    }
    
    private fun updateStatus(iconView: View, textView: android.widget.TextView, 
                            isPositive: Boolean, positiveRes: Int, negativeRes: Int) {
        textView.text = getString(if (isPositive) positiveRes else negativeRes)
        (iconView as? android.widget.ImageView)?.apply {
            setImageResource(if (isPositive) R.drawable.ic_check_circle else R.drawable.ic_cancel)
            setColorFilter(ContextCompat.getColor(requireContext(),
                if (isPositive) R.color.status_positive else R.color.status_negative))
        }
    }
    
    private fun setupRadioButtons() {
        // Card click handlers
        binding.cardRoot.setOnClickListener {
            if (binding.radioRoot.isEnabled) {
                selectedMode = Constants.MODE_ROOT
                updateSelection()
            }
        }
        
        binding.cardShizuku.setOnClickListener {
            if (binding.radioShizuku.isEnabled) {
                selectedMode = Constants.MODE_SHIZUKU
                updateSelection()
            }
        }
        
        binding.cardViewOnly.setOnClickListener {
            selectedMode = Constants.MODE_NONE
            updateSelection()
        }
        
        // Radio button handlers
        binding.radioRoot.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked && selectedMode != Constants.MODE_ROOT) {
                selectedMode = Constants.MODE_ROOT
                updateSelection()
            }
        }
        
        binding.radioShizuku.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked && selectedMode != Constants.MODE_SHIZUKU) {
                selectedMode = Constants.MODE_SHIZUKU
                updateSelection()
            }
        }
        
        binding.radioViewOnly.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked && selectedMode != Constants.MODE_NONE) {
                selectedMode = Constants.MODE_NONE
                updateSelection()
            }
        }
    }
    
    private fun updateSelection() {
        // Update radio buttons
        binding.radioRoot.isChecked = selectedMode == Constants.MODE_ROOT
        binding.radioShizuku.isChecked = selectedMode == Constants.MODE_SHIZUKU
        binding.radioViewOnly.isChecked = selectedMode == Constants.MODE_NONE
        
        // Update card stroke colors
        val selectedColor = ContextCompat.getColor(requireContext(), R.color.primary)
        val defaultColor = ContextCompat.getColor(requireContext(), R.color.outline)
        
        binding.cardRoot.strokeColor = if (selectedMode == Constants.MODE_ROOT) selectedColor else defaultColor
        binding.cardShizuku.strokeColor = if (selectedMode == Constants.MODE_SHIZUKU) selectedColor else defaultColor
        binding.cardViewOnly.strokeColor = if (selectedMode == Constants.MODE_NONE) selectedColor else defaultColor
    }
    
    private fun setupButtons() {
        binding.btnCheckRoot.setOnClickListener {
            lifecycleScope.launch {
                binding.btnCheckRoot.isEnabled = false
                binding.btnCheckRoot.text = getString(R.string.btn_checking)
                
                val result = Shell.cmd("id").exec()
                if (result.isSuccess) {
                    Toast.makeText(context, R.string.root_granted, Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, R.string.root_denied, Toast.LENGTH_SHORT).show()
                }
                
                binding.btnCheckRoot.text = getString(R.string.btn_check)
                binding.btnCheckRoot.isEnabled = true
                checkAvailableModes()
            }
        }
        
        binding.btnInstallShizuku.setOnClickListener {
            try {
                startActivity(Intent(Intent.ACTION_VIEW, 
                    Uri.parse("market://details?id=moe.shizuku.privileged.api")))
            } catch (e: Exception) {
                startActivity(Intent(Intent.ACTION_VIEW,
                    Uri.parse("https://shizuku.rikka.app/")))
            }
        }
        
        binding.btnNext.setOnClickListener {
            saveSelectedMode()
            (activity as? SetupActivity)?.nextStep()
        }
    }
    
    private fun saveSelectedMode() {
        PreferenceManager.getDefaultSharedPreferences(requireContext())
            .edit().putString(Constants.PREFS_EXECUTION_MODE, selectedMode).apply()
    }
    
    override fun onResume() {
        super.onResume()
        checkAvailableModes()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
