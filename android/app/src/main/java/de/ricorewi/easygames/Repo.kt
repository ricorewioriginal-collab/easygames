package de.ricorewi.easygames

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import de.ricorewi.easygames.core.Game
import de.ricorewi.easygames.core.GameStatus
import de.ricorewi.easygames.core.HttpFetcher
import de.ricorewi.easygames.core.Library
import de.ricorewi.easygames.core.SyncCancelledException
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.File
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/** Ein Spiel mit Zustand für die Oberfläche. */
data class GameUi(val game: Game, val status: GameStatus, val cat: String, val cover: String)

data class UiState(
    val games: List<GameUi> = emptyList(),
    val refreshing: Boolean = false,
    val online: Boolean = true,
    val baseReady: Boolean = false,
    val busyId: String? = null,
    val done: Long = 0,
    val total: Long = 0,
    val queue: List<String> = emptyList(),
    val running: Set<String> = emptySet(),
    val autoUpdate: Boolean = true,
    val wifiOnly: Boolean = false,
    val disk: Long = 0,
    val appUpdate: AppUpdate.Info? = null,
) {
    fun find(id: String) = games.firstOrNull { it.game.id == id }
    val updates: List<GameUi> get() = games.filter { it.status.update }
    val progress: Float get() = if (total > 0) (done.toFloat() / total).coerceIn(0f, 1f) else 0f
}

/**
 * Verbindet die Bibliothek ([Library], reines Kotlin) mit der Oberfläche: Zustand als StateFlow, Meldungen als Events.
 * Netz- und Dateiarbeit läuft auf einem eigenen Thread, nacheinander (Abgleich, Installationen, Updates).
 */
