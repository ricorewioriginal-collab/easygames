package de.ricorewi.easygames.core

import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream

/** Eine geöffnete Datei aus dem Inhaltsspeicher. Der Aufrufer schließt `stream`. */
class Content(val stream: InputStream, val length: Long, val mime: String)

/**
 * Inhaltsadressierter Speicher.
 *
 * Aufbau unter `root`:
 *  - `store/<sha256>`  unveränderliche, geprüfte Dateien
 *  - `current.json`    Kopie des aktiven Manifests (atomar ersetzt)
 *  - `pending.json`    vollständig geladener, aber noch nicht aktivierter Stand
 *  - `etag.txt`        ETag des Manifests, das zu pending/current gehört
 *  - `tmp/`            Arbeitsdateien (Downloads, Schreibpuffer)
 *
 * Ohne `current.json` ist das Baseline-Manifest (falls vorhanden) das aktive Manifest.
 * Hinweis: Es wird bewusst kein java.nio.file verwendet (Android minSdk 24); `File.renameTo` ist auf
 * Android/Linux ein atomares rename(2), das ein vorhandenes Ziel ersetzt. tmp/ liegt im selben Dateisystem.
 */
class ContentStore(private val root: File, private val baseline: BaselineSource? = null) {
    private val storeDir = File(root, "store")
    private val tmpDir = File(root, "tmp")
    private val currentFile = File(root, "current.json")
    private val pendingFile = File(root, "pending.json")
    private val etagFile = File(root, "etag.txt")

    @Volatile
    private var active: Manifest?

    init {
        storeDir.mkdirs()
        tmpDir.mkdirs()
        active = loadActive()
    }

    /** Aktives Manifest (aktueller Stand oder Baseline); null, wenn noch gar kein Inhalt vorhanden ist. */
    val activeManifest: Manifest? get() = active

    /** Gibt es einen per Sync aktivierten Stand (current.json)? */
    fun hasCurrent(): Boolean = currentFile.isFile

    fun hasPending(): Boolean = pendingFile.isFile

    private fun loadActive(): Manifest? {
        if (currentFile.isFile) {
            try {
                return Manifest.parse(currentFile.readText(Charsets.UTF_8))
            } catch (e: ManifestException) {
                currentFile.delete()          // beschädigt -> verwerfen, auf Baseline zurückfallen
            } catch (e: IOException) {
                currentFile.delete()
            }
        }
        return baseline?.manifest
    }

    // ---------------------------------------------------------------- Lesen

    /** Öffnet eine Datei nach Manifest-Pfad (nur aktives Manifest). Unbekannte Pfade ergeben null. */
    fun open(path: String): Content? {
        val entry = active?.fileFor(path) ?: return null
        val f = storeFile(entry.h)
        if (f.isFile) {
            try {
                return Content(FileInputStream(f), f.length(), Mime.forPath(path))
            } catch (e: IOException) {
                // fällt auf Baseline zurück
            }
        }
        val b = baseline
        if (b != null && b.covers(entry)) {
            val s = b.open(path)
            if (s != null) return Content(s, entry.s, Mime.forPath(path))
        }
        return null
    }

    /** Löst eine externe URL über die Vendor-Map des aktiven Manifests auf einen lokalen Pfad auf. */
    fun resolveVendor(url: String): String? = active?.vendorPath(url)

    /** Ist die Datei lokal vorhanden (Store mit passendem Hash oder Baseline mit Pfad+Hash)? */
    fun isAvailable(entry: FileEntry): Boolean = hasInStore(entry.h) || baselineCovers(entry)

    fun baselineCovers(entry: FileEntry): Boolean = baseline?.covers(entry) == true

    fun hasInStore(hash: String): Boolean = storeFile(hash).isFile

    private fun storeFile(hash: String): File {
        require(hash.length == 64 && hash.all { it in '0'..'9' || it in 'a'..'f' }) { "Ungültiger Hash" }
        return File(storeDir, hash)
    }

    // ---------------------------------------------------------------- Schreiben

