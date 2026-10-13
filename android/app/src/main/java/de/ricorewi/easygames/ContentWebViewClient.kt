package de.ricorewi.easygames

import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import de.ricorewi.easygames.core.ContentStore
import de.ricorewi.easygames.core.Mime
import java.io.ByteArrayInputStream

/** Der (künstliche) Ursprung, unter dem die lokalen Inhalte ausgeliefert werden. */
object Origin {
    const val HOST = "appassets.androidplatform.net"
    const val PATH_PREFIX = "/easygames/"
    const val START_URL = "https://$HOST${PATH_PREFIX}index.html"

    fun isOwn(uri: Uri): Boolean = uri.scheme == "https" && HOST.equals(uri.host, ignoreCase = true)
}

/**
 * Liefert die Inhalte aus dem lokalen Speicher aus, ersetzt CDN-Aufrufe durch lokale Dateien (Vendor-Map)
 * und leitet fremde Links in den System-Browser.
 */
class ContentWebViewClient(
    private val store: ContentStore,
    private val callbacks: Callbacks
) : WebViewClient() {

    interface Callbacks {
        fun onPageStarted()
        fun onPageFinished()

        /** Der Renderer-Prozess ist abgestürzt/beendet; die WebView muss neu aufgebaut werden. */
        fun onRendererGone(view: WebView)
        fun openExternal(uri: Uri)
    }

    // ---------------------------------------------------------------- Auslieferung

    override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
        val req = request ?: return null
        return try {
            intercept(req)
        } catch (e: Exception) {
            Log.w(TAG, "Auslieferung fehlgeschlagen: ${req.url}", e)
            if (Origin.isOwn(req.url)) status(500, "Internal Error") else null
        }
    }

    private fun intercept(req: WebResourceRequest): WebResourceResponse? {
        val uri = req.url
        val scheme = uri.scheme
        if (scheme != "https" && scheme != "http") return null
        val method = (req.method ?: "GET").uppercase()

        // (1) Unser Ursprung -> Inhaltsspeicher
        if (Origin.isOwn(uri)) {
            if (method == "OPTIONS") return status(204, "No Content")
            val path = uri.path ?: ""
            if (!path.startsWith(Origin.PATH_PREFIX)) return notFound()
            var rel = path.substring(Origin.PATH_PREFIX.length)      // Query und Hash sind nicht Teil von path
            if (rel.isEmpty() || rel.endsWith("/")) rel += "index.html"
            return serveFile(rel, method) ?: notFound()
        }

        // (2) Bekannte CDN-URL -> lokale Datei; sonst (3) normal ins Netz
        if (method != "GET" && method != "HEAD") return null
        val local = store.resolveVendor(uri.toString()) ?: return null
        return serveFile(local, method)
    }

    private fun serveFile(path: String, method: String): WebResourceResponse? {
        val content = store.open(path) ?: return null
        val data = if (method == "HEAD") {
            content.stream.close()
            ByteArrayInputStream(ByteArray(0))
        } else {
            content.stream
        }
        val encoding = if (Mime.isText(content.mime)) "utf-8" else null
        return WebResourceResponse(content.mime, encoding, 200, "OK", HEADERS, data)
    }

    private fun notFound() = status(404, "Not Found")

    private fun status(code: Int, reason: String) =
        WebResourceResponse("text/plain", "utf-8", code, reason, HEADERS, ByteArrayInputStream(ByteArray(0)))

    // ---------------------------------------------------------------- Navigation

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val req = request ?: return false
        if (!req.isForMainFrame) return false
        val uri = req.url
        if (Origin.isOwn(uri)) return false                       // bleibt in der WebView
        val scheme = uri.scheme?.lowercase()
        if (scheme == "http" || scheme == "https") callbacks.openExternal(uri)
        return true                                               // fremde Ziele nie in dieser WebView laden
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        callbacks.onPageStarted()
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        callbacks.onPageFinished()
    }

    override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
        if (view != null) callbacks.onRendererGone(view)
        return true                                               // behandelt -> App läuft weiter
    }

    private companion object {
        const val TAG = "EasyGamesWeb"
        val HEADERS: Map<String, String> = mapOf(
            "Access-Control-Allow-Origin" to "*",
            "Cache-Control" to "no-store"
        )
    }
}
