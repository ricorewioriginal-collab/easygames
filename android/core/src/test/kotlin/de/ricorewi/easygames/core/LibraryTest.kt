package de.ricorewi.easygames.core

import org.json.JSONArray
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import java.io.File
import java.io.IOException
import java.nio.file.Files

class LibraryTest {
    private lateinit var dir: File
    private lateinit var net: FakeFetcher
    private var clock = 1_000_000_000_000L
    private val libs = ArrayList<Library>()

    private fun game(id: String, title: String, extra: JSONObject.() -> Unit = {}) = JSONObject()
        .put("id", id).put("title", title).put("desc", "Beschreibung $id").put("icon", "🎮").put("img", "$id/card.png")
        .put("bg", "#000").put("path", "$id/").put("modes", JSONObject().put("online", true))
        .put("guide", JSONObject().put("anleitung", "So geht $id").put("steuerung", JSONArray().put("Tippen")).put("tipps", JSONArray()))
        .apply(extra)

    private fun content(games: List<JSONObject>, files: Map<String, String>, big: Int = 3 * 1024 * 1024): Map<String, ByteArray> {
        val m = LinkedHashMap<String, ByteArray>()
        files.forEach { (k, v) -> m[k] = T.bytes(v) }
        m["vendor/big/model.bin"] = ByteArray(big) { (it % 251).toByte() }
        m["catalog.json"] = T.bytes(JSONObject().put("schema", 1).put("games", JSONArray(games)).toString())
        return m
    }

    private val baseFiles = mapOf(
        "index.html" to "<html>Start</html>",
        "konto.html" to "<html>Konto</html>",
        "cloud/fire-peer.js" to "// peer",
        "vendor/three.js" to "// three",
        "thumbs/a.webp" to "webp",
        "guides/a.json" to "{}",
    )
    private val gameFiles = mapOf(
        "a/index.html" to "<script src=\"../b/lib.js\"></script><script src=\"../cloud/fire-peer.js\"></script>",
        "a/card.png" to "A",
        "b/index.html" to "<html>B</html>",
        "b/lib.js" to "// lib von b",
        "b/card.png" to "B",
        "c/index.html" to "<script>const MP='../vendor/big/';</script>",
        "c/card.png" to "C",
    )
    private val games3 = listOf(game("a", "Spiel A"), game("b", "Spiel B"), game("c", "Spiel C"))

    @Before fun setUp() {
        dir = Files.createTempDirectory("lib").toFile()
        net = FakeFetcher()
        net.chunk = 64 * 1024
        net.publish("v1", content(games3, baseFiles + gameFiles))
    }

    @After fun tearDown() {
        libs.forEach { it.close() }
        dir.deleteRecursively()
    }

    private fun lib() = Library(dir, net, T.BASE) { clock }.also { libs += it }
    private fun Library.has(p: String) = open(p) != null

    @Test fun refreshLoadsCatalogAndOnlyTheBase() {
        val l = lib()
        val r = l.refresh()
        assertTrue(r.online)
        assertEquals(listOf("a", "b", "c"), l.games.map { it.id })
        assertTrue(l.baseReady)
        assertTrue(l.has("index.html") && l.has("cloud/fire-peer.js") && l.has("vendor/three.js") && l.has("guides/a.json"))
        assertTrue("Kartenbilder gehören zur Basis", l.has("a/card.png") && l.has("c/card.png"))
        assertFalse("Spiele erst beim Installieren", l.has("a/index.html"))
        assertFalse("große Bibliothek nur bei Bedarf", l.has("vendor/big/model.bin"))
        assertTrue(l.games.none { l.status(it).isNew })
        assertEquals("So geht a", l.find("a")!!.anleitung)
    }

    @Test fun installPullsDependenciesAndBlocksTheirRemoval() {
        val l = lib(); l.refresh()
        var last = 0L to 0L
        l.install("a") { d, t -> last = d to t }
        assertTrue(l.status(l.find("a")!!).installed)
        assertEquals(listOf("b"), l.status(l.find("a")!!).needs)
        assertTrue("b mitinstalliert", l.status(l.find("b")!!).installed && l.has("b/lib.js"))
        assertTrue(last.second > 0 && last.first == last.second)
        assertEquals(listOf("Spiel A"), l.uninstall("b"))
        assertTrue(l.has("b/lib.js"))
        assertFalse(l.status(l.find("c")!!).installed)
    }

    @Test fun bigLibraryOnlyForGamesThatUseItAndRemovedWithThem() {
        val l = lib(); l.refresh()
        l.install("c")
        assertTrue(l.has("vendor/big/model.bin"))
        assertEquals(listOf("vendor/big"), l.status(l.find("c")!!).needs)
        assertTrue(l.uninstall("c").isEmpty())
        assertFalse(l.has("c/index.html") || l.has("vendor/big/model.bin"))
        assertTrue("Kartenbild bleibt", l.has("c/card.png"))
        assertFalse(File(dir, "files/vendor/big/model.bin").exists())
    }

    @Test fun detectsAndAppliesUpdates() {
        val l = lib(); l.refresh(); l.install("a")
        clock += 1000
        net.publish("v2", content(games3, baseFiles + gameFiles + ("a/index.html" to "<html>A v2 ../b/lib.js</html>")))
        val r = lib().let { l2 -> l2.refresh().also { assertTrue(l2.status(l2.find("a")!!).update) } }
        assertEquals(listOf("a"), r.updates.map { it.id })
        val l3 = lib(); l3.refresh()
        l3.install("a")
        assertFalse(l3.status(l3.find("a")!!).update)
        assertEquals("<html>A v2 ../b/lib.js</html>", l3.open("a/index.html")!!.readText())
    }

    @Test fun recognisesNewGames() {
        val l = lib(); l.refresh()
        clock += 1000
        net.publish("v2", content(games3 + game("d", "Spiel D"), baseFiles + gameFiles + mapOf("d/index.html" to "D", "d/card.png" to "D")))
        val r = l.refresh()
        assertEquals(listOf("d"), r.newGames.map { it.id })
        assertTrue(l.status(l.find("d")!!).isNew)
        assertFalse(l.status(l.find("a")!!).isNew)
        clock += Library.NEW_FOR_MS + 1
        assertFalse("nach 14 Tagen nicht mehr neu", l.status(l.find("d")!!).isNew)
    }

    @Test fun offlineKeepsLastState() {
        lib().apply { refresh(); install("a") }
        net.manifestError = IOException("offline")
        val l = lib()
        val r = l.refresh()
        assertFalse(r.online)
        assertEquals(3, l.games.size)
        assertTrue(l.status(l.find("a")!!).installed && l.has("a/index.html"))
    }

    @Test fun brokenDownloadChangesNothing() {
        val l = lib(); l.refresh()
        net.files[T.BASE + "a/index.html"] = T.bytes("manipuliert")
        try { l.install("a"); fail("Prüfsumme hätte fehlschlagen müssen") } catch (e: IOException) { }
        assertFalse(l.status(l.find("a")!!).installed)
        assertNull(l.open("a/index.html"))
        assertTrue(File(dir, "tmp").listFiles().orEmpty().isEmpty())
    }

    @Test fun playTimeAndUnsafePaths() {
        val l = lib(); l.refresh(); l.install("b")
        l.addPlayTime("b", 90); l.addPlayTime("b", 30)
        val s = lib().status(l.find("b")!!)
        assertEquals(120, s.playSeconds)
        assertEquals(clock, s.lastPlayed)
        assertNull(l.open("../state.json"))
        assertNotNull(l.open("b/index.html"))
    }
}
