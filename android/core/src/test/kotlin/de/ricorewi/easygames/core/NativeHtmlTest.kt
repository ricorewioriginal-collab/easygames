package de.ricorewi.easygames.core

import org.junit.Assert.*
import org.junit.Test

class NativeHtmlTest {
    @Test fun guardRunsBeforeGameScripts() {
        val prepared = NativeHtml.prepare("<!doctype html><HTML><HEAD lang='de'><script>startGame()</script></HEAD></HTML>")
        assertTrue(prepared.indexOf("serviceWorker.register") < prepared.indexOf("startGame()"))
        assertTrue(prepared.startsWith("<!doctype html>"))
    }

    @Test fun fragmentsAreSupported() {
        assertTrue(NativeHtml.prepare("<canvas></canvas>").endsWith("<canvas></canvas>"))
    }

    @Test fun bootstrapPreservesSaves() {
        val html = NativeHtml.bootstrap("https://appassets.androidplatform.net/easygames/index.html")
        assertTrue(html.contains("r.unregister()"))
        assertTrue(html.contains("caches.delete(k)"))
        assertFalse(html.contains("localStorage.clear"))
        assertFalse(html.contains("deleteDatabase"))
    }
}
