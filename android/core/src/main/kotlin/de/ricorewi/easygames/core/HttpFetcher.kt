package de.ricorewi.easygames.core

import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.GZIPInputStream

/**
 * Fetcher auf Basis von HttpURLConnection. Nur https (außer `allowHttp` für Tests), Weiterleitungen werden
 * manuell verfolgt (max. 5) und unterliegen derselben Schema-Prüfung (kein Downgrade auf http), gzip wird entpackt.
 */
class HttpFetcher(
    private val allowHttp: Boolean = false,
    private val connectTimeoutMs: Int = 15_000,
    private val readTimeoutMs: Int = 30_000,
    private val userAgent: String = "easygames-sync/1",
    private val maxManifestBytes: Int = 8 * 1024 * 1024
) : Fetcher {

    override fun getManifest(url: String, etag: String?): ManifestResponse {
        val conn = connect(url, etag)
        try {
            if (conn.responseCode == HttpURLConnection.HTTP_NOT_MODIFIED) {
                return ManifestResponse(true, null, etag)
            }
            val bos = ByteArrayOutputStream()
            var total = 0
            body(conn).use { input ->
                val buf = ByteArray(16 * 1024)
                while (true) {
                    val n = input.read(buf)
                    if (n < 0) break
                    total += n
                    if (total > maxManifestBytes) throw IOException("Manifest zu groß")
                    bos.write(buf, 0, n)
                }
            }
            return ManifestResponse(false, bos.toString("UTF-8"), conn.getHeaderField("ETag"))
        } finally {
            conn.disconnect()
        }
    }

    override fun download(url: String, out: OutputStream, onBytes: (Int) -> Unit) {
        val conn = connect(url, null)
        try {
            body(conn).use { input ->
                val buf = ByteArray(32 * 1024)
                while (true) {
                    val n = input.read(buf)
                    if (n < 0) break
                    out.write(buf, 0, n)
                    onBytes(n)
                }
            }
        } finally {
            conn.disconnect()
        }
    }

    private fun body(conn: HttpURLConnection): InputStream {
        val raw = conn.inputStream
        return if ("gzip".equals(conn.contentEncoding, ignoreCase = true)) GZIPInputStream(raw) else raw
    }

    /** Öffnet die Verbindung, folgt Weiterleitungen und liefert eine Antwort mit Status 200 oder 304. */
    private fun connect(startUrl: String, etag: String?): HttpURLConnection {
        var current = URL(startUrl)
        var hops = 0
        while (true) {
            checkScheme(current)
            val c = current.openConnection() as HttpURLConnection
            c.instanceFollowRedirects = false
            c.connectTimeout = connectTimeoutMs
            c.readTimeout = readTimeoutMs
            c.useCaches = false
            c.setRequestProperty("Accept-Encoding", "gzip")
            c.setRequestProperty("User-Agent", userAgent)
            if (etag != null) c.setRequestProperty("If-None-Match", etag)
            val code = try {
                c.responseCode
            } catch (e: IOException) {
                c.disconnect()
                throw e
            }
            when (code) {
                HttpURLConnection.HTTP_OK -> return c
                HttpURLConnection.HTTP_NOT_MODIFIED -> {
                    if (etag != null) return c
                    c.disconnect()
                    throw HttpStatusException(code, startUrl)
                }
                301, 302, 303, 307, 308 -> {
                    val loc = c.getHeaderField("Location")
                    c.disconnect()
                    if (loc.isNullOrEmpty()) throw IOException("Weiterleitung ohne Ziel")
                    if (++hops > MAX_REDIRECTS) throw IOException("Zu viele Weiterleitungen")
                    current = URL(current, loc)
                }
                else -> {
                    c.disconnect()
                    throw HttpStatusException(code, startUrl)
                }
            }
        }
    }

    private fun checkScheme(url: URL) {
        val proto = url.protocol.lowercase()
        if (proto == "https") return
        if (proto == "http" && allowHttp) return
        throw InsecureUrlException("Nur https erlaubt: ${url.protocol}://${url.host}")
    }

    private companion object {
        const val MAX_REDIRECTS = 5
    }
}
