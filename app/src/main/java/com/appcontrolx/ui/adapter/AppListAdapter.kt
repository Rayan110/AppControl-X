package com.appcontrolx.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.appcontrolx.databinding.ItemAppBinding
import com.appcontrolx.model.AppInfo

class AppListAdapter(
    private val onItemClick: (AppInfo) -> Unit
) : ListAdapter<AppInfo, AppListAdapter.AppViewHolder>(AppDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AppViewHolder {
        val binding = ItemAppBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return AppViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: AppViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    fun getSelectedApps(): List<AppInfo> = currentList.filter { it.isSelected }
    
    inner class AppViewHolder(
        private val binding: ItemAppBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(app: AppInfo) {
            binding.apply {
                ivAppIcon.setImageDrawable(app.icon)
                tvAppName.text = app.appName
                tvPackageName.text = app.packageName
                checkbox.isChecked = app.isSelected
                
                // Disabled state
                root.alpha = if (app.isEnabled) 1f else 0.5f
                
                checkbox.setOnCheckedChangeListener { _, isChecked ->
                    app.isSelected = isChecked
                }
                
                root.setOnClickListener {
                    checkbox.isChecked = !checkbox.isChecked
                    onItemClick(app)
                }
            }
        }
    }
    
    class AppDiffCallback : DiffUtil.ItemCallback<AppInfo>() {
        override fun areItemsTheSame(oldItem: AppInfo, newItem: AppInfo): Boolean {
            return oldItem.packageName == newItem.packageName
        }
        
        override fun areContentsTheSame(oldItem: AppInfo, newItem: AppInfo): Boolean {
            return oldItem == newItem
        }
    }
}
