package de.ricorewi.easygames.core

import java.io.FileOutputStream
import java.io.IOException
import java.net.ConnectException
import java.net.NoRouteToHostException
import java.net.URLEncoder
import java.net.UnknownHostException
import java.security.DigestOutputStream
import java.util.concurrent.Callable
import java.util.concurrent.ExecutionException
import java.util.concurrent.ExecutorCompletionService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.locks.ReentrantLock

/** Fortschritt eines Syncs (Dateien/Bytes des Deltas). */
data class SyncProgress(val filesDone: Int, val filesTotal: Int, val bytesDone: Long, val bytesTotal: Long)

sealed class SyncResult {
    /** Nichts zu tun. */
    object UpToDate : SyncResult()

    /** Neuer Stand vollständig geladen (pending oder, mit autoCommit, aktiv). */
    data class Updated(val version: String, val files: Int, val bytes: Long) : SyncResult()

    /** Fehlgeschlagen; der aktive Stand ist unverändert. `offline` = keine Verbindung zum Server. */
    data class Failed(val reason: String, val cancelled: Boolean = false, val offline: Boolean = false) : SyncResult()
}

/** Abbruch-Schalter, thread-sicher. */
class CancelToken {
    @Volatile
    var isCancelled: Boolean = false
        private set

    fun cancel() {
        isCancelled = true
    }

    fun throwIfCancelled() {
        if (isCancelled) throw SyncCancelledException()
    }
}

/**
 * @param parallelism gleichzeitige Downloads
 * @param maxAttempts Versuche pro Datei bzw. Manifest-Abruf (inkl. erstem Versuch)
 * @param backoffBaseMs Wartezeit vor dem 2. Versuch; verdoppelt sich je Versuch
 * @param autoCommit nach vollständigem Download sofort aktivieren (sonst bleibt der Stand `pending`)
 */
class SyncConfig(
    val parallelism: Int = 4,
    val maxAttempts: Int = 3,
    val backoffBaseMs: Long = 1_000,
    val autoCommit: Boolean = false
)

/**
 * Sync-Engine: Manifest holen, Delta berechnen, fehlende Dateien geprüft (Größe + SHA-256) in den Store laden,
 * erst wenn ALLES da ist den Stand als `pending` ablegen. [commit] schaltet atomar um und räumt danach auf.
 * Alle Dateien sind unveränderlich, ein halber Zustand ist daher nie sichtbar.
 *
 * Es läuft nie mehr als ein Sync gleichzeitig (Sperre). Der Fortschritts-Callback kommt gedrosselt, aber von
 * beliebigen Threads (seriell, nie gleichzeitig).
 */