    fun newTmpFile(): File {
        tmpDir.mkdirs()
        return File.createTempFile("dl", ".part", tmpDir)
    }

    /** Löscht übrig gebliebene Arbeitsdateien (nur aufrufen, wenn kein Sync läuft). */
    fun cleanTmp() {
        tmpDir.listFiles()?.forEach { it.delete() }
    }

    /** Verschiebt eine bereits geprüfte Datei atomar in den Store (idempotent). */
    fun putFromTmp(tmp: File, hash: String) {
        val dest = storeFile(hash)
        if (dest.isFile) {
            tmp.delete()
            return
        }
        storeDir.mkdirs()
        if (!tmp.renameTo(dest) && !dest.isFile) throw IOException("Datei konnte nicht in den Store verschoben werden")
    }

    /** Schreibt Bytes atomar (tmp + rename). */
    private fun writeAtomic(target: File, bytes: ByteArray) {
        val tmp = File(tmpDir, target.name + ".new-" + System.nanoTime())
        try {
            FileOutputStream(tmp).use { out ->
                out.write(bytes)
                out.fd.sync()
            }
            if (!tmp.renameTo(target)) throw IOException("Umbenennen von ${target.name} fehlgeschlagen")
        } finally {
            tmp.delete()   // existiert nach erfolgreichem rename nicht mehr
        }
    }

    // ---------------------------------------------------------------- Pending / Commit

    @Synchronized
    fun writePending(rawManifest: String) = writeAtomic(pendingFile, rawManifest.toByteArray(Charsets.UTF_8))

    @Synchronized
    fun loadPending(): Manifest? {
        if (!pendingFile.isFile) return null
        return try {
            Manifest.parse(pendingFile.readText(Charsets.UTF_8))
        } catch (e: ManifestException) {
            pendingFile.delete(); null
        } catch (e: IOException) {
            pendingFile.delete(); null
        }
    }

    /**
     * Aktiviert den fertig geladenen Stand: pending.json ersetzt atomar current.json.
     * Gibt das neue aktive Manifest zurück oder null, wenn nichts (Vollständiges) ansteht.
     */
    @Synchronized
    fun commitPending(): Manifest? {
        val m = loadPending() ?: return null
        if (!m.files.all { isAvailable(it) }) {          // Dateien verschwunden -> Stand verwerfen
            pendingFile.delete()
            etagFile.delete()
            return null
        }
        if (!pendingFile.renameTo(currentFile)) throw IOException("current.json konnte nicht ersetzt werden")
        active = m
        return m
    }

    /** Direkt aktivieren (z. B. Erststart ohne Baseline): schreibt pending und committet. */
    @Synchronized
    fun activate(rawManifest: String): Manifest? {
        writePending(rawManifest)
        return commitPending()
    }

    // ---------------------------------------------------------------- ETag

    @Synchronized
    fun readEtag(): String? =
        try { if (etagFile.isFile) etagFile.readText(Charsets.UTF_8).trim().ifEmpty { null } else null }
        catch (e: IOException) { null }

    @Synchronized
    fun writeEtag(etag: String?) {
        if (etag == null) etagFile.delete() else writeAtomic(etagFile, etag.toByteArray(Charsets.UTF_8))
    }

    // ---------------------------------------------------------------- Aufräumen

    /**
     * Löscht Store-Dateien, die weder vom aktiven noch vom ausstehenden Manifest referenziert werden.
     * Nur nach erfolgreichem Commit aufrufen. Gibt die Anzahl gelöschter Dateien zurück.
     */
    @Synchronized
    fun gc(): Int {
        val keep = HashSet<String>()
        active?.files?.forEach { keep.add(it.h) }
        loadPending()?.files?.forEach { keep.add(it.h) }
        var removed = 0
        storeDir.listFiles()?.forEach { f ->
            if (f.name !in keep && f.delete()) removed++
        }
        return removed
    }

    /** Anzahl Dateien im Store (für Tests/Diagnose). */
    fun storeFileCount(): Int = storeDir.listFiles()?.size ?: 0
}
