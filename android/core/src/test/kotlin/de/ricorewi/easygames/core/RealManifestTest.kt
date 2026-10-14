package de.ricorewi.easygames.core

import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test

/** Integrationstest: Das vom Repo erzeugte sync/manifest.json (tools/build-sync.js) muss von der App akzeptiert werden. */
class RealManifestTest {
    private val file: File? = listOf("../../sync/manifest.json", "../sync/manifest.json", "sync/manifest.json")
        .map { File(it) }.firstOrNull { it.isFile }

    @Test fun repoManifestIsAcceptedByApp() {
        assumeTrue("sync/manifest.json nicht gefunden", file != null)
        val m = Manifest.parse(file!!.readText())
        assertEquals(1, Manifest.SCHEMA)
        assertTrue("Dateien erwartet", m.files.size > 100)
        assertNotNull("Einstieg index.html im Manifest", m.fileFor(m.entry))
        assertNotNull("Katalog im Manifest", m.catalog?.let { m.fileFor(it) })
    }

    @Test fun cdnLibrariesResolveToLocalFilesInManifest() {
        assumeTrue("sync/manifest.json nicht gefunden", file != null)
        val m = Manifest.parse(file!!.readText())
        val urls = listOf(
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js",
            "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",
            "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
            "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
            "https://fonts.googleapis.com/fredoka-latin-wght-normal.woff2"
        )
        for (u in urls) {
            val p = m.vendorPath(u)
            assertNotNull("Keine Vendor-Zuordnung für $u", p)
            assertNotNull("$u → $p fehlt in files", m.fileFor(p!!))
        }
        // Google-Fonts-CSS mit Query (aus den Spielen)
        val fonts = m.vendor.keys.filter { it.startsWith("https://fonts.googleapis.com/css") }
        assertTrue("Fredoka-CSS erwartet", fonts.isNotEmpty())
        fonts.forEach { assertEquals("vendor/fonts/fredoka.css", m.vendorPath(it)) }
    }
}
