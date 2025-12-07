package com.appcontrolx.ui

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
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
        val isSystem: Boolean
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
                    
                    pkg.activities?.map { activity ->
                        ActivityItem(
                            packageName = pkg.packageName,
                            activityName = activity.name,
                            appName = appName,
                            isSystem = isSystem
                        )
                    } ?: emptyList()
                }.sortedBy { it.appName.lowercase() }
            }
            
            b.progressBar.visibility = View.GONE
            filterActivities()
        }
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
