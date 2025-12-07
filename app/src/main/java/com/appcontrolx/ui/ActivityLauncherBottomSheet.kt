package com.appcontrolx.ui

import android.content.ComponentName
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.appcontrolx.R
import com.appcontrolx.databinding.BottomSheetActivityLauncherBinding
import com.appcontrolx.ui.adapter.ActivityListAdapter
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ActivityLauncherBottomSheet : BottomSheetDialogFragment() {
    
    private var _binding: BottomSheetActivityLauncherBinding? = null
    private val binding get() = _binding
    
    private lateinit var adapter: ActivityListAdapter
    private var allActivities: List<ActivityItem> = emptyList()
    private var showSystemApps = false
    
    data class ActivityItem(
        val packageName: String,
        val activityName: String,
        val appName: String,
        val appIcon: Drawable?,
        val isSystem: Boolean,
        val isExported: Boolean
    )
    
    companion object {
        const val TAG = "ActivityLauncherBottomSheet"
        fun newInstance() = ActivityLauncherBottomSheet()
    }
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        _binding = BottomSheetActivityLauncherBinding.inflate(inflater, container, false)
        return _binding?.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupChips()
        loadActivities()
    }
    
    private fun setupRecyclerView() {
        val b = binding ?: return
        adapter = ActivityListAdapter { activity ->
            launchActivity(activity)
        }
        b.recyclerView.layoutManager = LinearLayoutManager(context)
        b.recyclerView.adapter = adapter
    }
    
    private fun setupChips() {
        val b = binding ?: return
        b.chipUserApps.isChecked = true
        
        b.chipUserApps.setOnClickListener {
            showSystemApps = false
            b.chipUserApps.isChecked = true
            b.chipSystemApps.isChecked = false
            filterActivities()
        }
        
        b.chipSystemApps.setOnClickListener {
            showSystemApps = true
            b.chipSystemApps.isChecked = true
            b.chipUserApps.isChecked = false
            filterActivities()
        }
    }
    
    private fun loadActivities() {
        val b = binding ?: return
        b.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            allActivities = withContext(Dispatchers.IO) {
                val pm = requireContext().packageManager
                val packages = pm.getInstalledPackages(PackageManager.GET_ACTIVITIES)
                
                packages.flatMap { pkg ->
                    val isSystem = (pkg.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0
                    val appName = pkg.applicationInfo.loadLabel(pm).toString()
                    val appIcon = try { pkg.applicationInfo.loadIcon(pm) } catch (e: Exception) { null }
                    
                    pkg.activities?.mapNotNull { activity ->
                        // Only include valid launchable activities
                        if (isValidActivity(activity)) {
                            ActivityItem(
                                packageName = pkg.packageName,
                                activityName = activity.name,
                                appName = appName,
                                appIcon = appIcon,
                                isSystem = isSystem,
                                isExported = activity.exported
                            )
                        } else null
                    } ?: emptyList()
                }.sortedBy { it.appName.lowercase() }
            }
            
            b.progressBar.visibility = View.GONE
            filterActivities()
        }
    }
    
    private fun isValidActivity(activity: ActivityInfo): Boolean {
        // Filter out invalid/internal activities
        val name = activity.name.lowercase()
        
        // Skip internal/test activities
        if (name.contains("test") || name.contains("debug") || name.contains("internal")) {
            return false
        }
        
        // Skip activities that are clearly not meant to be launched
        if (name.endsWith("receiver") || name.endsWith("service") || name.endsWith("provider")) {
            return false
        }
        
        // Prefer exported activities or activities with a label
        return activity.exported || activity.labelRes != 0
    }
    
    private fun filterActivities() {
        val filtered = allActivities.filter { it.isSystem == showSystemApps }
        adapter.submitList(filtered)
        binding?.tvCount?.text = getString(R.string.tools_activity_count, filtered.size)
    }
    
    private fun launchActivity(activity: ActivityItem) {
        try {
            val intent = Intent().apply {
                component = ComponentName(activity.packageName, activity.activityName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, R.string.tools_activity_launch_failed, Toast.LENGTH_SHORT).show()
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
