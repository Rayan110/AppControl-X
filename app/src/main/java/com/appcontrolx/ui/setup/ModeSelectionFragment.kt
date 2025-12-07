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
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentModeSelectionBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        checkAvailableModes()
        setupButtons()
    }
    
    private fun checkAvailableModes() {
        val hasRoot = permissionBridge.isRootAvailable()
        binding.radioRoot.isEnabled = hasRoot
        updateStatus(binding.rootStatusIcon, binding.rootStatusText, hasRoot,
            R.string.status_available, R.string.status_not_available)
        
        val hasShizuku = permissionBridge.isShizukuAvailable()
        binding.radioShizuku.isEnabled = hasShizuku
        updateStatus(binding.shizukuStatusIcon, binding.shizukuStatusText, hasShizuku,
            R.string.status_running, R.string.status_not_running)
        
        when {
            hasRoot -> binding.radioRoot.isChecked = true
            hasShizuku -> binding.radioShizuku.isChecked = true
            else -> binding.radioViewOnly.isChecked = true
        }
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
    
    private fun setupButtons() {
        binding.btnCheckRoot.setOnClickListener {
            lifecycleScope.launch {
                val result = Shell.cmd("id").exec()
                if (result.isSuccess) {
                    Toast.makeText(context, "Root access granted!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Root access denied", Toast.LENGTH_SHORT).show()
                }
                checkAvailableModes()
            }
        }
        
        binding.btnInstallShizuku.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("market://details?id=moe.shizuku.privileged.api")
            }
            startActivity(intent)
        }
        
        binding.btnNext.setOnClickListener {
            saveSelectedMode()
            (activity as? SetupActivity)?.nextStep()
        }
    }
    
    private fun saveSelectedMode() {
        val mode = when {
            binding.radioRoot.isChecked -> Constants.MODE_ROOT
            binding.radioShizuku.isChecked -> Constants.MODE_SHIZUKU
            else -> Constants.MODE_NONE
        }
        PreferenceManager.getDefaultSharedPreferences(requireContext())
            .edit().putString(Constants.PREFS_EXECUTION_MODE, mode).apply()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
