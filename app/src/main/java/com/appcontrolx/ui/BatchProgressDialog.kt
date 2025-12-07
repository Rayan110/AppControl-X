package com.appcontrolx.ui

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.appcontrolx.R
import com.appcontrolx.databinding.DialogBatchProgressBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class BatchProgressDialog : DialogFragment() {
    
    private var _binding: DialogBatchProgressBinding? = null
    private val binding get() = _binding
    
    private var totalCount = 0
    private var currentIndex = 0
    private var actionName = ""
    
    companion object {
        const val TAG = "BatchProgressDialog"
        
        fun newInstance(actionName: String, totalCount: Int): BatchProgressDialog {
            return BatchProgressDialog().apply {
                this.actionName = actionName
                this.totalCount = totalCount
            }
        }
    }
    
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        _binding = DialogBatchProgressBinding.inflate(layoutInflater)
        
        binding?.let { b ->
            b.tvAction.text = actionName.replace("_", " ")
            b.progressBar.max = totalCount
            b.progressBar.progress = 0
            b.tvProgress.text = getString(R.string.batch_progress, 0, totalCount)
            b.tvCurrentApp.text = getString(R.string.batch_preparing)
        }
        
        return MaterialAlertDialogBuilder(requireContext())
            .setView(_binding?.root)
            .setCancelable(false)
            .create()
    }
    
    fun updateProgress(appName: String, index: Int) {
        currentIndex = index
        binding?.let { b ->
            b.progressBar.progress = index
            b.tvProgress.text = getString(R.string.batch_progress, index, totalCount)
            b.tvCurrentApp.text = appName
        }
    }
    
    fun setCompleted(successCount: Int, failCount: Int) {
        binding?.let { b ->
            b.progressBar.progress = totalCount
            b.tvProgress.text = getString(R.string.batch_completed)
            b.tvCurrentApp.text = if (failCount == 0) {
                getString(R.string.batch_all_success, successCount)
            } else {
                getString(R.string.batch_partial_success, successCount, failCount)
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
