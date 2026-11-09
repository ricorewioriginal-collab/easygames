package de.ricorewi.easygames

import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import de.ricorewi.easygames.core.Library
import de.ricorewi.easygames.core.Mime
import de.ricorewi.easygames.core.NativeHtml
import java.io.ByteArrayInputStream
import java.io.FileInputStream

/**
 * Der (künstliche) Ursprung der lokalen Inhalte. Unverändert seit der ersten App-Version, damit Spielstände
 * (localStorage/IndexedDB) und Anmeldungen nach dem Update erhalten bleiben.
 */
object Origin {
    const val HOST = "appassets.androidplatform.net"
    const val PATH_PREFIX = "/easygames/"
    const val ROOT = "https://$HOST$PATH_PREFIX"

    /** Öffentliche easygames-Adresse (Einladungen, Teilen, Links von außen). */
    const val PUBLIC = "https://ricorewioriginal-collab.github.io/easygames/"
    const val LEGAL_IMPRINT = "https://ricorewi.de/impressum.html"
    const val LEGAL_PRIVACY = "https://ricorewi.de/datenschutz.html"

    fun isOwn(uri: Uri): Boolean = uri.scheme == "https" && HOST.equals(uri.host, ignoreCase = true)

    /** Pfad relativ zur easygames-Wurzel (ohne Query/Hash) einer eigenen oder öffentlichen Adresse, sonst null. */
    fun relPath(uri: Uri): String? {
        val path = uri.path ?: return null
        val own = isOwn(uri)
        val pub = uri.scheme == "https" && "ricorewioriginal-collab.github.io".equals(uri.host, true)
        if (!own && !pub) return null
        if (!path.startsWith(PATH_PREFIX) && path != PATH_PREFIX.trimEnd('/')) return null
        return path.removePrefix(PATH_PREFIX.trimEnd('/')).trimStart('/')
    }

    /** Lokale Adresse zu einem relativen Pfad samt Query/Hash. */
    fun local(rel: String, query: String? = null, fragment: String? = null): String =
        ROOT + rel + (if (query.isNullOrEmpty()) "" else "?$query") + (if (fragment.isNullOrEmpty()) "" else "#$fragment")
}

/**
 * Liefert die installierten Inhalte aus der Bibliothek aus, ersetzt CDN-Aufrufe durch lokale Dateien (Vendor-Map)
 * und entscheidet über Navigation: zurück zur App, Impressum/Datenschutz auf ricorewi.de, fremde Links im Browser.
 */
class ContentWebViewClient(
    private val library: Library,
    private val callbacks: Callbacks
) : WebViewClient() {

    interface Callbacks {
        fun onPageFinished(url: String?)
        /** Der Renderer-Prozess ist abgestürzt/beendet; die WebView muss neu aufgebaut werden. */
        fun onRendererGone(view: WebView)
        fun openExternal(uri: Uri)
        /** Die Seite will zur Spieleübersicht („← Alle Spiele“). */
        fun backToApp()
        /** Link auf ein Spiel, das noch nicht installiert ist: in der App öffnen (Installieren). */
        fun openGame(folder: String, uri: Uri)
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

    // Auch für den ServiceWorkerClient: dessen Abrufe laufen am WebViewClient vorbei.
    fun intercept(req: WebResourceRequest): WebResourceResponse? {
        val uri = req.url
        val scheme = uri.scheme
        if (scheme != "https" && scheme != "http") return null
        val method = (req.method ?: "GET").uppercase()

        if (Origin.isOwn(uri)) {
            if (method == "OPTIONS") return status(204, "No Content")
            if (method != "GET" && method != "HEAD") return status(405, "Method Not Allowed")
            if (req.requestHeaders.any { (key, value) -> key.equals("Service-Worker", true) && value == "script" }) return notFound()
            val path = uri.path ?: ""
            if (!path.startsWith(Origin.PATH_PREFIX)) return notFound()
            var rel = path.substring(Origin.PATH_PREFIX.length)
            if (rel.isEmpty() || rel.endsWith("/")) rel += "index.html"
            return serveFile(rel, method) ?: notFound()
        }

        // Bekannte CDN-Adresse -> lokale Datei; sonst normal ins Netz
        if (method != "GET" && method != "HEAD") return null
        val local = library.resolveVendor(uri.toString()) ?: return null
        return serveFile(local, method)
    }

    private fun serveFile(path: String, method: String): WebResourceResponse? {
        val file = library.open(path) ?: return null
        val mime = Mime.forPath(path)
        val data = when {
            method == "HEAD" -> ByteArrayInputStream(ByteArray(0))
            mime == "text/html" -> ByteArrayInputStream(NativeHtml.prepare(file.readText()).toByteArray(Charsets.UTF_8))
            else -> FileInputStream(file)
        }
        val encoding = if (Mime.isText(mime)) "utf-8" else null
        return WebResourceResponse(mime, encoding, 200, "OK", HEADERS, data)
    }

    private fun notFound() = status(404, "Not Found")

    private fun status(code: Int, reason: String) =
        WebResourceResponse("text/plain", "utf-8", code, reason, HEADERS, ByteArrayInputStream(ByteArray(0)))

    // ---------------------------------------------------------------- Navigation

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val req = request ?: return false
        if (!req.isForMainFrame) return false
        val uri = req.url
        val rel = Origin.relPath(uri)
        if (rel != null) {
            val file = rel.substringBefore('?')
            // Spieleübersicht (Start der Webseite) = zurück in die App
            if (file.isEmpty() || file == "index.html") { callbacks.backToApp(); return true }
            // Impressum und Datenschutz gelten für easygames auf ricorewi.de
            if (file == "impressum.html") { callbacks.openExternal(Uri.parse(Origin.LEGAL_IMPRINT)); return true }
            if (file == "datenschutz.html") { callbacks.openExternal(Uri.parse(Origin.LEGAL_PRIVACY)); return true }
            val top = file.substringBefore('/')
            val game = library.catalog?.byFolder(top)
            if (game != null && file.contains('/') && !library.status(game).installed) { callbacks.openGame(top, uri); return true }
            if (Origin.isOwn(uri)) return false
            // Öffentliche easygames-Adresse (z. B. Einladung im Spiel): lokal öffnen, wenn vorhanden
            if (game == null || library.status(game).installed) {
                view?.loadUrl(Origin.local(file, uri.encodedQuery, uri.encodedFragment))
                return true
            }
        }
        val scheme = uri.scheme?.lowercase()
        if (scheme == "http" || scheme == "https") callbacks.openExternal(uri)
        return true                                               // fremde Ziele nie in dieser WebView laden
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {}

    override fun onPageFinished(view: WebView?, url: String?) {
        callbacks.onPageFinished(url)
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
