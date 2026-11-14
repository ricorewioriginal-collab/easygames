package de.ricorewi.easygames.core

import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

/** Zustand eines Spiels für die Bibliothek. */
data class GameStatus(
    val installed: Boolean,
    val update: Boolean,
    val isNew: Boolean,
    /** Download-Größe des Spiels (eigener Ordner). */
    val size: Long,
    val playSeconds: Long,
    val lastPlayed: Long,
    /** Andere Spiele bzw. Bibliotheken, deren Dateien das Spiel mitnutzt (werden mitinstalliert). */
    val needs: List<String>,
)

/** Ergebnis eines Abgleichs mit dem Server. */
data class RefreshResult(val online: Boolean, val changed: Boolean, val newGames: List<Game>, val updates: List<Game>)

/**
 * Spiele-Bibliothek wie ein kleiner Steam-Client: Jedes Spiel wird einzeln geladen, geprüft (Größe + SHA-256) und aktualisiert.
 * Quelle ist der Sync-Stand von easygames (`sync/manifest.json` + `sync/catalog.json`). Neue Spiele erscheinen dadurch automatisch,
 * geänderte Dateien gelten als Update.
 *
 * Einheiten: die **Basis** (alles außerhalb der Spielordner: Konto-/Profil-/Ranglisten-Seiten, `cloud/fire-peer.js`, Bibliotheken,
 * Anleitungen, Vorschaubilder und das Kartenbild jedes Spiels), je **Spielordner** und große **Bibliotheken** (`vendor/<name>` ab 2 MB,
 * z. B. MediaPipe), die nur Spiele bekommen, die sie nutzen. Spiele, die Dateien eines anderen Spiels laden (`../easyclash/js/…`),
 * ziehen dieses automatisch mit.
 *
 * Dateien liegen unter ihrem Pfad in `root/files`, der Zustand in `root/state.json`. Ohne Netz bleibt der letzte Stand spielbar.
 * Nicht thread-sicher für gleichzeitige Schreibzugriffe: Installationen laufen über [run] nacheinander.
 */
