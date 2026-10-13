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

class ContentStoreTest {
    @get:Rule val tmp = TemporaryFolder()

    private fun baseline(version: String, files: Map<String, ByteArray>, vendor: Map<String, String> = emptyMap()): DirBaselineSource {
        val dir = tmp.newFolder("baseline-$version")
        T.writeBaseline(dir, version, files, vendor)
        return DirBaselineSource.openOrNull(dir)!!
    }

    @Test fun emptyStoreWithoutBaselineHasNoContent() {
        val s = ContentStore(tmp.newFolder("s"))
        assertNull(s.activeManifest)
        assertNull(s.open("index.html"))
    }

    @Test fun baselineIsActiveAtFirstStartAndServedFromBaseline() {
        val b = baseline("v1", mapOf("index.html" to T.bytes("<h1>hi</h1>"), "z/app.js" to T.bytes("var a;")),
            vendor = mapOf("https://cdn/x.js?v=2" to "z/app.js"))
        val root = tmp.newFolder("s")
        val s = ContentStore(root, b)
        assertEquals("v1", s.activeManifest!!.version)
        assertFalse(s.hasCurrent())
        val c = s.open("z/app.js")!!
        assertEquals("text/javascript", c.mime)
        assertEquals(6L, c.length)
        assertEquals("var a;", T.readAll(c))
        assertEquals("z/app.js", s.resolveVendor("https://cdn/x.js?v=2"))
        assertEquals("z/app.js", s.resolveVendor("https://cdn/x.js"))
        assertEquals(0, s.storeFileCount())        // nichts wurde kopiert
        assertNull(File(root, "current.json").takeIf { it.exists() })
    }

    @Test fun unknownAndTraversalPathsAreNotServed() {
        val b = baseline("v1", mapOf("index.html" to T.bytes("x")))
        File(tmp.root, "geheim.txt").writeText("geheim")
        val s = ContentStore(tmp.newFolder("s"), b)
        for (p in listOf("../geheim.txt", "/etc/passwd", "index.html/../index.html", "", "nope.js", "sync/manifest.json")) {
            assertNull(p, s.open(p))
        }
        assertNotNull(s.open("index.html"))
    }

    @Test fun baselineOnlyUsedWhenHashMatches() {
        val b = baseline("v1", mapOf("index.html" to T.bytes("alt")))
        val root = tmp.newFolder("s")
        // aktives Manifest: gleicher Pfad, anderer Hash, Datei nicht im Store
        File(root, "current.json").writeText(T.manifestJson("v2", mapOf("index.html" to T.bytes("neu"))))
        val s = ContentStore(root, b)
        // current.json gesetzt -> neuer Hash nicht im Store, Baseline hat anderen Hash -> nicht vorhanden
        assertEquals("v2", s.activeManifest!!.version)
        assertNull(s.open("index.html"))
    }

    @Test fun corruptCurrentJsonFallsBackToBaseline() {
        val b = baseline("v1", mapOf("index.html" to T.bytes("x")))
        val root = tmp.newFolder("s")
        File(root, "current.json").writeText("{kaputt")
        val s = ContentStore(root, b)
        assertEquals("v1", s.activeManifest!!.version)
        assertFalse(File(root, "current.json").exists())
    }

    @Test fun currentJsonSurvivesRestart() {
        val root = tmp.newFolder("s")
        val s1 = ContentStore(root)
        val data = T.bytes("hallo")
        val t = s1.newTmpFile(); t.writeBytes(data); s1.putFromTmp(t, Hashing.sha256(data))
        s1.activate(T.manifestJson("v7", mapOf("index.html" to data)))
        val s2 = ContentStore(root)
        assertEquals("v7", s2.activeManifest!!.version)
        assertEquals("hallo", T.readAll(s2.open("index.html")))
    }

    @Test fun commitRefusesIncompletePendingAndKeepsActive() {
        val root = tmp.newFolder("s")
        val s = ContentStore(root)
        val a = T.bytes("a")
        val t = s.newTmpFile(); t.writeBytes(a); s.putFromTmp(t, Hashing.sha256(a))
        s.activate(T.manifestJson("v1", mapOf("index.html" to a)))
        s.writePending(T.manifestJson("v2", mapOf("index.html" to T.bytes("fehlt-im-store"))))
        assertNull(s.commitPending())
        assertEquals("v1", s.activeManifest!!.version)
        assertFalse(s.hasPending())
    }

    @Test fun gcRemovesOnlyUnreferencedFiles() {
        val root = tmp.newFolder("s")
        val s = ContentStore(root)
        val keep = T.bytes("keep"); val drop = T.bytes("drop"); val pend = T.bytes("pend")
        for (d in listOf(keep, drop, pend)) { val t = s.newTmpFile(); t.writeBytes(d); s.putFromTmp(t, Hashing.sha256(d)) }
        s.activate(T.manifestJson("v1", mapOf("index.html" to keep)))
        s.writePending(T.manifestJson("v2", mapOf("index.html" to pend)))
        assertEquals(1, s.gc())                       // nur "drop"
        assertTrue(s.hasInStore(Hashing.sha256(keep)))
        assertTrue(s.hasInStore(Hashing.sha256(pend)))
        assertFalse(s.hasInStore(Hashing.sha256(drop)))
    }

    @Test fun putFromTmpIsIdempotent() {
        val s = ContentStore(tmp.newFolder("s"))
        val d = T.bytes("x"); val h = Hashing.sha256(d)
        repeat(2) { val t = s.newTmpFile(); t.writeBytes(d); s.putFromTmp(t, h); assertFalse(t.exists()) }
        assertEquals(1, s.storeFileCount())
    }

    @Test fun etagRoundtrip() {
        val s = ContentStore(tmp.newFolder("s"))
        assertNull(s.readEtag())
        s.writeEtag("\"abc\"")
        assertEquals("\"abc\"", s.readEtag())
        s.writeEtag(null)
        assertNull(s.readEtag())
    }
}
