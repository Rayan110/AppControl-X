package com.appcontrolx.ui

import android.annotation.SuppressLint
import android.graphics.Color
import android.net.http.SslError
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.SslErrorHandler
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
        // Create an AssetLoader with custom MIME type handling
        // This ensures .js files are always served as application/javascript
        val originalHandler = AssetsPathHandler(this)
        val mimeTypeHandler = object : WebViewAssetLoader.PathHandler {
            override fun handle(path: String): WebResourceResponse? {
                val response = originalHandler.handle(path) ?: return null

                // Force correct MIME types
                if (path.endsWith(".js")) {
                    response.mimeType = "application/javascript"
                } else if (path.endsWith(".css")) {
                    response.mimeType = "text/css"
                }
                return response
            }
        }

        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", mimeTypeHandler)
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
                    return assetLoader.shouldInterceptRequest(request.url)
                }

                override fun onReceivedSslError(
                    view: WebView?,
                    handler: SslErrorHandler?,
                    error: SslError?
                ) {
                    Log.e("WebViewSsl", "SSL Error: $error")
                    super.onReceivedSslError(view, handler, error)
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

                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    Log.d("WebViewConsole", "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                    return true
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
