package com.appcontrolx.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.appcontrolx.databinding.ItemActivityBinding
import com.appcontrolx.ui.ActivityLauncherBottomSheet.ActivityItem

class ActivityListAdapter(
    private val onItemClick: (ActivityItem) -> Unit
) : ListAdapter<ActivityItem, ActivityListAdapter.ViewHolder>(DiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemActivityBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    inner class ViewHolder(
        private val binding: ItemActivityBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(item: ActivityItem) {
            binding.tvAppName.text = item.appName
            binding.tvActivityName.text = item.activityName.substringAfterLast(".")
            binding.tvFullName.text = item.activityName
            
            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }
    
    class DiffCallback : DiffUtil.ItemCallback<ActivityItem>() {
        override fun areItemsTheSame(oldItem: ActivityItem, newItem: ActivityItem): Boolean {
            return oldItem.activityName == newItem.activityName
        }
        
        override fun areContentsTheSame(oldItem: ActivityItem, newItem: ActivityItem): Boolean {
            return oldItem == newItem
        }
    }
}
