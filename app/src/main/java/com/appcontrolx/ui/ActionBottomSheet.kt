package com.appcontrolx.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.appcontrolx.R
import com.appcontrolx.databinding.BottomSheetActionsBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class ActionBottomSheet : BottomSheetDialogFragment() {
    
    private var _binding: BottomSheetActionsBinding? = null
    private val binding get() = _binding!!
    
    var onActionSelected: ((Action) -> Unit)? = null
    private var selectedAction: Action? = null
    private var selectedCount = 0
    
    enum class Action {
        FREEZE, UNFREEZE, UNINSTALL, FORCE_STOP,
        RESTRICT_BACKGROUND, ALLOW_BACKGROUND,
        CLEAR_CACHE, CLEAR_DATA
    }
    
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = BottomSheetActionsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        selectedCount = arguments?.getInt(ARG_SELECTED_COUNT, 0) ?: 0
        binding.tvTitle.text = getString(R.string.action_title, selectedCount)
        
        setupActionButtons()
        setupConfirmButtons()
    }
    
    private fun setupActionButtons() {
        binding.btnForceStop.setOnClickListener { showConfirmation(Action.FORCE_STOP) }
        binding.btnFreeze.setOnClickListener { showConfirmation(Action.FREEZE) }
        binding.btnUnfreeze.setOnClickListener { showConfirmation(Action.UNFREEZE) }
        binding.btnRestrictBg.setOnClickListener { showConfirmation(Action.RESTRICT_BACKGROUND) }
        binding.btnAllowBg.setOnClickListener { showConfirmation(Action.ALLOW_BACKGROUND) }
        binding.btnClearCache.setOnClickListener { showConfirmation(Action.CLEAR_CACHE) }
        binding.btnClearData.setOnClickListener { showConfirmation(Action.CLEAR_DATA) }
        binding.btnUninstall.setOnClickListener { showConfirmation(Action.UNINSTALL) }
    }
    
    private fun setupConfirmButtons() {
        binding.btnNo.setOnClickListener {
            // Go back to action selection
            binding.layoutConfirm.visibility = View.GONE
            binding.layoutActions.visibility = View.VISIBLE
            binding.tvTitle.text = getString(R.string.action_title, selectedCount)
            selectedAction = null
        }
        
        binding.btnYes.setOnClickListener {
            selectedAction?.let { action ->
                onActionSelected?.invoke(action)
                dismiss()
            }
        }
    }
    
    private fun showConfirmation(action: Action) {
        selectedAction = action
        
        val actionName = getActionDisplayName(action)
        binding.tvTitle.text = getString(R.string.confirm_title)
        binding.tvConfirmMessage.text = "You are about to $actionName on $selectedCount app(s).\n\nContinue?"
        
        binding.layoutActions.visibility = View.GONE
        binding.layoutConfirm.visibility = View.VISIBLE
    }
    
    private fun getActionDisplayName(action: Action): String {
        return when (action) {
            Action.FREEZE -> "Freeze"
            Action.UNFREEZE -> "Unfreeze"
            Action.UNINSTALL -> "Uninstall"
            Action.FORCE_STOP -> "Force Stop"
            Action.RESTRICT_BACKGROUND -> "Restrict Background"
            Action.ALLOW_BACKGROUND -> "Allow Background"
            Action.CLEAR_CACHE -> "Clear Cache"
            Action.CLEAR_DATA -> "Clear Data"
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    companion object {
        const val TAG = "ActionBottomSheet"
        private const val ARG_SELECTED_COUNT = "selected_count"
        
        fun newInstance(selectedCount: Int): ActionBottomSheet {
            return ActionBottomSheet().apply {
                arguments = Bundle().apply {
                    putInt(ARG_SELECTED_COUNT, selectedCount)
                }
            }
        }
    }
}
