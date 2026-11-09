package de.ricorewi.easygames.core

import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.nio.file.Files

/** Gegen den echten Stand auf GitHub (nur mit EASYGAMES_LIVE=1): Basis laden, ein Spiel mit Abhängigkeit installieren. */
class LiveLibraryTest {
    @Test fun realSync() {
        assumeTrue(System.getenv("EASYGAMES_LIVE") == "1")
        val dir = Files.createTempDirectory("live").toFile()
        val lib = Library(dir, HttpFetcher(), "https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/")
        try {
            val t0 = System.currentTimeMillis()
            val r = lib.refresh()
            println("Spiele: ${lib.games.size}, Basis: ${lib.diskBytes / 1_000_000} MB in ${(System.currentTimeMillis() - t0) / 1000} s")
            assertTrue(r.online && lib.baseReady && lib.games.size >= 90)
            assertTrue(lib.open("cloud/fire-peer.js") != null && lib.open("konto.html") != null && lib.open("categories.js") != null)
            val fp = lib.games.first { it.folder == "anmacha-funkparcours" }
            lib.install(fp.id)
            val st = lib.status(fp)
            println("Funkparcours: installiert=${st.installed}, braucht=${st.needs}, gesamt ${lib.diskBytes / 1_000_000} MB")
            assertTrue(st.installed && !st.update && "easyclash" in st.needs)
            val ga = lib.games.first { it.folder == "groove-arena" }
            lib.install(ga.id)
            println("Groove Arena braucht: ${lib.status(ga).needs}")
            assertTrue("vendor/mediapipe-pose" in lib.status(ga).needs && lib.open("vendor/mediapipe-pose/pose_landmark_lite.tflite") != null)
        } finally {
            lib.close(); dir.deleteRecursively()
        }
    }
}
