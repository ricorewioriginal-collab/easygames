package de.ricorewi.easygames.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File
import java.io.IOException
import java.net.UnknownHostException
import java.util.concurrent.atomic.AtomicInteger

class SyncEngineTest {
    @get:Rule val tmp = TemporaryFolder()

    private val fast = SyncConfig(parallelism = 4, maxAttempts = 3, backoffBaseMs = 1, autoCommit = false)

    private fun site(vararg extra: Pair<String, String>, index: String = "index v1") =
        mapOf("index.html" to T.bytes(index), "a.js" to T.bytes("var a=1;"), "zotik/index.html" to T.bytes("<zotik>")) +
            extra.associate { it.first to T.bytes(it.second) }

    private fun newStore(baseline: BaselineSource? = null, name: String = "data") = ContentStore(File(tmp.root, name).also { it.mkdirs() }, baseline)

    private fun engine(store: ContentStore, f: FakeFetcher, cfg: SyncConfig = fast) = SyncEngine(store, f, T.BASE, cfg)

    private fun baselineDir(version: String, files: Map<String, ByteArray>): DirBaselineSource {
        val dir = tmp.newFolder("bl-$version-${System.nanoTime()}")
        T.writeBaseline(dir, version, files)
        return DirBaselineSource.openOrNull(dir)!!
    }

    private fun allStoreFilesAreValid(root: File) {
        File(root, "store").listFiles()!!.forEach { assertEquals("Store-Datei ${it.name} beschädigt", it.name, Hashing.sha256(it)) }
    }

