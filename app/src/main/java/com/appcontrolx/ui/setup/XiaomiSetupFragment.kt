package com.appcontrolx.ui.setup

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentXiaomiSetupBinding
import com.appcontrolx.service.XiaomiBridge
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class XiaomiSetupFragment : Fragment() {
    
    private var _binding: FragmentXiaomiSetupBinding? = null
    private val binding get() = _binding!!
    
    private val xiaomiBridge by lazy { XiaomiBridge(requireContext(), null) }
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentXiaomiSetupBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        detectXiaomiUI()
        setupButtons()
    }
    
    private fun detectXiaomiUI() {
        val ui = xiaomiBridge.getXiaomiUI()
        binding.tvDetectedUI.text = when (ui) {
            is XiaomiBridge.XiaomiUI.MIUI -> getString(R.string.miui_detected, ui.version)
            is XiaomiBridge.XiaomiUI.HyperOS -> getString(R.string.hyperos_detected, ui.version)
            else -> getString(R.string.unknown_xiaomi_ui)
        }
    }
    
    private fun setupButtons() {
        binding.btnBatterySaver.setOnClickListener {
            if (!xiaomiBridge.openBatterySaverSettings()) {
                Toast.makeText(context, R.string.error_open_battery, Toast.LENGTH_SHORT).show()
            }
        }
        
        binding.btnLockTutorial.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle(R.string.lock_app_title)
                .setMessage(R.string.lock_app_tutorial)
                .setPositiveButton(android.R.string.ok, null)
                .show()
        }
        
        binding.btnNext.setOnClickListener {
            (activity as? SetupActivity)?.nextStep()
        }
        
        binding.btnSkip.setOnClickListener {
            (activity as? SetupActivity)?.nextStep()
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
