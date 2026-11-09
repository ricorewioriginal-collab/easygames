package de.ricorewi.easygames

import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * JS-Brücke `EasyGamesApp` für Spiele und Seiten (Sprachausgabe, Benachrichtigungen, App-Infos).
 * Bewusst nur harmlose Methoden, denn sie ist in jedem Frame sichtbar. Alle Methoden laufen auf einem WebView-Hintergrundthread.
 */
class WebBridge(
    private val host: Host,
    private val repo: Repo,
    /** Sprachausgabe erst beim ersten Gebrauch starten. */
    private val tts: () -> AppTts
) {
    interface Host {
        fun reloadContent()
        fun showSettings()
        /** "granted" | "denied" | "default" für die Notification-API der Spiele. */
        fun notificationState(): String
        fun requestNotifications()
        fun showNotification(title: String, body: String, tag: String)
    }

    private var lastNotify = 0L

    @JavascriptInterface
    fun getInfo(): String = try {
        val s = repo.state.value
        JSONObject().put("app", true).put("native", true).put("version", BuildConfig.VERSION_NAME)
            .put("online", s.online).put("games", s.games.size).put("installed", s.games.count { it.status.installed }).toString()
    } catch (e: Exception) {
        "{\"app\":true}"
    }

    @JavascriptInterface
    fun syncNow() = repo.refresh(manual = true)

    @JavascriptInterface
    fun reload() = host.reloadContent()

    @JavascriptInterface
    fun openSettings() = host.showSettings()

    @JavascriptInterface
    fun notifyState(): String = try { host.notificationState() } catch (e: Exception) { "denied" }

    @JavascriptInterface
    fun notifyRequest() = host.requestNotifications()

    /** Länge und Takt begrenzt, damit fremde Frames nicht fluten. */
    @JavascriptInterface
    fun notify(title: String?, body: String?, tag: String?) {
        val now = System.currentTimeMillis()
        if (now - lastNotify < 5000) return
        lastNotify = now
        host.showNotification((title ?: "").take(80), (body ?: "").take(240), (tag ?: "").take(40))
    }

    // ---------------------------------------------------------------- Sprachausgabe (speechSynthesis der Spiele, siehe NativeHtml)

    @JavascriptInterface
    fun ttsVoices(): String = try { tts().voicesJson() } catch (e: Exception) { "[]" }

    /** Länge begrenzt; id nur Buchstaben/Ziffern/_ (wird an die Seite zurückgemeldet). */
    @JavascriptInterface
    fun ttsSpeak(id: String?, text: String?, lang: String?, voice: String?, rate: Float, pitch: Float, volume: Float) {
        val safe = (id ?: "").filter { it.isLetterOrDigit() || it == '_' }.take(40)
        tts().speak(safe, (text ?: "").take(3500), (lang ?: "").take(20), (voice ?: "").take(120), rate, pitch, volume)
    }

    @JavascriptInterface
    fun ttsStop() = tts().stop()
}