class Repo(private val ctx: Context) {
    val library = Library(File(ctx.filesDir, "library"), HttpFetcher(userAgent = "easygames-app/" + BuildConfig.VERSION_NAME), BuildConfig.SYNC_BASE)
    private val prefs = ctx.getSharedPreferences("easygames", Context.MODE_PRIVATE)
    private val worker = Executors.newSingleThreadExecutor { r -> Thread(r, "easygames-repo").apply { isDaemon = true } }
    private val queue = ConcurrentLinkedQueue<String>()
    private var cancel: AtomicBoolean? = null
    private val running = HashSet<String>()
    @Volatile private var lastPublish = 0L
    @Volatile private var online = true
    @Volatile private var refreshing = false
    @Volatile private var busy: String? = null
    @Volatile private var done = 0L
    @Volatile private var total = 0L
    @Volatile private var appUpdate: AppUpdate.Info? = null
    private var cats: Map<String, String> = emptyMap()

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state
    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 8)
    val events: SharedFlow<String> = _events

    var wifiOnly: Boolean
        get() = prefs.getBoolean("wifi_only", false)
        set(v) { prefs.edit().putBoolean("wifi_only", v).apply(); EasyGamesApplication.schedule(ctx, v); publish() }

    var autoUpdate: Boolean
        get() = library.autoUpdate
        set(v) { library.autoUpdate = v; publish(); if (v) enqueueUpdates() }

    init { publish() }

    // ------------------------------------------------------------------ Abgleich

    /** Neue Spiele und Updates holen (beim Start, beim Zurückkehren in die App, manuell und im Hintergrund). */
    fun refresh(manual: Boolean = false) {
        if (refreshing) return
        refreshing = true
        publish()
        worker.execute {
            try {
                val r = library.refresh { publish() }
                online = r.online
                cats = Categories.load(library)
                if (r.newGames.isNotEmpty()) emit(if (r.newGames.size == 1) "Neues Spiel: " + short(r.newGames[0]) else "${r.newGames.size} neue Spiele: " + r.newGames.take(3).joinToString(", ") { short(it) })
                if (!r.online && manual) emit("Keine Verbindung – installierte Spiele laufen weiter.")
                if (r.online && manual && r.newGames.isEmpty() && r.updates.isEmpty()) emit("Alles aktuell.")
                if (r.updates.isNotEmpty() && !library.autoUpdate) emit("${r.updates.size} Update(s) verfügbar")
            } catch (e: Exception) {
                online = false
            } finally {
                refreshing = false
                publish()
                enqueueUpdates()
            }
            if (AppUpdate.enabled() && (manual || AppUpdate.due(ctx))) {
                val latest = AppUpdate.fetchLatest(ctx)
                if (latest != null && AppUpdate.isNewer(ctx, latest)) { appUpdate = latest; publish() }
                else if (manual && latest != null) emit("Die App ist auf dem neuesten Stand.")
            }
        }
    }

    private fun enqueueUpdates() {
        if (!library.autoUpdate) return
        if (wifiOnly && !onWifi()) return
        library.updates().filter { synchronized(running) { it.id !in running } }.forEach { install(it.id) }
    }

    private fun onWifi(): Boolean = try {
        val cm = ctx.getSystemService(ConnectivityManager::class.java)
        cm.getNetworkCapabilities(cm.activeNetwork)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED) == true
    } catch (e: Exception) { false }

    // ------------------------------------------------------------------ Installieren

    /** Installieren oder aktualisieren (Warteschlange, nacheinander). */
    fun install(id: String) {
        if (busy == id || queue.contains(id)) return
        queue.add(id)
        publish()
        worker.execute { runNext() }
    }

    private fun runNext() {
        val id = queue.poll() ?: return
        val g = library.find(id) ?: return
        if (synchronized(running) { id in running }) { emit(short(g) + " läuft gerade – Update nach dem Beenden."); return }
        val c = AtomicBoolean(false)
        cancel = c
        busy = id; done = 0; total = 0
        publish()
        try {
            val wasInstalled = library.status(g).installed
            library.install(id, c) { d, t -> done = d; total = t; publishThrottled() }
            emit(short(g) + if (wasInstalled) " ist aktuell." else " ist installiert.")
        } catch (e: SyncCancelledException) {
        } catch (e: Exception) {
            emit(short(g) + ": " + (e.message ?: "Download fehlgeschlagen") + if (!online) " (offline)" else "")
        } finally {
            busy = null; cancel = null
            publish()
        }
    }

    fun cancel(id: String) {
        if (busy == id) cancel?.set(true) else if (queue.remove(id)) publish()
    }

    fun uninstall(id: String) {
        worker.execute {
            val g = library.find(id) ?: return@execute
            val users = library.uninstall(id)
            if (users.isNotEmpty()) emit(short(g) + " wird noch von " + users.joinToString(", ") + " gebraucht und bleibt installiert.")
            else emit(short(g) + " wurde entfernt. Spielstände bleiben erhalten.")
            publish()
        }
    }

    // ------------------------------------------------------------------ Laufende Spiele

    fun gameStarted(id: String) { synchronized(running) { running += id }; publish() }

    fun gameEnded(id: String, seconds: Long) {
        synchronized(running) { running -= id }
        worker.execute {
            library.addPlayTime(id, seconds)
            publish()
            enqueueUpdates()
        }
    }

    fun dismissAppUpdate() {
        appUpdate?.let { AppUpdate.dismiss(ctx, it) }
        appUpdate = null
        publish()
    }

    // ------------------------------------------------------------------ Zustand

    private fun publishThrottled() {
        val now = System.currentTimeMillis()
        if (now - lastPublish < 200) return
        publish()
    }

    @Synchronized fun publish() {
        lastPublish = System.currentTimeMillis()
        if (cats.isEmpty() && library.baseReady) cats = Categories.load(library)
        val games = library.games.map { g ->
            val thumb = "thumbs/${g.id}.webp"
            // Kartenbild erst, wenn es da ist (sonst Farbe + Symbol; ein neuer Pfad lädt das Bild dann nach)
            val cover = if (library.open(thumb) != null) thumb else if (library.open(g.img) != null) g.img else ""
            GameUi(g, library.status(g), cats[g.id] ?: "mehr", cover)
        }
        _state.value = UiState(
            games = games,
            refreshing = refreshing,
            online = online,
            baseReady = library.baseReady,
            busyId = busy,
            done = done,
            total = total,
            queue = queue.toList(),
            running = synchronized(running) { running.toSet() },
            autoUpdate = library.autoUpdate,
            wifiOnly = wifiOnly,
            disk = library.diskBytes,
            appUpdate = appUpdate?.takeUnless { AppUpdate.dismissed(ctx, it) },
        )
    }

    private fun emit(msg: String) { _events.tryEmit(msg) }

    companion object {
        fun short(g: Game): String = g.title.substringBefore(" – ").trim()
    }
}
