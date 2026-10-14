package de.ricorewi.easygames

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.SystemClock
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.WorkManager
import de.ricorewi.easygames.core.CancelToken
import de.ricorewi.easygames.core.ContentStore
import de.ricorewi.easygames.core.SyncEngine
import de.ricorewi.easygames.core.SyncProgress
import de.ricorewi.easygames.core.SyncResult
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Steuert den Sync der App: Zustand (für UI und JS-Brücke), Netz-Regeln (WLAN/Mobilfunk),
 * Auslöser (App-Start, Netzwerk-Callback, manuell, WorkManager) und nie zwei Syncs gleichzeitig.
 * Thread-sicher; Listener werden auf beliebigen Threads aufgerufen.
 */
class SyncCoordinator(
    private val app: Application,
    val store: ContentStore,
    private val engine: SyncEngine
) {
    enum class State(val wire: String) {
        IDLE("idle"), CHECKING("checking"), DOWNLOADING("downloading"),
        READY("ready"), ERROR("error"), OFFLINE("offline")
    }

    enum class Trigger { APP_START, NETWORK, MANUAL }

    private enum class Net { NONE, METERED, UNMETERED }

    class Snapshot(
        val state: State,
        val progress: Double,
        val bytesDone: Long,
        val bytesTotal: Long,
        val pending: Boolean,
        val lastCheckMs: Long,
        val error: String?
    )

    private val prefs: SharedPreferences = app.getSharedPreferences("easygames", Context.MODE_PRIVATE)
    private val running = AtomicBoolean(false)
    private val listeners = CopyOnWriteArrayList<() -> Unit>()

    // Zwei getrennte Threads: Sync darf lange laufen, Commit/Reload nicht dahinter warten.
    private val syncExecutor = Executors.newSingleThreadExecutor { r -> Thread(r, "eg-sync").apply { isDaemon = true } }
    private val ioExecutor = Executors.newSingleThreadExecutor { r -> Thread(r, "eg-io").apply { isDaemon = true } }

    @Volatile private var pendingFlag: Boolean = engine.hasPending()
    @Volatile private var lastAttemptMs: Long = 0L
    @Volatile private var lastProgressPublishMs: Long = 0L
    @Volatile private var current: Snapshot = Snapshot(
        if (pendingFlag) State.READY else State.IDLE, 0.0, 0L, 0L, pendingFlag, prefs.getLong(KEY_LAST_CHECK, 0L), null
    )
    private var netCallback: ConnectivityManager.NetworkCallback? = null

    // ------------------------------------------------------------------ Zustand / Einstellungen

    fun snapshot(): Snapshot = current

    /** "Nur im WLAN aktualisieren" – Standard AN. Nur über den nativen Dialog änderbar. */
    var wifiOnly: Boolean
        get() = prefs.getBoolean(KEY_WIFI_ONLY, true)
        set(value) {
            prefs.edit().putBoolean(KEY_WIFI_ONLY, value).apply()
            schedulePeriodic()
            scheduleCatchUp(replace = true)
            requestSync(Trigger.MANUAL)
            notifyListeners()
        }

    fun addListener(l: () -> Unit) {
        listeners.add(l)
    }

    fun removeListener(l: () -> Unit) {
        listeners.remove(l)
    }

    private fun notifyListeners() {
        for (l in listeners) {
            try {
                l()
            } catch (e: Exception) {
                Log.w(TAG, "Listener-Fehler", e)
            }
        }
    }

    private fun publish(state: State, progress: Double, done: Long, total: Long, error: String?) {
        current = Snapshot(state, progress, done, total, pendingFlag, prefs.getLong(KEY_LAST_CHECK, 0L), error)
        notifyListeners()
    }

    /** JSON für `EasyGamesApp.getInfo()`. */
    fun infoJson(): String {
        val s = current
        val m = store.activeManifest
        val o = JSONObject()
        o.put("app", true)
        o.put("appVersion", BuildConfig.VERSION_NAME)
        o.put("contentVersion", m?.version ?: "")
        o.put("contentDate", m?.generated ?: "")
        o.put("lastCheck", if (s.lastCheckMs > 0) iso(s.lastCheckMs) else JSONObject.NULL)
        o.put("state", s.state.wire)
        o.put("progress", if (s.progress.isNaN()) 0.0 else s.progress)
        o.put("bytesDone", s.bytesDone)
        o.put("bytesTotal", s.bytesTotal)
        o.put("pending", s.pending)
        o.put("wifiOnly", wifiOnly)
        o.put("error", s.error ?: JSONObject.NULL)
        return o.toString()
    }

    // ------------------------------------------------------------------ Auslöser

    /** Beim App-Start: periodischen Job sicherstellen und sofort einen Versuch starten. */
    fun onAppStart() {
        schedulePeriodic()
        requestSync(Trigger.APP_START)
    }

    /**
     * Startet (wenn erlaubt) einen Sync im Hintergrund. Ist keine passende Verbindung da, wird der Zustand
     * entsprechend gesetzt und ein Einmal-Job vorgemerkt, der läuft, sobald WLAN verfügbar ist.
     */
    fun requestSync(trigger: Trigger) {
        val now = SystemClock.elapsedRealtime()
        if (trigger == Trigger.NETWORK && current.state != State.OFFLINE && current.state != State.ERROR &&
            lastAttemptMs != 0L && now - lastAttemptMs < NETWORK_RETRY_MS) return
        val net = networkStatus()
        if (net == Net.NONE) {
            setBlocked(null)
            scheduleCatchUp()
            return
        }
        if (net == Net.METERED && wifiOnly) {
            setBlocked(app.getString(R.string.boot_wait_wifi))
            scheduleCatchUp()
            return
        }
        if (running.get()) return
        lastAttemptMs = now
        syncExecutor.execute { runSyncBlocking(CancelToken()) }
    }

    private fun setBlocked(message: String?) {
        if (running.get()) return
        if (pendingFlag) return                // "Update bereit" ist wichtiger als "offline"
        publish(State.OFFLINE, 0.0, 0L, 0L, message)
    }

    /**
     * Führt einen Sync auf dem aufrufenden Thread aus (blockierend). Gibt null zurück, wenn bereits einer läuft.
     * Wird vom Executor und vom WorkManager-Worker genutzt.
     */
    fun runSyncBlocking(cancel: CancelToken): SyncResult? {
        if (!running.compareAndSet(false, true)) return null
        try {
            lastAttemptMs = SystemClock.elapsedRealtime()
            publish(State.CHECKING, 0.0, 0L, 0L, null)
            val result = engine.download(cancel) { p -> onProgress(p) }
            pendingFlag = engine.hasPending()
            when (result) {
                is SyncResult.UpToDate -> {
                    markChecked()
                    publishIdleOrReady()
                }
                is SyncResult.Updated -> {
                    markChecked()
                    // Erststart ohne jeden Inhalt: sofort aktivieren, es läuft ja noch kein Spiel.
                    if (store.activeManifest == null) {
                        engine.commit()
                        pendingFlag = engine.hasPending()
                    }
                    publishIdleOrReady()
                }
                is SyncResult.Failed -> {
                    when {
                        result.cancelled -> publishIdleOrReady()
                        result.offline -> {
                            publish(if (pendingFlag) State.READY else State.OFFLINE, 0.0, 0L, 0L, null)
                            scheduleCatchUp()
                        }
                        else -> {
                            publish(if (pendingFlag) State.READY else State.ERROR, 0.0, 0L, 0L, result.reason)
                            scheduleCatchUp()
                        }
                    }
                }
            }
            return result
        } finally {
            running.set(false)
        }
    }

    private fun onProgress(p: SyncProgress) {
        val now = SystemClock.elapsedRealtime()
        val last = p.bytesDone >= p.bytesTotal
        if (!last && now - lastProgressPublishMs < PROGRESS_INTERVAL_MS) return
        lastProgressPublishMs = now
        val fraction = if (p.bytesTotal > 0) p.bytesDone.toDouble() / p.bytesTotal.toDouble() else 0.0
        publish(State.DOWNLOADING, fraction.coerceIn(0.0, 1.0), p.bytesDone, p.bytesTotal, null)
    }

    private fun publishIdleOrReady() {
        val s = current
        publish(if (pendingFlag) State.READY else State.IDLE, if (pendingFlag) 1.0 else 0.0, s.bytesDone, s.bytesTotal, null)
    }

    private fun markChecked() {
        prefs.edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply()
    }

    /** Führt Arbeit mit Dateizugriff abseits des Hauptthreads aus (Commit beim Start, Reload). */
    fun runInBackground(block: () -> Unit) {
        ioExecutor.execute {
            try {
                block()
            } catch (e: Exception) {
                Log.w(TAG, "Hintergrundaufgabe fehlgeschlagen", e)
            }
        }
    }

    /** Aktiviert einen fertig geladenen Stand (falls vorhanden). Blockierend, nicht auf dem Hauptthread. */
    fun commitPendingIfAny(): Boolean {
        val done = engine.commit()
        pendingFlag = engine.hasPending()
        if (done) publish(State.IDLE, 0.0, 0L, 0L, null)
        return done
    }

    // ------------------------------------------------------------------ Netz

    private fun networkStatus(): Net {
        val cm = app.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return Net.NONE
        val network = cm.activeNetwork ?: return Net.NONE
        val caps = cm.getNetworkCapabilities(network) ?: return Net.NONE
        if (!caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) ||
            !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)) return Net.NONE
        return if (caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)) Net.UNMETERED else Net.METERED
    }

    /** Solange die App sichtbar ist: bei einer erlaubten, validierten Verbindung synchronisieren. */
    @Synchronized
    fun startNetworkWatch() {
        if (netCallback != null) return
        val cm = app.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        val cb = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
                if (!caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)) return
                requestSync(Trigger.NETWORK)
            }
        }
        try {
            cm.registerDefaultNetworkCallback(cb)
            netCallback = cb
        } catch (e: RuntimeException) {
            Log.w(TAG, "Netzwerk-Callback nicht registrierbar", e)
        }
    }

    @Synchronized
    fun stopNetworkWatch() {
        val cb = netCallback ?: return
        netCallback = null
        val cm = app.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        try {
            cm.unregisterNetworkCallback(cb)
        } catch (e: IllegalArgumentException) {
            // war nicht (mehr) registriert
        }
    }

    // ------------------------------------------------------------------ WorkManager

    private fun schedulePeriodic() {
        try {
            WorkManager.getInstance(app).enqueueUniquePeriodicWork(
                WORK_PERIODIC, ExistingPeriodicWorkPolicy.UPDATE, SyncWorker.periodicRequest(wifiOnly)
            )
        } catch (e: IllegalStateException) {
            Log.w(TAG, "WorkManager nicht verfügbar", e)
        }
    }

    /** Einmal-Job (eindeutig, KEEP): läuft, sobald WLAN verbunden ist, auch wenn die App geschlossen ist. */
    private fun scheduleCatchUp(replace: Boolean = false) {
        try {
            WorkManager.getInstance(app).enqueueUniqueWork(
                WORK_CATCHUP, if (replace) ExistingWorkPolicy.REPLACE else ExistingWorkPolicy.KEEP, SyncWorker.oneTimeRequest(wifiOnly)
            )
        } catch (e: IllegalStateException) {
            Log.w(TAG, "WorkManager nicht verfügbar", e)
        }
    }

    companion object {
        private const val TAG = "EasyGamesSync"
        private const val KEY_WIFI_ONLY = "wifiOnly"
        private const val KEY_LAST_CHECK = "lastCheck"
        private const val WORK_PERIODIC = "easygames-periodic"
        private const val WORK_CATCHUP = "easygames-catchup"
        private const val NETWORK_RETRY_MS = 5 * 60_000L
        private const val PROGRESS_INTERVAL_MS = 250L

        /** ISO-8601 in UTC, ohne java.time (minSdk 24). */
        fun iso(ms: Long): String {
            val f = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
            f.timeZone = TimeZone.getTimeZone("UTC")
            return f.format(Date(ms))
        }
    }
}
