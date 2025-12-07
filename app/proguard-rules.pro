# AppControlX ProGuard Rules

# Keep Shizuku
-keep class rikka.shizuku.** { *; }
-keep class moe.shizuku.** { *; }

# Keep libsu
-keep class com.topjohnwu.superuser.** { *; }

# Keep AIDL
-keep class com.appcontrolx.IShellService { *; }
-keep class com.appcontrolx.IShellService$* { *; }
