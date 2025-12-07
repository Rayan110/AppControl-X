package com.appcontrolx.ui.setup

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.preference.PreferenceManager
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentSetupCompleteBinding
import com.appcontrolx.service.XiaomiBridge
import com.appcontrolx.utils.Constants

class SetupCompleteFragment : Fragment() {
    
    private var _binding: FragmentSetupCompleteBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSetupCompleteBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        showSetupSummary()
        
        binding.btnStart.setOnClickListener {
            (activity as? SetupActivity)?.completeSetup()
        }
    }
    
    private fun showSetupSummary() {
        val prefs = PreferenceManager.getDefaultSharedPreferences(requireContext())
        val mode = prefs.getString(Constants.PREFS_EXECUTION_MODE, Constants.MODE_NONE)
        
        binding.tvMode.text = when (mode) {
            Constants.MODE_ROOT -> getString(R.string.mode_root)
            Constants.MODE_SHIZUKU -> getString(R.string.mode_shizuku)
            else -> getString(R.string.mode_view_only)
        }
        
        val hasNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.POST_NOTIFICATIONS) == 
                PackageManager.PERMISSION_GRANTED
        } else true
        updateSummaryItem(binding.notificationIcon, binding.tvNotification, hasNotification,
            R.string.status_enabled, R.string.status_disabled)
        
        val xiaomiBridge = XiaomiBridge(requireContext(), null)
        if (xiaomiBridge.isXiaomiDevice()) {
            binding.xiaomiSection.visibility = View.VISIBLE
            updateSummaryItem(binding.xiaomiIcon, binding.tvXiaomiSetup, true,
                R.string.status_configured, R.string.status_configured)
        } else {
            binding.xiaomiSection.visibility = View.GONE
        }
    }
    
    private fun updateSummaryItem(iconView: ImageView, textView: TextView, 
                                  isPositive: Boolean, positiveRes: Int, negativeRes: Int) {
        textView.text = getString(if (isPositive) positiveRes else negativeRes)
        iconView.setImageResource(if (isPositive) R.drawable.ic_check_circle else R.drawable.ic_cancel)
        iconView.setColorFilter(ContextCompat.getColor(requireContext(),
            if (isPositive) R.color.status_positive else R.color.status_negative))
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
