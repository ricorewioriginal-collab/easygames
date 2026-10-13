package de.ricorewi.easygames

import android.webkit.JavascriptInterface

/**
 * JS-Brücke `EasyGamesApp`. Bewusst nur harmlose Methoden, denn sie ist in jedem Frame sichtbar
 * (auch in eingebetteten externen iframes). Insbesondere gibt es KEINEN Setter für "Nur WLAN".
 * Alle Methoden laufen auf einem WebView-Hintergrundthread.
 */
class WebBridge(
    private val host: Host,
    private val coordinator: SyncCoordinator
) {
    interface Host {
        /** Aktiviert einen fertig geladenen Stand und lädt die Seite neu. */
        fun reloadContent()

        /** Öffnet den nativen Einstellungsdialog. */
        fun showSettings()
    }

    @JavascriptInterface
    fun getInfo(): String = try {
        coordinator.infoJson()
    } catch (e: Exception) {
        "{\"app\":true}"
    }

    @JavascriptInterface
    fun syncNow() {
        coordinator.requestSync(SyncCoordinator.Trigger.MANUAL)
    }

    @JavascriptInterface
    fun reload() {
        host.reloadContent()
    }

    @JavascriptInterface
    fun openSettings() {
        host.showSettings()
    }
}
