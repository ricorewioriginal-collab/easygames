package de.ricorewi.easygames

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.format.Formatter
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.ServiceWorkerClient
import android.webkit.ServiceWorkerController
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import de.ricorewi.easygames.core.NativeHtml
import android.widget.Button
import android.widget.ImageView
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Einzige Activity: Vollbild-WebView für die Spiele-Oberfläche plus ein schlichter nativer
 * Erststart-Bildschirm (nur sichtbar, solange noch gar kein Inhalt vorhanden ist).
 * Alles hier läuft auf dem Hauptthread; Dateizugriffe und Netz passieren im Koordinator/Engine auf Hintergrundthreads.
 */
class MainActivity : Activity(), ContentWebViewClient.Callbacks, WebBridge.Host {

    private lateinit var coordinator: SyncCoordinator
    private lateinit var root: FrameLayout
    private var webView: WebView? = null

    // Erststart-Overlay
    private lateinit var overlay: LinearLayout
    private lateinit var statusView: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var retryButton: Button
    private lateinit var settingsButton: Button

    // Start-Splash (Logo auf dunklem Grund): liegt über allem, bis die erste Seite steht (mindestens kurz, höchstens ~2 s)
    private var splashView: View? = null
    private var splashSince = 0L

    private var contentStarted = false      // Start-URL wurde geladen
    private var pageLoaded = false          // Seite fertig geladen (JS-Events erlaubt)
    private var clearHistoryPending = false
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var pendingPermission: PermissionRequest? = null
    private var pendingResources: List<String> = emptyList()

    private val stateListener: () -> Unit = { runOnUiThread { onSyncStateChanged() } }

