package de.ricorewi.easygames.core

import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.io.OutputStream
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicInteger

/** Hilfsfunktionen für Tests. */
object T {
    const val BASE = "https://example.test/repo/"

    fun bytes(s: String): ByteArray = s.toByteArray(Charsets.UTF_8)

    fun manifestJson(
        version: String,
        files: Map<String, ByteArray>,
        vendor: Map<String, String> = emptyMap(),
        entry: String = "index.html"
    ): String {
        val arr = JSONArray()
        for ((p, b) in files) {
            arr.put(JSONObject().put("p", p).put("s", b.size).put("h", Hashing.sha256(b)))
        }
        val o = JSONObject()
            .put("schema", 1).put("version", version).put("generated", "2026-10-13T10:00:00Z")
            .put("commit", JSONObject.NULL).put("entry", entry).put("catalog", "catalog.json")
            .put("files", arr)
        val v = JSONObject()
        for ((k, p) in vendor) v.put(k, p)
        o.put("vendor", v)
        return o.toString()
    }

    /** Schreibt Dateien + sync/manifest.json in ein Verzeichnis (Baseline). */
    fun writeBaseline(dir: File, version: String, files: Map<String, ByteArray>, vendor: Map<String, String> = emptyMap()) {
        for ((p, b) in files) {
            val f = File(dir, p)
            f.parentFile.mkdirs()
            f.writeBytes(b)
        }
        val mf = File(dir, "sync/manifest.json")
        mf.parentFile.mkdirs()
        mf.writeText(manifestJson(version, files, vendor))
    }

    fun readAll(c: Content?): String? = c?.stream?.use { String(it.readBytes(), Charsets.UTF_8) }
}

/** Simulierter Server. Schlüssel = volle URL. */
class FakeFetcher : Fetcher {
    val files = ConcurrentHashMap<String, ByteArray>()
    @Volatile var manifestText: String = ""
    @Volatile var etag: String? = "\"e1\""
    @Volatile var manifestError: IOException? = null
    val requests = CopyOnWriteArrayList<String>()
    val etagsSeen = CopyOnWriteArrayList<String?>()

    /** Wird vor jedem Block eines Downloads aufgerufen (url, bisher geschriebene Bytes). */
    @Volatile var onChunk: ((String, Int) -> Unit)? = null
    @Volatile var chunk = 100

    fun publish(version: String, content: Map<String, ByteArray>, vendor: Map<String, String> = emptyMap(), newEtag: String? = "\"$version\"") {
        files.clear()
        for ((p, b) in content) files[T.BASE + SyncEngine.encodePath(p)] = b
        manifestText = T.manifestJson(version, content, vendor)
        etag = newEtag
    }

    override fun getManifest(url: String, etag: String?): ManifestResponse {
        requests.add("manifest")
        etagsSeen.add(etag)
        manifestError?.let { throw it }
        val cur = this.etag
        if (etag != null && cur != null && etag == cur) return ManifestResponse(true, null, cur)
        return ManifestResponse(false, manifestText, cur)
    }

    private val inFlight = AtomicInteger()
    /** Höchste Zahl gleichzeitig laufender Downloads. */
    val maxInFlight = AtomicInteger()

    override fun download(url: String, out: OutputStream, onBytes: (Int) -> Unit) {
        requests.add(url)
        val data = files[url] ?: throw HttpStatusException(404, url)
        val now = inFlight.incrementAndGet()
        maxInFlight.accumulateAndGet(now) { a, b -> maxOf(a, b) }
        try {
            var off = 0
            while (off < data.size) {
                onChunk?.invoke(url, off)
                val n = minOf(chunk, data.size - off)
                out.write(data, off, n)
                onBytes(n)
                off += n
            }
            if (data.isEmpty()) onChunk?.invoke(url, 0)
        } finally {
            inFlight.decrementAndGet()
        }
    }

    fun downloadsOf(): List<String> = requests.filter { it != "manifest" }
}