class Library(
    private val root: File,
    private val fetcher: Fetcher,
    /** Basis-URL des Inhalts, endet auf "/". */
    private val base: String,
    private val now: () -> Long = System::currentTimeMillis,
) {
    private val filesDir = File(root, "files")
    private val tmpDir = File(root, "tmp")
    private val stateFile = File(root, "state.json")
    private val manifestFile = File(root, "manifest.json")
    private val catalogFile = File(root, "catalog.json")
    private val lock = Any()
    private val pool = Executors.newFixedThreadPool(PARALLEL)

    @Volatile var manifest: Manifest? = null
        private set(v) { field = v; unitIndex = v?.files?.groupBy { it.p.substringBefore('/') } ?: emptyMap() }
    /** Dateien je oberstem Ordner (schneller Zugriff für Status und Updates). */
    @Volatile private var unitIndex: Map<String, List<FileEntry>> = emptyMap()
    @Volatile var catalog: Catalog? = null; private set
    private var state = State()

    init {
        filesDir.mkdirs()
        state = loadState()
        try {
            if (manifestFile.isFile && catalogFile.isFile) {
                manifest = Manifest.parse(manifestFile.readText())
                catalog = Catalog.parse(catalogFile.readText())
            }
        } catch (e: Exception) {
            manifest = null; catalog = null
        }
    }

    val games: List<Game> get() = catalog?.games ?: emptyList()
    fun find(id: String): Game? = catalog?.find(id)

    var autoUpdate: Boolean
        get() = synchronized(lock) { state.auto }
        set(v) { synchronized(lock) { state.auto = v }; save() }

    val diskBytes: Long get() = synchronized(lock) { state.files.values.sumOf { it.s } }

    // ------------------------------------------------------------------ Status

    fun status(g: Game): GameStatus = synchronized(lock) {
        val m = manifest
        val installed = state.installed.contains(g.folder)
        val update = installed && m != null && outdated(m, g.folder)
        val size = unitFiles(g.folder).sumOf { it.s }
        val seen = state.firstSeen[g.id]
        val isNew = seen != null && seen > 0 && now() - seen < NEW_FOR_MS
        val play = state.play[g.id]
        GameStatus(installed, update, isNew, size, play?.seconds ?: 0, play?.last ?: 0, state.deps[g.folder] ?: emptyList())
    }

    /** Alle Basisdateien vorhanden und aktuell (Startseiten, Konto, Vorschaubilder …). */
    val baseReady: Boolean
        get() = synchronized(lock) {
            val m = manifest ?: return false
            baseFiles(m).all { state.files[it.p]?.h == it.h }
        }

    /** Datei für die Auslieferung (nur aus diesem Stand; null = nicht installiert). */
    fun open(path: String): File? {
        if (!Manifest.isSafePath(path)) return null
        val ok = synchronized(lock) { state.files.containsKey(path) }
        if (!ok) return null
        val f = File(filesDir, path)
        return if (f.isFile) f else null
    }

    fun resolveVendor(url: String): String? = manifest?.vendorPath(url)

    fun addPlayTime(id: String, seconds: Long) {
        synchronized(lock) {
            val p = state.play.getOrPut(id) { Play() }
            p.seconds += seconds.coerceAtLeast(0)
            p.last = now()
        }
        save()
    }

    // ------------------------------------------------------------------ Server-Abgleich

    /**
     * Holt Manifest und Katalog, hält die Basis aktuell und erkennt neue Spiele und Updates.
     * Wirft nicht bei fehlendem Netz: dann online=false und der letzte Stand bleibt.
     */
    fun refresh(cancel: AtomicBoolean = AtomicBoolean(false), onCatalog: () -> Unit = {}): RefreshResult = refresh(cancel, false, onCatalog)

    /** [fresh]: Manifest am CDN-Cache vorbei holen (ohne ETag, mit Cache-Buster), z. B. nach einer falschen Prüfsumme. */
    private fun refresh(cancel: AtomicBoolean, fresh: Boolean, onCatalog: () -> Unit): RefreshResult {
        val before = games.map { it.id }.toSet()
        val mText: String
        val cText: String
        val m: Manifest
        val c: Catalog
        try {
            val resp = if (fresh) fetcher.getManifest(base + "sync/manifest.json?t=" + now(), null)
                else fetcher.getManifest(base + "sync/manifest.json", synchronized(lock) { state.etag })
            if (resp.notModified && manifest != null && catalog != null) {
                syncBase(manifest!!, cancel)
                return RefreshResult(true, false, emptyList(), updates())
            }
            mText = resp.text ?: throw IOException("Leeres Manifest")
            m = Manifest.parse(mText)
            cText = fetchText(base + (m.catalog ?: "sync/catalog.json"))
            c = Catalog.parse(cText)
            synchronized(lock) { state.etag = resp.etag }
        } catch (e: SyncCancelledException) {
            throw e
        } catch (e: Exception) {
            return RefreshResult(false, false, emptyList(), updates())
        }
        val first: Boolean
        synchronized(lock) {
            first = state.firstSeen.isEmpty()
            for (g in c.games) if (!state.firstSeen.containsKey(g.id)) state.firstSeen[g.id] = if (first) 0L else now()
        }
        writeAtomic(manifestFile, mText)
        writeAtomic(catalogFile, cText)
        manifest = m
        catalog = c
        save()
        onCatalog()                     // Liste schon zeigen, während die Basis lädt
        syncBase(m, cancel)
        val fresh = if (before.isEmpty()) emptyList() else c.games.filter { it.id !in before }
        return RefreshResult(true, true, fresh, updates())
    }

    /** Installierte Spiele mit offenem Update. */
    fun updates(): List<Game> = games.filter { status(it).let { s -> s.installed && s.update } }

    private fun fetchText(url: String): String {
        val out = java.io.ByteArrayOutputStream()
        fetcher.download(url, out) { }
        return out.toString("UTF-8")
    }

    // ------------------------------------------------------------------ Installieren / Entfernen

    /**
     * Installiert bzw. aktualisiert ein Spiel samt Abhängigkeiten. [progress] bekommt (geladen, gesamt) in Bytes.
     * Wirft bei Fehlern (kein Netz, Prüfsumme) – der bisherige Stand bleibt dann unverändert.
     */
    fun install(id: String, cancel: AtomicBoolean = AtomicBoolean(false), progress: (Long, Long) -> Unit = { _, _ -> }) {
        try {
            installOnce(id, cancel, progress)
        } catch (e: ChecksumException) {
            // Kurz nach einer Veröffentlichung passen Manifest und Datei am CDN oft noch nicht zusammen
            // (Manifest wird nach dem Merge neu erzeugt, CDN cacht bis zu 10 Min.). Frisches Manifest holen und
            // genau einmal neu versuchen; ist es unverändert, eine verständliche Meldung statt „Prüfsumme“.
            val before = manifest?.version
            val r = refresh(cancel, true) {}
            if (!r.online || manifest?.version == before) throw IOException("Update wird gerade veröffentlicht – bitte in ein paar Minuten nochmal versuchen.", e)
            try {
                installOnce(id, cancel, progress)
            } catch (e2: ChecksumException) {
                throw IOException("Update wird gerade veröffentlicht – bitte in ein paar Minuten nochmal versuchen.", e2)
            }
        }
    }

    private fun installOnce(id: String, cancel: AtomicBoolean, progress: (Long, Long) -> Unit) {
        val m = manifest ?: throw IOException("Keine Spieleliste – bitte mit dem Internet verbinden.")
        val g = find(id) ?: throw IOException("Spiel nicht gefunden.")
        if (!baseReady) syncBase(m, cancel)
        val todo = ArrayDeque<String>().apply { add(g.folder) }
        val done = HashSet<String>()
        val total = AtomicLong(0)
        val loaded = AtomicLong(0)
        while (todo.isNotEmpty()) {
            val unit = todo.removeFirst()
            if (!done.add(unit)) continue
            val files = unitFiles(unit)
            if (files.isEmpty()) throw IOException("Für „$unit“ gibt es keine Dateien auf dem Server.")
            val stale = synchronized(lock) { state.files.keys.filter { inUnit(it, unit) && m.fileFor(it) == null } }
            total.addAndGet(synchronized(lock) { files.filter { state.files[it.p]?.h != it.h }.sumOf { it.s } })
            progress(loaded.get(), total.get())
            apply(files, stale, cancel) { n -> progress(loaded.addAndGet(n.toLong()), total.get()) }
            val deps = if (unit.startsWith("vendor/")) emptyList() else scanDeps(unit, m)
            synchronized(lock) {
                if (!unit.startsWith("vendor/")) state.deps[unit] = deps
                state.installed.add(unit)
            }
            save()
            for (d in deps) {
                val need = synchronized(lock) { !state.installed.contains(d) || outdated(m, d) }
                if (need) todo.add(d)
            }
        }
    }

    /** Entfernt ein Spiel. Braucht es ein anderes installiertes Spiel, bleibt es (Rückgabe: Titel dieser Spiele). */
    fun uninstall(id: String): List<String> {
        val g = find(id) ?: return emptyList()
        val m = manifest
        val baseSet = if (m == null) emptySet() else baseFiles(m).map { it.p }.toSet()
        val gone: List<String>
        synchronized(lock) {
            val users = state.deps.filter { (k, v) -> k != g.folder && state.installed.contains(k) && g.folder in v }
                .keys.map { catalog?.byFolder(it)?.title ?: it }
            if (users.isNotEmpty()) return users
            gone = state.files.keys.filter { inUnit(it, g.folder) && it !in baseSet }
            gone.forEach { state.files.remove(it) }
            state.installed.remove(g.folder)
            state.deps.remove(g.folder)
            // Bibliotheken, die kein installiertes Spiel mehr braucht, mit entfernen
            val used = state.installed.flatMap { state.deps[it] ?: emptyList() }.toSet()
            val orphans = state.installed.filter { it.startsWith("vendor/") && it !in used }
            for (o in orphans) {
                state.installed.remove(o)
                state.files.keys.filter { inUnit(it, o) && it !in baseSet }.forEach { p -> state.files.remove(p); File(filesDir, p).delete() }
            }
        }
        gone.forEach { File(filesDir, it).delete() }
        File(filesDir, g.folder).listFiles()?.let { cleanEmpty(File(filesDir, g.folder)) }
        save()
        return emptyList()
    }

    // ------------------------------------------------------------------ intern

    private fun syncBase(m: Manifest, cancel: AtomicBoolean) {
        val files = baseFiles(m)
        val keep = files.map { it.p }.toSet()
        val stale = synchronized(lock) {
            state.files.keys.filter { p -> p !in keep && !installedUnitOf(p) }
        }
        apply(files, stale, cancel) { }
    }

    private fun installedUnitOf(p: String): Boolean {
        val c = catalog ?: return false
        val top = p.substringBefore('/')
        if (top in c.folders) return state.installed.contains(top)
        if (top == "vendor") return state.installed.contains("vendor/" + p.removePrefix("vendor/").substringBefore('/'))
        return false
    }

    private fun bigVendorGroups(m: Manifest): Set<String> =
        m.files.filter { it.p.startsWith("vendor/") && it.p.count { ch -> ch == '/' } >= 2 }
            .groupBy { "vendor/" + it.p.removePrefix("vendor/").substringBefore('/') }
            .filter { (_, list) -> list.sumOf { it.s } >= BIG_VENDOR }
            .keys

    private fun baseFiles(m: Manifest): List<FileEntry> {
        val folders = catalog?.folders ?: emptySet()
        val big = bigVendorGroups(m)
        val covers = catalog?.games?.map { it.img }?.toSet() ?: emptySet()
        return m.files.filter { f ->
            val top = f.p.substringBefore('/')
            (top !in folders && big.none { inUnit(f.p, it) }) || f.p in covers
        }
    }

    private fun inUnit(p: String, unit: String) = p.startsWith("$unit/")

    private fun unitFiles(unit: String): List<FileEntry> =
        (unitIndex[unit.substringBefore('/')] ?: emptyList()).let { l -> if ('/' in unit) l.filter { inUnit(it.p, unit) } else l }

    private fun outdated(m: Manifest, unit: String): Boolean {
        for (f in unitFiles(unit)) if (state.files[f.p]?.h != f.h) return true
        for (p in state.files.keys) if (inUnit(p, unit) && m.fileFor(p) == null) return true
        return false
    }

    /** Welche anderen Spielordner bzw. großen Bibliotheken nutzt der Ordner? (`../ordner/…` oder bekannte CDN-Adressen) */
    private fun scanDeps(folder: String, m: Manifest): List<String> {
        val folders = catalog?.folders ?: emptySet()
        val big = bigVendorGroups(m)
        val cdn = m.vendor.filterValues { t -> big.any { inUnit(t, it) } }
        val out = sortedSetOf<String>()
        val dir = File(filesDir, folder)
        dir.walkTopDown().filter { it.isFile && it.extension.lowercase() in TEXT_EXT }.forEach { f ->
            val text = try { f.readText() } catch (e: Exception) { return@forEach }
            for (r in DEP_RX.findAll(text)) {
                val a = r.groupValues[1]
                val b = r.groupValues[2]
                if (a != folder && a in folders) out += a
                if (a == "vendor" && "vendor/$b" in big) out += "vendor/$b"
            }
            for ((url, target) in cdn) if (text.contains(url)) big.firstOrNull { inUnit(target, it) }?.let { out += it }
        }
        return out.toList()
    }

    /** Lädt geänderte Dateien parallel in den Zwischenordner, prüft sie und übernimmt erst dann alle. */
    private fun apply(files: List<FileEntry>, stale: List<String>, cancel: AtomicBoolean, onBytes: (Int) -> Unit) {
        val changed = synchronized(lock) {
            files.filter { (state.files[it.p]?.h != it.h || !File(filesDir, it.p).isFile) && Manifest.isSafePath(it.p) }
        }
        if (changed.isEmpty() && stale.isEmpty()) return
        tmpDir.mkdirs()
        val failed = AtomicBoolean(false)
        val parts = java.util.Collections.synchronizedList(ArrayList<Pair<FileEntry, File>>())
        val jobs: List<Future<*>> = changed.map { e ->
            pool.submit {
                if (cancel.get() || failed.get()) return@submit
                val tmp = File(tmpDir, e.h + "-" + System.nanoTime())
                try {
                    download(e, tmp, cancel, failed, onBytes)
                    parts += e to tmp
                } catch (ex: Throwable) {
                    tmp.delete()
                    failed.set(true)
                    throw ex
                }
            }
        }
        var error: Throwable? = null
        for (j in jobs) try { j.get() } catch (ex: java.util.concurrent.ExecutionException) { if (error == null) error = ex.cause }
        if (cancel.get() || error != null) {
            parts.forEach { it.second.delete() }
            if (cancel.get()) throw SyncCancelledException()
            throw (error as? IOException) ?: IOException(error?.message ?: "Download fehlgeschlagen", error)
        }
        synchronized(lock) {
            for ((e, tmp) in parts) {
                val dst = File(filesDir, e.p)
                dst.parentFile?.mkdirs()
                if (dst.exists()) dst.delete()
                if (!tmp.renameTo(dst)) { tmp.copyTo(dst, true); tmp.delete() }
                state.files[e.p] = FileRec(e.s, e.h)
            }
            for (p in stale) {
                File(filesDir, p).delete()
                state.files.remove(p)
            }
        }
        save()
    }

    private fun download(e: FileEntry, tmp: File, cancel: AtomicBoolean, failed: AtomicBoolean, onBytes: (Int) -> Unit) {
        var attempt = 0
        while (true) {
            attempt++
            try {
                val md = Hashing.newDigest()
                var got = 0L
                FileOutputStream(tmp).use { out ->
                    // Ab dem 2. Versuch am CDN-Cache vorbei: dieselbe Datei, aber eigene Cache-Adresse je Prüfsumme.
                    val url = base + encodePath(e.p) + if (attempt > 1) "?v=" + e.h.take(16) else ""
                    fetcher.download(url, object : java.io.OutputStream() {
                        override fun write(b: Int) { out.write(b); md.update(b.toByte()) }
                        override fun write(b: ByteArray, off: Int, len: Int) { out.write(b, off, len); md.update(b, off, len) }
                    }) { n ->
                        if (cancel.get() || failed.get()) throw SyncCancelledException()
                        got += n
                        if (got > e.s) throw ChecksumException(e.p)
                        onBytes(n)
                    }
                }
                if (got != e.s || Hashing.toHex(md.digest()) != e.h) throw ChecksumException(e.p)
                return
            } catch (ex: SyncCancelledException) {
                throw ex
            } catch (ex: InsecureUrlException) {
                throw ex
            } catch (ex: IOException) {
                if (attempt >= 3) throw ex
                Thread.sleep(if (ex is ChecksumException) 1500L * attempt else 500L * attempt)
            }
        }
    }

    private fun cleanEmpty(dir: File) {
        dir.listFiles()?.filter { it.isDirectory }?.forEach { cleanEmpty(it) }
        if (dir.listFiles()?.isEmpty() == true) dir.delete()
    }

    // ------------------------------------------------------------------ Speichern

    private class FileRec(val s: Long, val h: String)
    private class Play(var seconds: Long = 0, var last: Long = 0)
    private class State {
        val files = HashMap<String, FileRec>()
        val installed = LinkedHashSet<String>()
        val deps = HashMap<String, List<String>>()
        val play = HashMap<String, Play>()
        val firstSeen = HashMap<String, Long>()
        var auto = true
        var etag: String? = null
    }

    private fun loadState(): State {
        val s = State()
        try {
            if (!stateFile.isFile) return s
            val o = JSONObject(stateFile.readText())
            o.optJSONObject("files")?.let { f -> f.keys().forEach { k -> f.optJSONArray(k)?.let { a -> s.files[k] = FileRec(a.optLong(0), a.optString(1)) } } }
            o.optJSONArray("installed")?.let { a -> for (i in 0 until a.length()) s.installed += a.optString(i) }
            o.optJSONObject("deps")?.let { d -> d.keys().forEach { k -> d.optJSONArray(k)?.let { a -> s.deps[k] = (0 until a.length()).map { a.optString(it) } } } }
            o.optJSONObject("play")?.let { p -> p.keys().forEach { k -> p.optJSONArray(k)?.let { a -> s.play[k] = Play(a.optLong(0), a.optLong(1)) } } }
            o.optJSONObject("firstSeen")?.let { f -> f.keys().forEach { k -> s.firstSeen[k] = f.optLong(k) } }
            s.auto = o.optBoolean("auto", true)
            s.etag = o.optString("etag").takeIf { it.isNotEmpty() }
        } catch (e: Exception) { }
        return s
    }

    private fun save() {
        val text = synchronized(lock) {
            val o = JSONObject()
            o.put("files", JSONObject().apply { state.files.forEach { (k, v) -> put(k, JSONArray().put(v.s).put(v.h)) } })
            o.put("installed", JSONArray(state.installed.toList()))
            o.put("deps", JSONObject().apply { state.deps.forEach { (k, v) -> put(k, JSONArray(v)) } })
            o.put("play", JSONObject().apply { state.play.forEach { (k, v) -> put(k, JSONArray().put(v.seconds).put(v.last)) } })
            o.put("firstSeen", JSONObject().apply { state.firstSeen.forEach { (k, v) -> put(k, v) } })
            o.put("auto", state.auto)
            state.etag?.let { o.put("etag", it) }
            o.toString()
        }
        writeAtomic(stateFile, text)
    }

    private val writeLock = Any()
    private fun writeAtomic(f: File, text: String) = synchronized(writeLock) {
        f.parentFile?.mkdirs()
        val tmp = File(f.parentFile, f.name + ".tmp")
        tmp.writeText(text)
        if (!tmp.renameTo(f)) { f.delete(); tmp.renameTo(f) }
    }

    fun close() = pool.shutdownNow()

    companion object {
        const val PARALLEL = 4
        const val BIG_VENDOR = 2L * 1024 * 1024
        const val NEW_FOR_MS = 14L * 24 * 3600 * 1000
        private val TEXT_EXT = setOf("html", "htm", "js", "mjs", "css", "json")
        private val DEP_RX = Regex("""\.\./([A-Za-z0-9_-]+)/([A-Za-z0-9_.-]*)""")

        fun encodePath(p: String): String = p.split('/').joinToString("/") { seg ->
            java.net.URLEncoder.encode(seg, "UTF-8").replace("+", "%20")
        }
    }
}

/** Datei passt nicht zum Manifest (Größe oder SHA-256). */
class ChecksumException(val path: String) : IOException("Prüfsumme stimmt nicht: $path")
