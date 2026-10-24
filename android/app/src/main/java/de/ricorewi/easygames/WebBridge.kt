package de.ricorewi.easygames

import android.webkit.JavascriptInterface

/**
 * JS-Brücke `EasyGamesApp`. Bewusst nur harmlose Methoden, denn sie ist in jedem Frame sichtbar
 * (auch in eingebetteten externen iframes). Insbesondere gibt es KEINEN Setter für "Nur WLAN".
 * Alle Methoden laufen auf einem WebView-Hintergrundthread.
 */
class WebBridge(
    private val host: Host,
    private val coordinator: SyncCoordinator,
    private val tts: AppTts
) {
    interface Host {
        /** Aktiviert einen fertig geladenen Stand und lädt die Seite neu. */
        fun reloadContent()

        /** Öffnet den nativen Einstellungsdialog. */
        fun showSettings()

        /** "granted" | "denied" | "default" für die Notification-API der Spiele. */
        fun notificationState(): String

        /** Fragt die Benachrichtigungs-Berechtigung (ggf. per Dialog) und meldet das Ergebnis an die Seite. */
        fun requestNotifications()

        /** Zeigt eine lokale Benachrichtigung (nur wenn erlaubt). */
        fun showNotification(title: String, body: String, tag: String)
    }

    private var lastNotify = 0L

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

    @JavascriptInterface
    fun notifyState(): String = try { host.notificationState() } catch (e: Exception) { "denied" }

    @JavascriptInterface
    fun notifyRequest() {
        host.requestNotifications()
    }

    /** Die Brücke ist in jedem Frame sichtbar: Länge und Takt begrenzen, damit fremde Frames nicht fluten. */
    @JavascriptInterface
    fun notify(title: String?, body: String?, tag: String?) {
        val now = System.currentTimeMillis()
        if (now - lastNotify < 5000) return
        lastNotify = now
        host.showNotification((title ?: "").take(80), (body ?: "").take(240), (tag ?: "").take(40))
    }

    // ---------------------------------------------------------------- Sprachausgabe (speechSynthesis der Spiele, siehe NativeHtml)

    @JavascriptInterface
    fun ttsVoices(): String = try { tts.voicesJson() } catch (e: Exception) { "[]" }

    /** Länge begrenzt; id nur Buchstaben/Ziffern/_ (wird an die Seite zurückgemeldet). */
    @JavascriptInterface
    fun ttsSpeak(id: String?, text: String?, lang: String?, voice: String?, rate: Float, pitch: Float, volume: Float) {
        val safe = (id ?: "").filter { it.isLetterOrDigit() || it == '_' }.take(40)
        tts.speak(safe, (text ?: "").take(3500), (lang ?: "").take(20), (voice ?: "").take(120), rate, pitch, volume)
    }

    @JavascriptInterface
    fun ttsStop() {
        tts.stop()
    }
}
