package com.appcontrolx.model

import android.graphics.drawable.Drawable

data class AppInfo(
    val packageName: String,
    val appName: String,
    val icon: Drawable?,
    val isSystemApp: Boolean,
    val isEnabled: Boolean,
    var isSelected: Boolean = false
)
