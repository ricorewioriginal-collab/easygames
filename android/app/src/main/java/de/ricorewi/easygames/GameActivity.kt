package de.ricorewi.easygames

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.PermissionRequest
import android.webkit.ServiceWorkerClient
import android.webkit.ServiceWorkerController
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Ein Spiel (oder eine easygames-Seite wie Konto, Profil, Ranglisten) im Vollbild. Inhalte kommen lokal aus der Bibliothek
 * unter https://appassets.androidplatform.net/easygames/ – gleiche Adresse für alle Spiele, damit Spielstände und Anmeldung
 * geteilt bleiben. Online und Mehrspieler laufen wie überall über easygames (cloud/fire-peer.js, Einladungen auf die
 * easygames-Homepage). „← Alle Spiele“ und Zurück führen in die App. Spielzeit wird gezählt.
 */
class GameActivity : Activity(), ContentWebViewClient.Callbacks, WebBridge.Host {

    private lateinit var repo: Repo
    private lateinit var root: FrameLayout
    private var webView: WebView? = null
    private var gameId: String? = null
    private var isGame = false
    private var resumedAt = 0L
    private var played = 0L
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var pendingPermission: PermissionRequest? = null
    private var pendingResources: List<String> = emptyList()
    private var notifyDenied = false

    private val ttsLazy = lazy {
        AppTts(this) { id, kind ->
            val sid = id.filter { it.isLetterOrDigit() || it == '_' }
            runOnUiThread { webView?.evaluateJavascript("window.__egTts&&window.__egTts('$sid','$kind')", null) }
        }
    }
    private val tts by ttsLazy

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        repo = EasyGamesApplication.repo(this)
        val url = intent.getStringExtra(EXTRA_URL)
        if (url == null || !Origin.isOwn(Uri.parse(url))) { finish(); return }
        gameId = intent.getStringExtra(EXTRA_GAME)
        isGame = gameId != null
        gameId?.let { repo.gameStarted(it) }

