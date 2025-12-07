package com.appcontrolx.model

sealed class ExecutionMode {
    object Root : ExecutionMode()
    object Shizuku : ExecutionMode()
    object None : ExecutionMode()
    
    fun displayName(): String = when (this) {
        is Root -> "Root Mode"
        is Shizuku -> "Shizuku Mode"
        is None -> "View-Only Mode"
    }
}
