package de.ricorewi.easygames.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MimeTest {
    @Test fun knownTypes() {
        val expected = mapOf(
            "a.js" to "text/javascript", "a.mjs" to "text/javascript", "x/index.html" to "text/html",
            "a.css" to "text/css", "a.json" to "application/json", "a.wasm" to "application/wasm",
            "a.png" to "image/png", "a.jpg" to "image/jpeg", "a.jpeg" to "image/jpeg", "a.webp" to "image/webp",
            "a.svg" to "image/svg+xml", "a.gif" to "image/gif", "a.ico" to "image/x-icon",
            "a.mp3" to "audio/mpeg", "a.ogg" to "audio/ogg", "a.wav" to "audio/wav", "a.m4a" to "audio/mp4",
            "a.mp4" to "video/mp4", "a.webm" to "video/webm", "a.glb" to "model/gltf-binary",
            "a.gltf" to "model/gltf+json", "a.bin" to "application/octet-stream", "a.pck" to "application/octet-stream",
            "a.woff" to "font/woff", "a.woff2" to "font/woff2", "a.ttf" to "font/ttf", "a.txt" to "text/plain",
            "a.xml" to "application/xml", "a.js.map" to "application/json"
        )
        for ((p, m) in expected) assertEquals(p, m, Mime.forPath(p))
    }

    @Test fun caseInsensitiveAndFallback() {
        assertEquals("image/png", Mime.forPath("DIR.x/Bild.PNG"))
        assertEquals(Mime.FALLBACK, Mime.forPath("datei.unbekannt"))
        assertEquals(Mime.FALLBACK, Mime.forPath("ohneendung"))
        assertEquals(Mime.FALLBACK, Mime.forPath("ordner.v2/ohneendung"))
    }

    @Test fun textDetection() {
        assertTrue(Mime.isText("text/html"))
        assertTrue(Mime.isText("application/json"))
        assertFalse(Mime.isText("image/png"))
        assertFalse(Mime.isText("application/wasm"))
    }
}