    // ---------------------------------------------------------------- Lebenszyklus

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        coordinator = (application as EasyGamesApplication).coordinator

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val lp = window.attributes
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            window.attributes = lp
        }

        root = FrameLayout(this)
        root.setBackgroundColor(getColor(R.color.bg))
        setContentView(root)
        buildOverlay()
        applyImmersive()
        createWebView()
        showSplash()

        coordinator.addListener(stateListener)
        updateOverlay()
        // Fertig geladenen Stand aktivieren (Datei-Operationen -> Hintergrund), dann Inhalt starten.
        coordinator.runInBackground {
            coordinator.commitPendingIfAny()
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    startContentIfPossible()
                    coordinator.onAppStart()
                }
            }
        }
    }

    private fun showSplash() {
        val v = ImageView(this)
        v.setBackgroundColor(getColor(R.color.bg))
        v.setImageResource(R.drawable.splash_logo)
        v.scaleType = ImageView.ScaleType.FIT_CENTER
        v.setPadding(48, 48, 48, 48)
        v.isClickable = true            // fängt Berührungen ab, solange sichtbar
        root.addView(v, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        splashView = v
        splashSince = android.os.SystemClock.uptimeMillis()
        v.postDelayed({ dismissSplash() }, 2000)
    }

    private fun dismissSplash() {
        val v = splashView ?: return
        splashView = null
        val wait = (600 - (android.os.SystemClock.uptimeMillis() - splashSince)).coerceAtLeast(0)
        v.postDelayed({
            v.animate().alpha(0f).setDuration(250).withEndAction { (v.parent as? ViewGroup)?.removeView(v) }.start()
        }, wait)
    }

    override fun onStart() {
        super.onStart()
        coordinator.startNetworkWatch()
    }

    override fun onStop() {
        coordinator.stopNetworkWatch()
        super.onStop()
    }

    override fun onResume() {
        super.onResume()
        webView?.onResume()
        webView?.resumeTimers()
    }

    override fun onPause() {
        webView?.onPause()
        webView?.pauseTimers()          // spart Akku, solange die App nicht im Vordergrund ist
        super.onPause()
    }

    override fun onDestroy() {
        coordinator.removeListener(stateListener)
        pendingPermission?.deny()
        pendingPermission = null
        if (webView != null) ServiceWorkerController.getInstance().setServiceWorkerClient(null)
        hideCustomView()
        destroyWebView()
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) applyImmersive()
    }

    /** Zurück: erst HTML5-Vollbild beenden, dann WebView-Verlauf (Web-UI schließt damit ein Spiel), sonst beenden. */
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (customView != null) {
            hideCustomView()
            return
        }
        val wv = webView
        if (contentStarted && wv != null && wv.canGoBack()) {
            wv.goBack()
            return
        }
        super.onBackPressed()
    }

    private fun applyImmersive() {
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        controller.hide(WindowInsetsCompat.Type.systemBars())
    }

    // ---------------------------------------------------------------- WebView

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView() {
        val wv = try {
            WebView(this)
        } catch (e: RuntimeException) {          // z. B. WebView-Komponente fehlt/deaktiviert
            Log.e(TAG, "WebView nicht verfügbar", e)
            statusView.text = getString(R.string.boot_no_webview)
            progressBar.visibility = View.GONE
            overlay.visibility = View.VISIBLE
            return
        }
        wv.setBackgroundColor(getColor(R.color.bg))
        // Ensure GPU-backed layers for Three.js/WebGL games (Mimori, 3D worlds).
        // JavaScript and DOM storage were already enabled below.
        wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        wv.isFocusable = true
        wv.isFocusableInTouchMode = true
        wv.overScrollMode = View.OVER_SCROLL_NEVER

        val s = wv.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.allowFileAccess = false
        s.allowContentAccess = false
        s.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) s.safeBrowsingEnabled = true
        s.setSupportMultipleWindows(false)
        s.javaScriptCanOpenWindowsAutomatically = false
        s.setGeolocationEnabled(false)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        val client = ContentWebViewClient(coordinator.store, this)
        wv.webViewClient = client
        ServiceWorkerController.getInstance().setServiceWorkerClient(object : ServiceWorkerClient() {
            override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? = client.intercept(request)
        })
        wv.webChromeClient = GameChromeClient()
        wv.addJavascriptInterface(WebBridge(this, coordinator), "EasyGamesApp")

        root.addView(wv, 0, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        webView = wv
        wv.requestFocus()
    }

    private fun destroyWebView() {
        val wv = webView ?: return
        webView = null
        pageLoaded = false
        wv.stopLoading()
        (wv.parent as? ViewGroup)?.removeView(wv)
        wv.removeAllViews()
        wv.destroy()
    }

    private fun startContentIfPossible() {
        if (contentStarted) return
        val wv = webView ?: return
        if (coordinator.store.activeManifest == null) return
        contentStarted = true
        pageLoaded = false
        overlay.visibility = View.GONE
        loadPreparedContent(wv)
    }

    private fun loadPreparedContent(wv: WebView) {
        wv.clearCache(true)
        wv.loadDataWithBaseURL(Origin.PREPARE_URL, NativeHtml.bootstrap(Origin.START_URL), "text/html", "utf-8", Origin.PREPARE_URL)
    }

    private fun dispatchStateEvent() {
        if (!pageLoaded) return
        webView?.evaluateJavascript("window.dispatchEvent(new Event('easygames:app-state'))", null)
    }

    private fun onSyncStateChanged() {
        if (isFinishing || isDestroyed) return
        startContentIfPossible()
        updateOverlay()
        dispatchStateEvent()
    }

    // ---------------------------------------------------------------- ContentWebViewClient.Callbacks

    override fun onPageStarted() {
        pageLoaded = false
    }

    override fun onPageFinished(url: String?) {
        if (url == Origin.PREPARE_URL) return
        pageLoaded = true
        dismissSplash()
        if (clearHistoryPending) {
            clearHistoryPending = false
            webView?.clearHistory()
        }
    }

    override fun onRendererGone(view: WebView) {
        if (view !== webView) return
        Log.w(TAG, "Renderer-Prozess beendet – WebView wird neu aufgebaut")
        hideCustomView()
        destroyWebView()
        createWebView()
        if (contentStarted) {
            pageLoaded = false
            webView?.let { loadPreparedContent(it) }
        }
    }

    override fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, R.string.toast_no_browser, Toast.LENGTH_SHORT).show()
        }
    }

    // ---------------------------------------------------------------- WebBridge.Host (Aufruf aus JS-Thread)

    override fun reloadContent() {
        coordinator.runInBackground {
            coordinator.commitPendingIfAny()
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    clearHistoryPending = true
                    pageLoaded = false
                    webView?.let { loadPreparedContent(it) }
                }
            }
        }
    }

    override fun showSettings() {
        runOnUiThread { SettingsDialog.show(this, coordinator) }
    }

    // ---------------------------------------------------------------- Chrome-Client (Vollbild, Berechtigungen)

    private inner class GameChromeClient : WebChromeClient() {

        override fun onShowCustomView(view: View?, callback: WebChromeClient.CustomViewCallback?) {
            if (view == null || customView != null) {
                callback?.onCustomViewHidden()
                return
            }
            customView = view
            customViewCallback = callback
            webView?.visibility = View.INVISIBLE
            root.addView(view, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
            applyImmersive()
        }

        override fun onHideCustomView() {
            hideCustomView()
        }

        override fun onPermissionRequest(request: PermissionRequest?) {
            val req = request ?: return
            runOnUiThread { handlePermissionRequest(req) }
        }

        override fun onPermissionRequestCanceled(request: PermissionRequest?) {
            if (request != null && request === pendingPermission) pendingPermission = null
        }

        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            if (BuildConfig.DEBUG && consoleMessage != null) {
                Log.d(TAG_WEB, "${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})")
            }
            return true      // nichts weiter ausgeben (Release: komplett still)
        }
    }

    private fun hideCustomView() {
        val v = customView ?: return
        customView = null
        root.removeView(v)
        webView?.visibility = View.VISIBLE
        customViewCallback?.onCustomViewHidden()
        customViewCallback = null
    }

    /** Mikrofon/Kamera nur für unseren Ursprung; erst Android-Berechtigung erfragen, dann an die Seite weitergeben. */
    private fun handlePermissionRequest(req: PermissionRequest) {
        if (!Origin.isOwn(req.origin)) {
            req.deny()
            return
        }
        val wanted = ArrayList<String>()
        val androidPermissions = ArrayList<String>()
        for (r in req.resources) {
            when (r) {
                PermissionRequest.RESOURCE_AUDIO_CAPTURE -> {
                    wanted.add(r)
                    if (!hasPermission(Manifest.permission.RECORD_AUDIO)) androidPermissions.add(Manifest.permission.RECORD_AUDIO)
                }
                PermissionRequest.RESOURCE_VIDEO_CAPTURE -> {
                    wanted.add(r)
                    if (!hasPermission(Manifest.permission.CAMERA)) androidPermissions.add(Manifest.permission.CAMERA)
                }
            }
        }
        if (wanted.isEmpty()) {
            req.deny()
            return
        }
        if (androidPermissions.isEmpty()) {
            req.grant(wanted.toTypedArray())
            return
        }
        pendingPermission?.deny()
        pendingPermission = req
        pendingResources = wanted
        requestPermissions(androidPermissions.toTypedArray(), REQUEST_MEDIA)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != REQUEST_MEDIA) return
        val req = pendingPermission ?: return
        pendingPermission = null
        val allowed = pendingResources.filter { r ->
            when (r) {
                PermissionRequest.RESOURCE_AUDIO_CAPTURE -> hasPermission(Manifest.permission.RECORD_AUDIO)
                PermissionRequest.RESOURCE_VIDEO_CAPTURE -> hasPermission(Manifest.permission.CAMERA)
                else -> false
            }
        }
        if (allowed.isEmpty()) req.deny() else req.grant(allowed.toTypedArray())
    }

    private fun hasPermission(permission: String): Boolean =
        checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED

    // ---------------------------------------------------------------- Erststart-Overlay

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

    private fun buildOverlay() {
        overlay = LinearLayout(this)
        overlay.orientation = LinearLayout.VERTICAL
        overlay.gravity = Gravity.CENTER
        overlay.setBackgroundColor(getColor(R.color.bg))
        overlay.setPadding(dp(32), dp(32), dp(32), dp(32))
        overlay.isClickable = true      // Touch-Ereignisse nicht an die WebView darunter durchreichen

        val title = TextView(this)
        title.text = getString(R.string.app_name)
        title.textSize = 32f
        title.setTextColor(getColor(R.color.text))
        title.gravity = Gravity.CENTER

        statusView = TextView(this)
        statusView.text = getString(R.string.boot_starting)
        statusView.textSize = 16f
        statusView.setTextColor(getColor(R.color.text_dim))
        statusView.gravity = Gravity.CENTER
        statusView.setPadding(0, dp(16), 0, dp(16))

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal)
        progressBar.max = PROGRESS_MAX
        progressBar.isIndeterminate = true

        retryButton = Button(this)
        retryButton.text = getString(R.string.boot_retry)
        retryButton.setOnClickListener { coordinator.requestSync(SyncCoordinator.Trigger.MANUAL) }

        settingsButton = Button(this)
        settingsButton.text = getString(R.string.boot_settings)
        settingsButton.setOnClickListener { SettingsDialog.show(this, coordinator) }

        val wrap = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        val bar = LinearLayout.LayoutParams(dp(320), ViewGroup.LayoutParams.WRAP_CONTENT)
        overlay.addView(title, wrap)
        overlay.addView(statusView, wrap)
        overlay.addView(progressBar, bar)
        overlay.addView(retryButton, wrap)
        overlay.addView(settingsButton, wrap)
        root.addView(overlay, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }

    /** Zeigt den Erststart-Fortschritt, solange kein Inhalt vorhanden ist; sonst ausgeblendet. */
    private fun updateOverlay() {
        if (coordinator.store.activeManifest != null) {
            overlay.visibility = View.GONE
            return
        }
        val s = coordinator.snapshot()
        overlay.visibility = View.VISIBLE
        val showRetry = s.state == SyncCoordinator.State.OFFLINE || s.state == SyncCoordinator.State.ERROR
        retryButton.visibility = if (showRetry) View.VISIBLE else View.GONE
        settingsButton.visibility = if (showRetry) View.VISIBLE else View.GONE
        when (s.state) {
            SyncCoordinator.State.DOWNLOADING -> {
                progressBar.visibility = View.VISIBLE
                progressBar.isIndeterminate = s.bytesTotal <= 0
                progressBar.progress = (s.progress * PROGRESS_MAX).toInt()
                val sizes = getString(
                    R.string.boot_progress,
                    Formatter.formatShortFileSize(this, s.bytesDone),
                    Formatter.formatShortFileSize(this, s.bytesTotal)
                )
                statusView.text = getString(R.string.boot_downloading) + "\n" + sizes
            }
            SyncCoordinator.State.CHECKING -> {
                progressBar.visibility = View.VISIBLE
                progressBar.isIndeterminate = true
                statusView.text = getString(R.string.boot_checking)
            }
            SyncCoordinator.State.OFFLINE -> {
                progressBar.visibility = View.GONE
                statusView.text = s.error ?: getString(R.string.boot_offline)
            }
            SyncCoordinator.State.ERROR -> {
                progressBar.visibility = View.GONE
                statusView.text = getString(R.string.boot_error, s.error ?: "")
            }
            else -> {
                progressBar.visibility = View.VISIBLE
                progressBar.isIndeterminate = true
                statusView.text = getString(R.string.boot_starting)
            }
        }
        if (showRetry) retryButton.requestFocus()
    }

    private companion object {
        const val TAG = "EasyGames"
        const val TAG_WEB = "EasyGamesWeb"
        const val REQUEST_MEDIA = 4711
        const val PROGRESS_MAX = 1000
    }
}
