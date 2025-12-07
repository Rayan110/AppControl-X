package com.appcontrolx.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.appcontrolx.R
import com.appcontrolx.databinding.FragmentAboutBinding
import com.appcontrolx.service.PermissionBridge

class AboutFragment : Fragment() {
    
    private var _binding: FragmentAboutBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAboutBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupAppInfo()
        setupCurrentMode()
        setupLinks()
    }
    
    private fun setupAppInfo() {
        val packageInfo = requireContext().packageManager
            .getPackageInfo(requireContext().packageName, 0)
        
        binding.tvVersion.text = "v${packageInfo.versionName}"
    }
    
    private fun setupCurrentMode() {
        val mode = PermissionBridge().detectMode()
        binding.tvCurrentMode.text = mode.displayName()
    }
    
    private fun setupLinks() {
        binding.btnGithub.setOnClickListener {
            openUrl("https://github.com/user/AppControlX")
        }
        
        binding.btnShare.setOnClickListener {
            shareApp()
        }
    }
    
    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    }
    
    private fun shareApp() {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, getString(R.string.app_name))
            putExtra(Intent.EXTRA_TEXT, 
                "Check out AppControlX - Control your apps, save your battery!")
        }
        startActivity(Intent.createChooser(intent, "Share via"))
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
