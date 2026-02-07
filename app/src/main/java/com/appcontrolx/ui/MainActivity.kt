package com.appcontrolx.ui

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import com.appcontrolx.bridge.NativeBridge
import com.appcontrolx.databinding.ActivityMainBinding
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    @Inject
    lateinit var nativeBridge: NativeBridge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        setupBackHandler()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Create an AssetLoader to load assets from a virtual domain
        // This avoids file:// protocol issues and CORS problems
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", AssetsPathHandler(this))
            .build()

        binding.webView.apply {
            setBackgroundColor(Color.TRANSPARENT)

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true

                // Security: Disable direct file access as we are using AssetLoader
                allowFileAccess = false
                allowContentAccess = false

                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                useWideViewPort = true
                loadWithOverviewMode = true
                mediaPlaybackRequiresUserGesture = false
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest
                ): WebResourceResponse? {
                    // Intercept requests and forward them to AssetLoader
                    return assetLoader.shouldInterceptRequest(request.url)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    if (newProgress < 100) {
                        binding.progressBar.visibility = View.VISIBLE
                    }
                }
            }

            addJavascriptInterface(nativeBridge, "NativeBridge")
            nativeBridge.setWebView(this)

            // Load the app from the virtual secure origin
            loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
        }
    }

    private fun setupBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    fun evaluateJavascript(script: String) {
        runOnUiThread {
            binding.webView.evaluateJavascript(script, null)
        }
    }

    override fun onDestroy() {
        nativeBridge.cleanup()
        binding.webView.apply {
            removeJavascriptInterface("NativeBridge")
            destroy()
        }
        super.onDestroy()
    }
}
