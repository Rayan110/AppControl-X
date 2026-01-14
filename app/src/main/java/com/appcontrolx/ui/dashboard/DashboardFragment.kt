package com.appcontrolx.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.appcontrolx.R
import com.appcontrolx.data.model.*
import com.appcontrolx.databinding.FragmentDashboardBinding
import com.appcontrolx.ui.MainPagerAdapter
import com.appcontrolx.ui.MainActivity
import com.appcontrolx.ui.dashboard.cards.CpuGraphView
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Dashboard fragment displaying real-time system information and quick access to features.
 * 
 * Shows:
 * - CPU usage with real-time graph and per-core frequencies
 * - Grid of system info cards (Battery, Network, Apps, Display, RAM, Storage)
 * 
 * Card Layout Order (matching mockup):
 * 1. CPU Card (full width with background graph)
 * 2. Battery | Network (side by side)
 * 3. Apps | Display (side by side)
 * 4. RAM | Storage (side by side)
 * 
 * Requirements: 0.1, 0.2, 0.3, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
@AndroidEntryPoint
class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DashboardViewModel by viewModels()
    
    // Graph data points (last 60 seconds)
    private val graphData = mutableListOf<Float>()
    
    // Core frequency adapter
    private val coreFrequencyAdapter = CoreFrequencyAdapter()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupCpuCard()
        setupClickListeners()
        observeUiState()
    }
    
    /**
     * Setup the CPU card with graph and core frequency RecyclerView.
     */
    private fun setupCpuCard() {
        // Setup core frequency RecyclerView with 2 columns
        binding.rvCoreFrequencies.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
            adapter = coreFrequencyAdapter
            isNestedScrollingEnabled = false
        }
    }

    private fun setupClickListeners() {
        // Apps card click - navigate to Apps tab
        binding.cardApps.setOnClickListener {
            navigateToAppsTab()
        }
    }
    
    /**
     * Navigate to the Apps tab in the ViewPager.
     * Requirement 4.4: WHEN user taps Apps_Card, THE System SHALL navigate to Apps tab
     */
    private fun navigateToAppsTab() {
        // Get the parent activity and access the ViewPager
        (activity as? MainActivity)?.let { mainActivity ->
            // Navigate to Apps tab (position 1)
            mainActivity.findViewById<androidx.viewpager2.widget.ViewPager2>(R.id.viewPager)
                ?.setCurrentItem(MainPagerAdapter.POSITION_APPS, true)
        }
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    updateUi(state)
                }
            }
        }
    }

    private fun updateUi(state: DashboardUiState) {
        // Update mode indicator
        updateModeIndicator(state.executionMode)
        
        // Update system snapshot
        state.systemSnapshot?.let { snapshot ->
            updateCpuCard(snapshot.cpu)
            updateBatteryCard(snapshot.battery)
            updateNetworkCard(snapshot.network)
            updateRamCard(snapshot.ram)
            updateStorageCard(snapshot.storage)
        }
        
        // Update display info
        state.displayInfo?.let { updateDisplayCard(it) }
        
        // Update app counts
        state.appCounts?.let { updateAppsCard(it) }
    }

    private fun updateModeIndicator(mode: ExecutionMode) {
        val modeText = when (mode) {
            ExecutionMode.Root -> getString(R.string.mode_root) + " ✓"
            ExecutionMode.Shizuku -> getString(R.string.mode_shizuku) + " ✓"
            ExecutionMode.None -> getString(R.string.mode_view_only)
        }
        binding.tvCurrentMode.text = modeText
    }

    private fun updateCpuCard(cpu: CpuInfo) {
        val usagePercent = cpu.usagePercent.toInt()
        binding.tvCpuUsage.text = getString(R.string.dashboard_percent_format, usagePercent)
        binding.progressCpu.progress = usagePercent
        
        // Add data point to graph
        addGraphDataPoint(cpu.usagePercent)
        
        // Update temperature
        cpu.temperature?.let { temp ->
            binding.tvCpuTemp.text = getString(R.string.dashboard_temp_format, temp)
            binding.tvCpuTemp.visibility = View.VISIBLE
        } ?: run {
            binding.tvCpuTemp.text = getString(R.string.status_not_available)
            binding.tvCpuTemp.visibility = View.VISIBLE
        }
        
        // Update core count
        binding.tvCpuCores.text = getString(R.string.dashboard_cpu_cores, cpu.cores)
        
        // Update core frequencies
        coreFrequencyAdapter.updateFrequencies(cpu.coreFrequencies)
    }
    
    /**
     * Add a data point to the CPU graph.
     */
    private fun addGraphDataPoint(value: Float) {
        graphData.add(value.coerceIn(0f, 100f))
        
        // Trim to max data points (60)
        while (graphData.size > CpuGraphView.MAX_DATA_POINTS) {
            graphData.removeAt(0)
        }
        
        // Update graph view
        binding.cpuGraph.setData(graphData)
    }

    private fun updateBatteryCard(battery: BatteryInfo) {
        binding.tvBatteryPercent.text = getString(R.string.dashboard_percent_format, battery.percent)
        
        // Update temperature
        binding.tvBatteryTemp.text = getString(R.string.dashboard_temp_format, battery.temperature)
        
        // Update charging/discharging status
        if (battery.isCharging) {
            binding.tvBatteryStatus.text = getString(R.string.dashboard_charging)
            binding.tvBatteryStatus.setTextColor(requireContext().getColor(R.color.status_positive))
        } else {
            binding.tvBatteryStatus.text = getString(R.string.dashboard_discharging)
            binding.tvBatteryStatus.setTextColor(requireContext().getColor(R.color.on_surface_secondary))
        }
        
        // Update battery icon color based on level
        val iconTint = when {
            battery.percent <= 20 -> R.color.status_negative
            battery.isCharging -> R.color.status_positive
            else -> R.color.status_positive
        }
        binding.ivBatteryIcon.setColorFilter(requireContext().getColor(iconTint))
    }

    private fun updateNetworkCard(network: NetworkInfo) {
        // Update network type
        val networkTypeText = when (network.type) {
            NetworkType.WIFI -> "Wi-Fi"
            NetworkType.MOBILE -> "Mobile"
            NetworkType.ETHERNET -> "Ethernet"
            NetworkType.NONE -> getString(R.string.dashboard_network_disconnected)
        }
        binding.tvNetworkType.text = networkTypeText
        
        // Update network details
        if (network.isConnected) {
            val details = buildString {
                network.signalPercent?.let { append("$it%") }
                network.signalDbm?.let { 
                    if (isNotEmpty()) append(" ")
                    append("${it}dBm")
                }
            }
            binding.tvNetworkDetails.text = details.ifEmpty { network.ssid ?: "" }
            binding.tvNetworkDetails.visibility = if (details.isNotEmpty() || network.ssid != null) View.VISIBLE else View.GONE
            
            // Update icon color based on connection
            binding.ivNetworkIcon.setColorFilter(requireContext().getColor(R.color.status_positive))
        } else {
            binding.tvNetworkDetails.text = ""
            binding.tvNetworkDetails.visibility = View.GONE
            binding.ivNetworkIcon.setColorFilter(requireContext().getColor(R.color.on_surface_secondary))
        }
    }

    private fun updateRamCard(ram: RamInfo) {
        val percent = ram.usedPercent.toInt()
        
        // Update circular progress
        binding.progressRam.progress = percent
        
        // Update percentage text in center
        binding.tvRamPercent.text = getString(R.string.dashboard_percent_format, percent)
        
        // Update used and total text
        binding.tvRamUsed.text = getString(R.string.dashboard_used_format, formatSizeDetailed(ram.usedBytes))
        binding.tvRamDetail.text = getString(R.string.dashboard_total_format, formatSizeDetailed(ram.totalBytes))
    }

    private fun updateStorageCard(storage: StorageInfo) {
        val percent = storage.usedPercent.toInt()
        
        // Update circular progress
        binding.progressStorage.progress = percent
        
        // Update percentage text in center
        binding.tvStoragePercent.text = getString(R.string.dashboard_percent_format, percent)
        
        // Update used and total text
        binding.tvStorageUsed.text = getString(R.string.dashboard_used_format, formatSizeDetailed(storage.usedBytes))
        binding.tvStorageDetail.text = getString(R.string.dashboard_total_format, formatSizeDetailed(storage.totalBytes))
    }

    private fun updateDisplayCard(display: DisplayInfo) {
        binding.tvDisplayResolution.text = display.resolution
        binding.tvDisplayRefresh.text = getString(R.string.dashboard_hz_format, display.refreshRate)
    }

    private fun updateAppsCard(counts: AppCounts) {
        // Display total count prominently (just the number)
        binding.tvAppsTotal.text = counts.total.toString()
        
        // Display breakdown in "X User | Y System" format
        binding.tvAppsBreakdown.text = getString(
            R.string.dashboard_apps_count,
            counts.userApps,
            counts.systemApps
        )
    }

    // ==================== Utility Functions ====================
    
    private fun formatSizeDetailed(bytes: Long): String {
        val gb = bytes / (1024.0 * 1024.0 * 1024.0)
        return if (gb >= 1) {
            String.format("%.2f GB", gb)
        } else {
            val mb = bytes / (1024.0 * 1024.0)
            String.format("%.0f MB", mb)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    /**
     * Adapter for displaying core frequencies in a grid.
     */
    private inner class CoreFrequencyAdapter : RecyclerView.Adapter<CoreFrequencyAdapter.ViewHolder>() {
        
        private var frequencies: List<Long> = emptyList()
        
        fun updateFrequencies(newFrequencies: List<Long>) {
            frequencies = newFrequencies
            notifyDataSetChanged()
        }
        
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_core_frequency, parent, false)
            return ViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val frequency = frequencies.getOrNull(position) ?: 0L
            holder.bind(position, frequency)
        }
        
        override fun getItemCount(): Int = frequencies.size
        
        inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val tvCoreLabel: TextView = itemView.findViewById(R.id.tvCoreLabel)
            private val tvCoreFrequency: TextView = itemView.findViewById(R.id.tvCoreFrequency)
            
            fun bind(coreIndex: Int, frequencyMhz: Long) {
                tvCoreLabel.text = getString(R.string.dashboard_core_label, coreIndex)
                tvCoreFrequency.text = getString(R.string.dashboard_core_frequency_mhz, frequencyMhz)
            }
        }
    }
}