class SyncEngine(
    private val store: ContentStore,
    private val fetcher: Fetcher,
    baseUrl: String,
    private val config: SyncConfig = SyncConfig()
) {
    private val base = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
    private val manifestUrl = base + "sync/manifest.json"
    private val lock = ReentrantLock()

    fun hasPending(): Boolean = store.hasPending()

    /** Prüft auf Updates und lädt sie vollständig herunter. Blockierend – nie auf dem Hauptthread aufrufen. */
    fun download(cancel: CancelToken = CancelToken(), onProgress: ((SyncProgress) -> Unit)? = null): SyncResult {
        if (!lock.tryLock()) return SyncResult.Failed("Synchronisation läuft bereits")
        try {
            return doDownload(cancel, onProgress)
        } catch (e: SyncCancelledException) {
            return SyncResult.Failed("Abgebrochen", cancelled = true)
        } catch (e: IOException) {
            return SyncResult.Failed(describe(e), offline = isOffline(e))
        } catch (e: ManifestException) {
            return SyncResult.Failed("Manifest ungültig: ${e.message}")
        } finally {
            lock.unlock()
        }
    }

    /**
     * Aktiviert den fertig geladenen Stand (falls vorhanden) und löscht danach nicht mehr benötigte Dateien.
     * Gibt true zurück, wenn aktiviert wurde. Läuft gerade ein Download, passiert nichts (false).
     */
    fun commit(): Boolean {
        if (!lock.tryLock()) return false
        try {
            return commitLocked()
        } catch (e: IOException) {
            return false
        } finally {
            lock.unlock()
        }
    }

    private fun commitLocked(): Boolean {
        store.commitPending() ?: return false
        store.gc()
        return true
    }

    // ------------------------------------------------------------------------------------------

    private class Run(
        val cancel: CancelToken,
        val onProgress: ((SyncProgress) -> Unit)?,
        val filesTotal: Int,
        val bytesTotal: Long,
        filesDone0: Int,
        bytesDone0: Long
    ) {
        val aborted = AtomicBoolean(false)
        val bytesDone = AtomicLong(bytesDone0)
        val filesDone = AtomicInteger(filesDone0)
        private val lastEmit = AtomicLong(0)
        private val emitLock = Any()

        fun check() {
            cancel.throwIfCancelled()
            if (aborted.get()) throw SyncCancelledException()
        }

        fun emit(force: Boolean) {
            val cb = onProgress ?: return
            val now = System.nanoTime()
            val last = lastEmit.get()
            if (!force && (now - last < 100_000_000L || !lastEmit.compareAndSet(last, now))) return
            synchronized(emitLock) {
                lastEmit.set(now)
                cb(SyncProgress(filesDone.get(), filesTotal, bytesDone.get(), bytesTotal))
            }
        }
    }

    private fun doDownload(cancel: CancelToken, onProgress: ((SyncProgress) -> Unit)?): SyncResult {
        cancel.throwIfCancelled()
        store.cleanTmp()
        val pendingManifest = store.loadPending()
        val known = pendingManifest ?: store.activeManifest
        val hasState = store.hasCurrent() || pendingManifest != null
        val sentEtag = if (hasState) store.readEtag() else null

        val resp = retrying(cancel::throwIfCancelled) { fetcher.getManifest(manifestUrl, sentEtag) }
        if (resp.notModified) return SyncResult.UpToDate
        val text = resp.text ?: return SyncResult.Failed("Leere Antwort vom Server")
        val remote = try {
            Manifest.parse(text)
        } catch (e: ManifestException) {
            return SyncResult.Failed("Manifest ungültig: ${e.message}")
        }

        if (known != null && known.version == remote.version && remote.files.all { store.isAvailable(it) }) {
            if (hasState && resp.etag != null) store.writeEtag(resp.etag)
            return SyncResult.UpToDate
        }

        // Delta: je eindeutigem Hash nur eine Datei; Baseline (Pfad+Hash) und aktiver Stand zählen als vorhanden.
        val activeHashes = HashSet<String>()
        store.activeManifest?.files?.forEach { activeHashes.add(it.h) }
        val toDownload = ArrayList<FileEntry>()
        val seen = HashSet<String>()
        var filesDone0 = 0
        var bytesDone0 = 0L
        var filesTotal = 0
        var bytesTotal = 0L
        for (e in remote.files) {
            if (store.baselineCovers(e) || !seen.add(e.h)) continue
            if (store.hasInStore(e.h)) {
                if (e.h in activeHashes) continue            // Teil des aktiven Stands, gehört nicht zum Delta
                filesDone0++; bytesDone0 += e.s              // Wiederaufnahme: schon geladen
            } else {
                toDownload.add(e)
            }
            filesTotal++; bytesTotal += e.s
        }

        val run = Run(cancel, onProgress, filesTotal, bytesTotal, filesDone0, bytesDone0)
        run.emit(true)
        downloadAll(run, toDownload)
        run.check()

        // Alles vorhanden: Stand ablegen (erst jetzt!), ETag erst jetzt merken.
        store.writePending(text)
        store.writeEtag(resp.etag)
        run.emit(true)
        if (config.autoCommit) commitLocked()
        return SyncResult.Updated(remote.version, filesTotal, bytesTotal)
    }

    private fun downloadAll(run: Run, files: List<FileEntry>) {
        if (files.isEmpty()) return
        val pool = Executors.newFixedThreadPool(minOf(config.parallelism.coerceAtLeast(1), files.size)) { r ->
            Thread(r, "easygames-sync").apply { isDaemon = true }
        }
        val cs = ExecutorCompletionService<Unit>(pool)
        var firstError: Throwable? = null
        var finished = false
        try {
            for (e in files) cs.submit(Callable { fetchFile(run, e) })
            for (i in files.indices) {
                try {
                    cs.take().get()
                } catch (ex: ExecutionException) {
                    val cause = ex.cause ?: ex
                    if (firstError == null && cause !is SyncCancelledException) firstError = cause
                    run.aborted.set(true)
                    if (cause !is SyncCancelledException) break
                } catch (ex: InterruptedException) {
                    Thread.currentThread().interrupt()
                    throw SyncCancelledException()
                }
            }
            finished = firstError == null && !run.aborted.get()
        } finally {
            if (!finished) run.aborted.set(true)   // verbleibende Worker stoppen beim nächsten Block
            pool.shutdownNow()
            try {
                pool.awaitTermination(10, TimeUnit.SECONDS)
            } catch (ex: InterruptedException) {
                Thread.currentThread().interrupt()
            }
        }
        val err = firstError
        if (err != null) {
            if (err is IOException) throw err
            if (err is RuntimeException) throw err
            throw IOException(err.message, err)
        }
        // Wurde der Lauf ohne echten Fehler abgebrochen (Cancel), meldet das der Aufrufer über run.check().
        run.cancel.throwIfCancelled()
    }

    /** Lädt eine Datei, prüft Größe + SHA-256 und legt sie atomar im Store ab. */
    private fun fetchFile(run: Run, e: FileEntry) {
        val url = base + encodePath(e.p)
        retrying(run::check) {
            val tmp = store.newTmpFile()
            var attemptBytes = 0L
            try {
                val digest = Hashing.newDigest()
                DigestOutputStream(FileOutputStream(tmp), digest).use { out ->
                    fetcher.download(url, out) { n ->
                        run.check()
                        attemptBytes += n
                        if (attemptBytes > e.s) throw VerificationException("Datei größer als im Manifest: ${e.p}")
                        run.bytesDone.addAndGet(n.toLong())
                        run.emit(false)
                    }
                }
                if (attemptBytes != e.s) throw VerificationException("Falsche Größe bei ${e.p}: $attemptBytes statt ${e.s}")
                if (Hashing.toHex(digest.digest()) != e.h) throw VerificationException("Prüfsumme stimmt nicht: ${e.p}")
                run.check()
                store.putFromTmp(tmp, e.h)
                run.filesDone.incrementAndGet()
                run.emit(true)
            } catch (t: Throwable) {
                run.bytesDone.addAndGet(-attemptBytes)       // Fortschritt dieses Versuchs zurücknehmen
                throw t
            } finally {
                tmp.delete()                                  // nach erfolgreichem Verschieben ist sie schon weg
            }
        }
    }

    /** Fehlgeschlagene Prüfung (Größe/Hash). Wird wiederholt, weil CDNs kurz veraltete Dateien liefern können. */
    private class VerificationException(message: String) : IOException(message)

    private fun <T> retrying(check: () -> Unit, block: () -> T): T {
        var attempt = 0
        while (true) {
            check()
            try {
                return block()
            } catch (e: IOException) {
                attempt++
                if (!isRetryable(e) || attempt >= config.maxAttempts) throw e
                sleepChecked(config.backoffBaseMs shl (attempt - 1).coerceAtMost(10), check)
            }
        }
    }

    private fun sleepChecked(totalMs: Long, check: () -> Unit) {
        var left = totalMs
        while (left > 0) {
            check()
            val slice = minOf(left, 50L)
            try {
                Thread.sleep(slice)
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
                throw SyncCancelledException()
            }
            left -= slice
        }
    }

    private fun isRetryable(e: IOException): Boolean = when {
        isOffline(e) -> false                      // ohne Netz sofort aufgeben, nicht lange warten
        e is InsecureUrlException -> false
        e is HttpStatusException -> e.code == 408 || e.code == 425 || e.code == 429 || e.code >= 500
        else -> true
    }

    private fun isOffline(e: Throwable): Boolean {
        var t: Throwable? = e
        var depth = 0
        while (t != null && depth++ < 5) {
            if (t is UnknownHostException || t is NoRouteToHostException || t is ConnectException) return true
            t = t.cause
        }
        return false
    }

    private fun describe(e: IOException): String = when {
        isOffline(e) -> "Keine Verbindung zum Server"
        e is HttpStatusException -> "Server antwortete mit HTTP ${e.code}"
        else -> e.message ?: e.javaClass.simpleName
    }

    companion object {
        /** Pfadsegmente URL-kodieren, "/" bleibt erhalten. */
        fun encodePath(p: String): String =
            p.split('/').joinToString("/") { URLEncoder.encode(it, "UTF-8").replace("+", "%20") }
    }
}
