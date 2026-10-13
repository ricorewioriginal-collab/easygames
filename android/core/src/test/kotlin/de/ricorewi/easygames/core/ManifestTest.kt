package de.ricorewi.easygames.core

import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class ManifestTest {
    private val h1 = "a".repeat(64)
    private val h2 = "b".repeat(64)

    private fun json(files: String, extra: String = "", schema: String = "1", entry: String = "\"index.html\"") =
        """{"schema":$schema,"version":"v1","generated":"2026-10-13T10:00:00Z","commit":null,"entry":$entry,"catalog":"catalog.json","files":[$files]$extra}"""

    private fun f(p: String, h: String = h1, s: Long = 3) = """{"p":"$p","s":$s,"h":"$h"}"""

    private fun assertRejected(text: String, hint: String? = null) {
        try {
            Manifest.parse(text)
            fail("Manifest hätte abgelehnt werden müssen: $text")
        } catch (e: ManifestException) {
            if (hint != null) assertTrue(e.message, e.message!!.contains(hint))
        }
    }

    @Test fun parsesValidManifest() {
        val m = Manifest.parse(json(f("index.html") + "," + f("zotik/index.html", h2, 10),
            ""","vendor":{"https://cdn.example/x.js":"zotik/index.html"}"""))
        assertEquals("v1", m.version)
        assertEquals("2026-10-13T10:00:00Z", m.generated)
        assertNull(m.commit)
        assertEquals("index.html", m.entry)
        assertEquals(2, m.files.size)
        assertEquals(13L, m.totalBytes)
        assertEquals(10L, m.fileFor("zotik/index.html")!!.s)
        assertNull(m.fileFor("nope"))
    }

    @Test fun hashIsLowercased() {
        val m = Manifest.parse(json(f("index.html", "A".repeat(64))))
        assertEquals("a".repeat(64), m.fileFor("index.html")!!.h)
    }

    @Test fun rejectsWrongSchema() {
        assertRejected(json(f("index.html"), schema = "2"), "Schema")
        assertRejected("""{"version":"v","files":[]}""", "Schema")
    }

    @Test fun rejectsNonJsonAndMissingFields() {
        assertRejected("kein json")
        assertRejected("""{"schema":1,"files":[${f("index.html")}]}""", "version")
        assertRejected("""{"schema":1,"version":"v"}""", "files")
    }

    @Test fun rejectsBadHashes() {
        assertRejected(json(f("index.html", "abc")), "Hash")
        assertRejected(json(f("index.html", "g".repeat(64))), "Hash")
        assertRejected(json(f("index.html", "a".repeat(65))), "Hash")
    }

    @Test fun rejectsBadSizes() {
        assertRejected(json("""{"p":"index.html","s":-1,"h":"$h1"}"""), "Größe")
        assertRejected(json("""{"p":"index.html","s":1.5,"h":"$h1"}"""), "Größe")
        assertRejected(json("""{"p":"index.html","h":"$h1"}"""), "Größe")
    }

    @Test fun rejectsUnsafePaths() {
        for (bad in listOf("../x.js", "a/../b.js", "/etc/passwd", "a//b.js", "a/./b.js", "a\\\\b.js", "a/", "", "x?y.js", "x#y.js")) {
            assertRejected(json(f(bad) + "," + f("index.html", h2)), "Pfad")
        }
    }

    @Test fun isSafePathCases() {
        assertTrue(Manifest.isSafePath("a/b/c.js"))
        assertTrue(Manifest.isSafePath("sp ace/ü.png"))
        assertFalse(Manifest.isSafePath(".."))
        assertFalse(Manifest.isSafePath("a/.."))
        assertFalse(Manifest.isSafePath("a\u0000b"))
    }

    @Test fun rejectsDuplicates() {
        assertRejected(json(f("index.html") + "," + f("index.html", h2)), "Doppelt")
    }

    @Test fun rejectsSameHashWithDifferentSize() {
        assertRejected(json(f("index.html", h1, 3) + "," + f("b.js", h1, 4)), "Größe")
    }

    @Test fun rejectsMissingEntryAndBadVendorTarget() {
        assertRejected(json(f("other.html")), "Einstiegsdatei")
        assertRejected(json(f("index.html"), ""","vendor":{"https://x/y.js":"vendor/y.js"}"""), "Vendor")
    }

    @Test fun vendorLookupExactThenWithoutQuery() {
        val m = Manifest.parse(json(f("index.html") + "," + f("vendor/a.js", h2) + "," + f("vendor/b.js", "c".repeat(64)),
            ""","vendor":{"https://cdn.example/a.js?v=1":"vendor/a.js","https://cdn.example/b.js":"vendor/b.js"}"""))
        assertEquals("vendor/a.js", m.vendorPath("https://cdn.example/a.js?v=1"))
        assertEquals("vendor/a.js", m.vendorPath("https://cdn.example/a.js"))          // Anfrage ohne Query
        assertEquals("vendor/b.js", m.vendorPath("https://cdn.example/b.js?cachebust=7")) // Query ignoriert
        assertEquals("vendor/b.js", m.vendorPath("https://cdn.example/b.js#frag"))
        assertNull(m.vendorPath("https://cdn.example/c.js"))
    }

    @Test fun stripQuery() {
        assertEquals("http://a/b", Manifest.stripQuery("http://a/b?x=1#y"))
        assertEquals("http://a/b", Manifest.stripQuery("http://a/b#y?x"))
        assertEquals("http://a/b", Manifest.stripQuery("http://a/b"))
    }

    @Test fun jsonBuilderRoundtrip() {
        val files = mapOf("index.html" to T.bytes("<html>"), "a/b.js" to T.bytes("x"))
        val m = Manifest.parse(T.manifestJson("abc", files))
        assertEquals(2, m.files.size)
        assertEquals(Hashing.sha256(T.bytes("x")), m.fileFor("a/b.js")!!.h)
        assertTrue(JSONObject(T.manifestJson("abc", files)).get("files") is JSONArray)
    }
}