        window.addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED)
        if (isGame) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes = window.attributes.apply { layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES }
        }
        root = FrameLayout(this)
        root.setBackgroundColor(getColor(R.color.bg))
        setContentView(root)
        applyImmersive()
        createWebView()?.loadUrl(url)
    }

    override fun onResume() {
        super.onResume()
        resumedAt = SystemClock.elapsedRealtime()
        webView?.onResume()
    }

    override fun onPause() {
        if (resumedAt > 0) played += SystemClock.elapsedRealtime() - resumedAt
        resumedAt = 0
        webView?.onPause()
        if (ttsLazy.isInitialized()) tts.stop()
        super.onPause()
    }

    override fun onDestroy() {
        gameId?.let { repo.gameEnded(it, played / 1000) }
        if (webView != null) ServiceWorkerController.getInstance().setServiceWorkerClient(null)
        hideCustomView()
        destroyWebView()
        if (ttsLazy.isInitialized()) tts.shutdown()
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) applyImmersive()
    }

    /** Zurück: erst HTML5-Vollbild beenden, dann Verlauf der Seite, sonst zurück in die App. */
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        if (customView != null) { hideCustomView(); return }
        val wv = webView
        if (wv != null && wv.canGoBack()) { wv.goBack(); return }
        super.onBackPressed()
    }

    private fun applyImmersive() {
        val c = WindowInsetsControllerCompat(window, window.decorView)
        c.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        if (isGame) c.hide(WindowInsetsCompat.Type.systemBars()) else c.show(WindowInsetsCompat.Type.systemBars())
    }

    // ---------------------------------------------------------------- WebView

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(): WebView? {
        val wv = try { WebView(this) } catch (e: RuntimeException) {
            Log.e(TAG, "WebView nicht verfügbar", e)
            Toast.makeText(this, R.string.no_webview, Toast.LENGTH_LONG).show()
            finish()
            return null
        }
        wv.setBackgroundColor(getColor(R.color.bg))
        wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)    // GPU für WebGL/Three.js
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

        val client = ContentWebViewClient(repo.library, this)
        wv.webViewClient = client
        ServiceWorkerController.getInstance().setServiceWorkerClient(object : ServiceWorkerClient() {
            override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? = client.intercept(request)
        })
        wv.webChromeClient = ChromeClient()
        wv.addJavascriptInterface(WebBridge(this, repo) { tts }, "EasyGamesApp")
        root.addView(wv, 0, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        webView = wv
        wv.requestFocus()
        return wv
    }

    private fun destroyWebView() {
        val wv = webView ?: return
        webView = null
        wv.stopLoading()
        (wv.parent as? ViewGroup)?.removeView(wv)
        wv.removeAllViews()
        wv.destroy()
    }

    // ---------------------------------------------------------------- ContentWebViewClient.Callbacks

    override fun onPageFinished(url: String?) {}

    override fun onRendererGone(view: WebView) {
        if (view !== webView) return
        val url = view.url
        hideCustomView()
        destroyWebView()
        createWebView()?.loadUrl(url ?: intent.getStringExtra(EXTRA_URL)!!)
    }

    override fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, R.string.toast_no_browser, Toast.LENGTH_SHORT).show()
        }
    }

    override fun backToApp() = finish()

    override fun openGame(folder: String, uri: Uri) {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(Origin.PUBLIC + Origin.relPath(uri).orEmpty()), this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))
        finish()
    }

    // ---------------------------------------------------------------- WebBridge.Host

    override fun reloadContent() { runOnUiThread { webView?.reload() } }

    override fun showSettings() {
        runOnUiThread {
            startActivity(Intent(this, MainActivity::class.java).putExtra(MainActivity.EXTRA_TAB, MainActivity.EXTRA_TAB_MORE)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP))
        }
    }

    private fun notificationsAllowed(): Boolean =
        (Build.VERSION.SDK_INT < 33 || hasPermission(Manifest.permission.POST_NOTIFICATIONS)) &&
            getSystemService(NotificationManager::class.java).areNotificationsEnabled()

    override fun notificationState(): String = if (notificationsAllowed()) "granted" else if (notifyDenied) "denied" else "default"

    override fun requestNotifications() {
        runOnUiThread {
            if (isFinishing || isDestroyed) return@runOnUiThread
            if (Build.VERSION.SDK_INT >= 33 && !hasPermission(Manifest.permission.POST_NOTIFICATIONS)) {
                requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_NOTIFY)
            } else reportNotificationState()
        }
    }

    private fun reportNotificationState() {
        notifyDenied = !notificationsAllowed()
        webView?.evaluateJavascript("window.__egNotifyDone&&window.__egNotifyDone('${notificationState()}')", null)
    }

    override fun showNotification(title: String, body: String, tag: String) {
        if (!notificationsAllowed()) return
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(this, EasyGamesApplication.CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_stat_easygames)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(open)
            .build()
        getSystemService(NotificationManager::class.java).notify(tag.ifEmpty { null }, 1, n)   // gleicher Tag ersetzt die vorige Meldung
    }

    // ---------------------------------------------------------------- Chrome-Client (Vollbild, Kamera/Mikrofon)

    private inner class ChromeClient : WebChromeClient() {
        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
            if (view == null || customView != null) { callback?.onCustomViewHidden(); return }
            customView = view
            customViewCallback = callback
            webView?.visibility = View.INVISIBLE
            root.addView(view, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
            WindowInsetsControllerCompat(window, window.decorView).hide(WindowInsetsCompat.Type.systemBars())
        }

        override fun onHideCustomView() = hideCustomView()

        override fun onPermissionRequest(request: PermissionRequest?) {
            val req = request ?: return
            runOnUiThread { handlePermissionRequest(req) }
        }

        override fun onPermissionRequestCanceled(request: PermissionRequest?) {
            if (request != null && request === pendingPermission) pendingPermission = null
        }

        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            if (BuildConfig.DEBUG && consoleMessage != null) Log.d(TAG, "${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})")
            return true
        }
    }

    private fun hideCustomView() {
        val v = customView ?: return
        customView = null
        root.removeView(v)
        webView?.visibility = View.VISIBLE
        customViewCallback?.onCustomViewHidden()
        customViewCallback = null
        applyImmersive()
    }

    /** Mikrofon/Kamera nur für unseren Ursprung; erst Android-Berechtigung erfragen, dann an die Seite weitergeben. */
    private fun handlePermissionRequest(req: PermissionRequest) {
        if (!Origin.isOwn(req.origin)) { req.deny(); return }
        val wanted = ArrayList<String>()
        val android = ArrayList<String>()
        for (r in req.resources) when (r) {
            PermissionRequest.RESOURCE_AUDIO_CAPTURE -> { wanted += r; if (!hasPermission(Manifest.permission.RECORD_AUDIO)) android += Manifest.permission.RECORD_AUDIO }
            PermissionRequest.RESOURCE_VIDEO_CAPTURE -> { wanted += r; if (!hasPermission(Manifest.permission.CAMERA)) android += Manifest.permission.CAMERA }
        }
        if (wanted.isEmpty()) { req.deny(); return }
        if (android.isEmpty()) { req.grant(wanted.toTypedArray()); return }
        pendingPermission?.deny()
        pendingPermission = req
        pendingResources = wanted
        requestPermissions(android.toTypedArray(), REQUEST_MEDIA)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_NOTIFY) { reportNotificationState(); return }
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

    private fun hasPermission(p: String) = checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    companion object {
        private const val TAG = "EasyGamesGame"
        private const val REQUEST_MEDIA = 41
        private const val REQUEST_NOTIFY = 42
        const val EXTRA_URL = "url"
        const val EXTRA_GAME = "game"

        /** Spiel starten (lokal, installiert). [rel] = Pfad im Inhalt samt Query/Hash, Standard: Startseite des Spiels. */
        fun startGame(ctx: Context, gameId: String, rel: String) =
            ctx.startActivity(Intent(ctx, GameActivity::class.java).putExtra(EXTRA_URL, Origin.ROOT + rel).putExtra(EXTRA_GAME, gameId))

        /** easygames-Seite (Konto, Profil, Ranglisten …) öffnen. */
        fun startPage(ctx: Context, rel: String) =
            ctx.startActivity(Intent(ctx, GameActivity::class.java).putExtra(EXTRA_URL, Origin.ROOT + rel))
    }
}