    @Test fun firstSyncWithoutBaselineDownloadsEverythingAndAutoCommits() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        val r = engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        assertTrue(r.toString(), r is SyncResult.Updated)
        r as SyncResult.Updated
        assertEquals("v1", r.version); assertEquals(3, r.files)
        assertEquals("index v1", T.readAll(store.open("index.html")))
        assertEquals("<zotik>", T.readAll(store.open("zotik/index.html")))
        assertTrue(store.hasCurrent()); assertFalse(store.hasPending())
        allStoreFilesAreValid(File(tmp.root, "data"))
    }

    @Test fun downloadKeepsActiveStateUntilCommit() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        val eng = engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true))
        eng.download()
        f.publish("v2", site(index = "index v2"))
        val eng2 = engine(store, f)
        val r = eng2.download()
        assertTrue(r is SyncResult.Updated)
        assertEquals("v1", store.activeManifest!!.version)
        assertEquals("index v1", T.readAll(store.open("index.html")))     // alter Stand läuft weiter
        assertTrue(eng2.hasPending())
        assertTrue(eng2.commit())
        assertEquals("v2", store.activeManifest!!.version)
        assertEquals("index v2", T.readAll(store.open("index.html")))
        assertFalse(eng2.hasPending())
        assertFalse(eng2.commit())                                         // nichts mehr offen
        allStoreFilesAreValid(File(tmp.root, "data"))
    }

    @Test fun onlyChangedFilesAreDownloaded() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        f.requests.clear()
        f.publish("v2", site(index = "neu"))
        val r = engine(store, f).download() as SyncResult.Updated
        assertEquals(1, r.files)
        assertEquals(listOf(T.BASE + "index.html"), f.downloadsOf())
    }

    @Test fun upToDateWhenVersionEqualAndEtagIsUsed() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        val eng = engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true))
        eng.download()
        f.requests.clear(); f.etagsSeen.clear()
        assertEquals(SyncResult.UpToDate, eng.download())                  // 304 über ETag
        assertEquals(listOf<String?>("\"v1\""), f.etagsSeen)
        assertTrue(f.downloadsOf().isEmpty())
        // Server liefert ohne ETag-Unterstützung, aber gleiche Version -> trotzdem UpToDate
        f.etag = null
        assertEquals(SyncResult.UpToDate, eng.download())
    }

    @Test fun etagNotSentWithoutCompleteState() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        f.onChunk = { url, _ -> if (url.endsWith("a.js")) throw HttpStatusException(404, url) }
        assertTrue(engine(store, f).download() is SyncResult.Failed)
        f.onChunk = null; f.etagsSeen.clear()
        assertTrue(engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download() is SyncResult.Updated)
        assertEquals(listOf<String?>(null), f.etagsSeen)                   // kein ETag nach Fehlschlag gemerkt
    }

    @Test fun baselineFilesAreNotDownloadedAndUsedDirectly() {
        val v1 = site()
        val baseline = baselineDir("v1", v1)
        val store = newStore(baseline)
        assertEquals("index v1", T.readAll(store.open("index.html")))      // sofort, ohne Kopie
        assertEquals(0, store.storeFileCount())

        val f = FakeFetcher().also { it.publish("v2", site("neu.js" to "n", index = "index v2")) }
        val eng = engine(store, f)
        val r = eng.download() as SyncResult.Updated
        assertEquals(2, r.files)                                           // index.html + neu.js
        assertEquals(setOf(T.BASE + "index.html", T.BASE + "neu.js"), f.downloadsOf().toSet())
        assertTrue(eng.commit())
        assertEquals("index v2", T.readAll(store.open("index.html")))
        assertEquals("var a=1;", T.readAll(store.open("a.js")))            // weiter aus der Baseline
        assertEquals("n", T.readAll(store.open("neu.js")))
        assertEquals(2, store.storeFileCount())
    }

    @Test fun baselineWithSamePathButDifferentHashIsNotUsed() {
        val baseline = baselineDir("v1", mapOf("index.html" to T.bytes("alt")))
        val store = newStore(baseline)
        val f = FakeFetcher().also { it.publish("v2", mapOf("index.html" to T.bytes("neu"))) }
        val r = engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download() as SyncResult.Updated
        assertEquals(1, r.files)
        assertEquals("neu", T.readAll(store.open("index.html")))
    }

    @Test fun hashMismatchIsRejectedAndLeavesStateIntact() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        val before = File(tmp.root, "data/current.json").readText()
        f.requests.clear()

        f.publish("v2", site(index = "index v2"))
        f.files[T.BASE + "index.html"] = T.bytes("index XX")               // gleiche Länge, falscher Inhalt
        val r = engine(store, f).download()
        assertTrue(r.toString(), r is SyncResult.Failed)
        assertTrue((r as SyncResult.Failed).reason.contains("Prüfsumme"))
        assertEquals(before, File(tmp.root, "data/current.json").readText())
        assertFalse(File(tmp.root, "data/pending.json").exists())
        assertEquals("index v1", T.readAll(store.open("index.html")))
        allStoreFilesAreValid(File(tmp.root, "data"))
        assertEquals(3, f.downloadsOf().count { it.endsWith("index.html") && !it.contains("zotik") })   // 3 Versuche
    }

    @Test fun wrongSizeIsRejected() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        f.files[T.BASE + "a.js"] = T.bytes("zu lang zu lang zu lang")
        val store = newStore()
        val r = engine(store, f).download()
        assertTrue(r is SyncResult.Failed)
        assertNull(store.activeManifest)
        assertFalse(store.hasPending())
        f.files[T.BASE + "a.js"] = T.bytes("kurz")
        assertTrue(engine(store, f).download() is SyncResult.Failed)
    }

    @Test fun retryWithBackoffRecovers() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val failures = AtomicInteger(2)
        f.onChunk = { url, off -> if (url.endsWith("a.js") && off == 0 && failures.getAndDecrement() > 0) throw IOException("kaputt") }
        val store = newStore()
        val r = engine(store, f, SyncConfig(maxAttempts = 3, backoffBaseMs = 1, autoCommit = true)).download()
        assertTrue(r.toString(), r is SyncResult.Updated)
        assertEquals(3, f.downloadsOf().count { it.endsWith("a.js") })
    }

    @Test fun httpClientErrorIsNotRetried() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        f.files.remove(T.BASE + "a.js")
        val r = engine(newStore(), f).download() as SyncResult.Failed
        assertTrue(r.reason, r.reason.contains("404"))
        assertEquals(1, f.downloadsOf().count { it.endsWith("a.js") })
    }

    @Test fun serverErrorIsRetriedThenFails() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        f.onChunk = { url, _ -> if (url.endsWith("a.js")) throw HttpStatusException(503, url) }
        val r = engine(newStore(), f, SyncConfig(maxAttempts = 3, backoffBaseMs = 1)).download() as SyncResult.Failed
        assertTrue(r.reason, r.reason.contains("503"))
        assertEquals(3, f.downloadsOf().count { it.endsWith("a.js") })
    }

    @Test fun atomicityMidDownloadFailureLeavesNoHalfState() {
        val big = ByteArray(5000) { (it % 251).toByte() }
        val files = mapOf("index.html" to T.bytes("i"), "big.bin" to big, "z.js" to T.bytes("z"))
        val f = FakeFetcher().also { it.publish("v1", files); it.chunk = 500 }
        val store = newStore()
        f.onChunk = { url, off -> if (url.endsWith("big.bin") && off >= 2000) throw IOException("Verbindung weg") }
        val r = engine(store, f, SyncConfig(parallelism = 1, maxAttempts = 1, backoffBaseMs = 1, autoCommit = true)).download()
        assertTrue(r is SyncResult.Failed)
        val root = File(tmp.root, "data")
        assertFalse(File(root, "current.json").exists())
        assertFalse(File(root, "pending.json").exists())
        assertFalse(File(root, "etag.txt").exists())
        assertNull(store.activeManifest)
        allStoreFilesAreValid(root)                                         // nur ganze, geprüfte Dateien
        assertTrue(File(root, "tmp").listFiles()!!.isEmpty())               // keine Teil-Downloads zurückgeblieben
    }

    @Test fun cancelThenResumeContinuesWithoutRedownloadingFinishedFiles() {
        val files = mapOf("index.html" to T.bytes("i"), "b.js" to T.bytes("b".repeat(300)), "c.js" to T.bytes("c".repeat(300)))
        val f = FakeFetcher().also { it.publish("v1", files); it.chunk = 100 }
        val store = newStore()
        val token = CancelToken()
        val progress = ArrayList<SyncProgress>()
        // sequentiell: abbrechen, sobald die zweite Datei begonnen hat und mindestens eine fertig ist
        f.onChunk = { url, off -> if (url.endsWith("c.js") && off == 100) token.cancel() }
        val r1 = engine(store, f, SyncConfig(parallelism = 1, backoffBaseMs = 1, autoCommit = true)).download(token) { progress.add(it) }
        assertTrue(r1.toString(), r1 is SyncResult.Failed && r1.cancelled)
        assertFalse(store.hasCurrent()); assertFalse(store.hasPending())
        val done = File(tmp.root, "data/store").listFiles()!!.size
        assertTrue("mindestens eine Datei fertig, nicht alle: $done", done in 1..2)

        f.onChunk = null; f.requests.clear()
        val last = ArrayList<SyncProgress>()
        val r2 = engine(newStore(), f, SyncConfig(parallelism = 1, backoffBaseMs = 1, autoCommit = true)).download { last.add(it) }
        assertTrue(r2 is SyncResult.Updated)
        assertEquals(3 - done, f.downloadsOf().size)                        // nur der Rest
        assertEquals(3, (r2 as SyncResult.Updated).files)
        val fin = last.last()
        assertEquals(3, fin.filesDone); assertEquals(fin.bytesTotal, fin.bytesDone)
        assertTrue(last.first().bytesDone > 0)                              // Wiederaufnahme zählt Geladenes mit
    }

    @Test fun gcRunsOnlyAfterSuccessfulCommit() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        val root = File(tmp.root, "data")
        assertEquals(3, store.storeFileCount())
        f.publish("v2", mapOf("index.html" to T.bytes("v2 nur eine Datei")))
        val eng = engine(store, f)
        eng.download()
        assertEquals(4, store.storeFileCount())                             // vor Commit nichts gelöscht
        eng.commit()
        assertEquals(1, store.storeFileCount())                             // danach aufgeräumt
        assertNull(store.open("a.js"))
        allStoreFilesAreValid(root)
    }

    @Test fun failedDownloadDoesNotGc() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        f.publish("v2", mapOf("index.html" to T.bytes("neu"), "x.js" to T.bytes("x")))
        f.files.remove(T.BASE + "x.js")
        assertTrue(engine(store, f, SyncConfig(maxAttempts = 1, backoffBaseMs = 1)).download() is SyncResult.Failed)
        assertEquals("a.js bleibt", "var a=1;", T.readAll(store.open("a.js")))
        assertEquals("index v1", T.readAll(store.open("index.html")))
    }

    @Test fun pendingSurvivesRestartAndCanBeCommitted() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        f.publish("v2", site(index = "index v2"))
        engine(store, f).download()

        val store2 = ContentStore(File(tmp.root, "data"))                   // "Neustart der App"
        val eng2 = engine(store2, FakeFetcher())
        assertEquals("v1", store2.activeManifest!!.version)
        assertTrue(eng2.hasPending())
        assertTrue(eng2.commit())
        assertEquals("index v2", T.readAll(store2.open("index.html")))
    }

    @Test fun traversalPathInServerManifestIsRejected() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        f.manifestText = f.manifestText.replace("\"a.js\"", "\"../../a.js\"")
        val store = newStore()
        val r = engine(store, f).download() as SyncResult.Failed
        assertTrue(r.reason, r.reason.contains("Pfad"))
        assertTrue(f.downloadsOf().isEmpty())
        assertNull(store.open("../../a.js"))
    }

    @Test fun invalidManifestKeepsState() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        f.manifestText = "{\"schema\":2}"; f.etag = "\"neu\""
        assertTrue(engine(store, f).download() is SyncResult.Failed)
        assertEquals("v1", store.activeManifest!!.version)
    }

    @Test fun offlineFailsFastWithoutRetries() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        f.manifestError = UnknownHostException("example.test")
        val store = newStore()
        val t0 = System.nanoTime()
        val r = engine(store, f, SyncConfig(maxAttempts = 5, backoffBaseMs = 5_000)).download() as SyncResult.Failed
        assertTrue(r.offline)
        assertTrue("sollte sofort scheitern", (System.nanoTime() - t0) / 1_000_000 < 2_000)
        assertEquals(1, f.requests.size)
        assertNull(store.activeManifest)
    }

    @Test fun vendorMapIsAvailableAfterSync() {
        val files = site("vendor/three-r128.min.js" to "THREE")
        val f = FakeFetcher().also {
            it.publish("v1", files, mapOf("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" to "vendor/three-r128.min.js"))
        }
        val store = newStore()
        engine(store, f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download()
        val p = store.resolveVendor("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js?x=1")
        assertEquals("vendor/three-r128.min.js", p)
        assertEquals("THREE", T.readAll(store.open(p!!)))
    }

    @Test fun concurrencyIsLimitedToConfiguredParallelism() {
        val files = (1..16).associate { "f$it.js" to T.bytes("x".repeat(100 + it)) } + ("index.html" to T.bytes("i"))
        val f = FakeFetcher().also { it.publish("v1", files); it.chunk = 50 }
        f.onChunk = { _, _ -> Thread.sleep(3) }
        val r = engine(newStore(), f, SyncConfig(parallelism = 4, backoffBaseMs = 1, autoCommit = true)).download()
        assertTrue(r.toString(), r is SyncResult.Updated)
        assertTrue("gleichzeitig: ${f.maxInFlight.get()}", f.maxInFlight.get() <= 4)
        allStoreFilesAreValid(File(tmp.root, "data"))
    }

    @Test fun secondConcurrentSyncIsRejected() {
        val f = FakeFetcher().also { it.publish("v1", mapOf("index.html" to T.bytes("x".repeat(400)))); it.chunk = 100 }
        val store = newStore()
        val eng = engine(store, f)
        val entered = java.util.concurrent.CountDownLatch(1)
        val release = java.util.concurrent.CountDownLatch(1)
        f.onChunk = { _, _ -> entered.countDown(); release.await() }
        var first: SyncResult? = null
        val th = Thread { first = eng.download() }
        th.start()
        assertTrue(entered.await(5, java.util.concurrent.TimeUnit.SECONDS))
        val second = eng.download()
        assertTrue(second is SyncResult.Failed)
        assertFalse(eng.commit())
        release.countDown(); th.join(5000)
        assertTrue(first is SyncResult.Updated)
    }

    @Test fun progressCallbackReportsTotalsAndEnds() {
        val f = FakeFetcher().also { it.publish("v1", site()) }
        val seen = java.util.Collections.synchronizedList(ArrayList<SyncProgress>())
        engine(newStore(), f, SyncConfig(backoffBaseMs = 1, autoCommit = true)).download { seen.add(it) }
        assertTrue(seen.isNotEmpty())
        val total = site().values.sumOf { it.size.toLong() }
        assertEquals(total, seen.last().bytesTotal)
        assertEquals(total, seen.last().bytesDone)
        assertEquals(3, seen.last().filesDone)
        assertNotNull(seen.first())
    }

    @Test fun encodePathKeepsSlashesAndEncodesSpecials() {
        assertEquals("a/b%20c/%C3%BC.js", SyncEngine.encodePath("a/b c/ü.js"))
        assertEquals("x%3Fy%23z.png", SyncEngine.encodePath("x?y#z.png"))
    }
}
