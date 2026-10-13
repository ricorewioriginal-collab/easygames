package de.ricorewi.easygames.core

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.net.InetSocketAddress
import java.net.SocketTimeoutException
import java.util.concurrent.CopyOnWriteArrayList
import java.util.zip.GZIPOutputStream

/** Echter HTTP-Test gegen einen lokalen Server (nur http, daher allowHttp = true). */
class HttpFetcherTest {
    @get:Rule val tmp = TemporaryFolder()
    private lateinit var server: HttpServer
    private lateinit var base: String
    private val seenIfNoneMatch = CopyOnWriteArrayList<String?>()
    private val files = HashMap<String, ByteArray>()

    private fun gzip(b: ByteArray): ByteArray {
        val bos = ByteArrayOutputStream()
        GZIPOutputStream(bos).use { it.write(b) }
        return bos.toByteArray()
    }

    private fun reply(ex: HttpExchange, code: Int, body: ByteArray, headers: Map<String, String> = emptyMap()) {
        for ((k, v) in headers) ex.responseHeaders.add(k, v)
        if (code == 304 || body.isEmpty()) {
            ex.sendResponseHeaders(code, -1)
        } else {
            ex.sendResponseHeaders(code, body.size.toLong())
            ex.responseBody.use { it.write(body) }
        }
        ex.close()
    }

    @Before fun start() {
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/") { ex ->
            val path = ex.requestURI.path
            when {
                path == "/repo/sync/manifest.json" -> {
                    seenIfNoneMatch.add(ex.requestHeaders.getFirst("If-None-Match"))
                    val body = files["/repo/sync/manifest.json"]!!
                    if (ex.requestHeaders.getFirst("If-None-Match") == "\"m1\"") reply(ex, 304, ByteArray(0))
                    else reply(ex, 200, body, mapOf("ETag" to "\"m1\""))
                }
                path == "/redir" -> reply(ex, 302, ByteArray(0), mapOf("Location" to "/repo/hello.txt"))
                path == "/loop" -> reply(ex, 302, ByteArray(0), mapOf("Location" to "/loop"))
                path == "/to-https" -> reply(ex, 302, ByteArray(0), mapOf("Location" to "ftp://example.org/x"))
                path == "/gz" -> reply(ex, 200, gzip(files["/repo/hello.txt"]!!), mapOf("Content-Encoding" to "gzip"))
                path == "/slow" -> { Thread.sleep(1500); reply(ex, 200, ByteArray(1)) }
                path == "/boom" -> reply(ex, 500, ByteArray(0))
                files.containsKey(path) -> reply(ex, 200, files[path]!!)
                else -> reply(ex, 404, ByteArray(0))
            }
        }
        server.start()
        base = "http://127.0.0.1:${server.address.port}"
        files["/repo/hello.txt"] = "Hallo Welt".toByteArray()
        files["/repo/ü ber/a b.js"] = "var x;".toByteArray()
    }

    @After fun stop() = server.stop(0)

    private fun fetch(f: HttpFetcher, url: String): String {
        val out = ByteArrayOutputStream()
        var counted = 0
        f.download(url, out) { counted += it }
        assertEquals(out.size(), counted)
        return out.toString("UTF-8")
    }

    @Test fun downloadsFile() {
        assertEquals("Hallo Welt", fetch(HttpFetcher(allowHttp = true), "$base/repo/hello.txt"))
    }

    @Test fun followsRedirects() {
        assertEquals("Hallo Welt", fetch(HttpFetcher(allowHttp = true), "$base/redir"))
    }

    @Test fun decodesGzip() {
        assertEquals("Hallo Welt", fetch(HttpFetcher(allowHttp = true), "$base/gz"))
    }

    @Test fun redirectLoopAndForbiddenSchemeFail() {
        val f = HttpFetcher(allowHttp = true)
        try { fetch(f, "$base/loop"); fail() } catch (e: IOException) { assertTrue(e.message!!, e.message!!.contains("Weiterleitungen")) }
        try { fetch(f, "$base/to-https"); fail() } catch (e: InsecureUrlException) { /* erwartet */ }
    }

    @Test fun plainHttpIsRejectedByDefault() {
        try { fetch(HttpFetcher(), "$base/repo/hello.txt"); fail() } catch (e: InsecureUrlException) { /* erwartet */ }
        assertFalse(seenIfNoneMatch.isNotEmpty())
    }

    @Test fun httpErrorsBecomeStatusExceptions() {
        val f = HttpFetcher(allowHttp = true)
        try { fetch(f, "$base/missing"); fail() } catch (e: HttpStatusException) { assertEquals(404, e.code) }
        try { fetch(f, "$base/boom"); fail() } catch (e: HttpStatusException) { assertEquals(500, e.code) }
    }

    @Test fun readTimeoutFailsFast() {
        val f = HttpFetcher(allowHttp = true, connectTimeoutMs = 500, readTimeoutMs = 300)
        val t0 = System.nanoTime()
        try { fetch(f, "$base/slow"); fail() } catch (e: SocketTimeoutException) { /* erwartet */ }
        assertTrue((System.nanoTime() - t0) / 1_000_000 < 1_400)
    }

    @Test fun manifestWithEtagAndNotModified() {
        files["/repo/sync/manifest.json"] = T.manifestJson("v1", mapOf("index.html" to T.bytes("x"))).toByteArray()
        val f = HttpFetcher(allowHttp = true)
        val r1 = f.getManifest("$base/repo/sync/manifest.json", null)
        assertFalse(r1.notModified)
        assertEquals("\"m1\"", r1.etag)
        assertEquals("v1", Manifest.parse(r1.text!!).version)
        val r2 = f.getManifest("$base/repo/sync/manifest.json", r1.etag)
        assertTrue(r2.notModified)
        assertEquals(listOf<String?>(null, "\"m1\""), seenIfNoneMatch.toList())
    }

    @Test fun cancelFromCallbackClosesDownload() {
        val big = ByteArray(2_000_000) { 7 }
        files["/big"] = big
        var n = 0
        try {
            HttpFetcher(allowHttp = true).download("$base/big", ByteArrayOutputStream()) { n += it; throw SyncCancelledException() }
            fail()
        } catch (e: SyncCancelledException) { /* erwartet */ }
        assertTrue(n in 1 until big.size)
    }

    /** Komplett-Test: SyncEngine + HttpFetcher gegen den lokalen Server, inkl. URL-Kodierung der Pfade. */
    @Test fun engineEndToEndOverRealHttp() {
        val content = mapOf("index.html" to T.bytes("<html>"), "ü ber/a b.js" to T.bytes("var x;"))
        files["/repo/sync/manifest.json"] = T.manifestJson("v1", content).toByteArray()
        files["/repo/index.html"] = content["index.html"]!!
        files["/repo/ü ber/a b.js"] = content["ü ber/a b.js"]!!
        val store = ContentStore(tmp.newFolder("data"))
        val eng = SyncEngine(store, HttpFetcher(allowHttp = true), "$base/repo", SyncConfig(backoffBaseMs = 1, autoCommit = true))
        val r = eng.download()
        assertTrue(r.toString(), r is SyncResult.Updated)
        assertEquals("var x;", T.readAll(store.open("ü ber/a b.js")))
        assertEquals(SyncResult.UpToDate, eng.download())                  // 2. Lauf: 304
        assertEquals("\"m1\"", seenIfNoneMatch.last())
        assertTrue(File(tmp.root, "data/current.json").exists())
    }
}
