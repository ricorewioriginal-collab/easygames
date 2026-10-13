package de.ricorewi.easygames.core

import org.json.JSONException
import org.json.JSONObject

/** Wird geworfen, wenn ein Manifest nicht dem Vertrag entspricht. */
class ManifestException(message: String, cause: Throwable? = null) : Exception(message, cause)

/** Eine Datei im Manifest: Pfad, Größe in Bytes, SHA-256 (kleingeschrieben, hex). */
data class FileEntry(val p: String, val s: Long, val h: String)

/**
 * Geparstes und validiertes Inhalts-Manifest (schema 1).
 *
 * Prüfungen: schema == 1, Hash = 64 Hex-Zeichen, sichere relative Pfade (kein "..", kein führendes "/"),
 * keine doppelten Pfade, Einstiegsdatei und Vendor-Ziele müssen in `files` stehen.
 */
class Manifest private constructor(
    val version: String,
    val generated: String?,
    val commit: String?,
    val entry: String,
    val catalog: String?,
    val files: List<FileEntry>,
    /** Externe URL (voll, ggf. mit Query) -> lokaler Dateipfad. */
    val vendor: Map<String, String>
) {
    private val byPath: Map<String, FileEntry> = files.associateBy { it.p }

    /** Vendor-Schlüssel ohne Query/Fragment -> Pfad (erster Treffer gewinnt). */
    private val vendorBare: Map<String, String> = HashMap<String, String>().also { m ->
        for ((url, path) in vendor) m.putIfAbsent(stripQuery(url), path)
    }

    val totalBytes: Long = files.fold(0L) { acc, f -> acc + f.s }

    /** Eintrag zu einem Pfad oder null. */
    fun fileFor(path: String): FileEntry? = byPath[path]

    /**
     * Löst eine externe URL auf einen lokalen Pfad auf: erst exakt, sonst ohne Query/Fragment
     * (sowohl gegen exakte Schlüssel als auch gegen die query-losen Varianten der Schlüssel).
     */
    fun vendorPath(url: String): String? {
        vendor[url]?.let { return it }
        val bare = stripQuery(url)
        return vendor[bare] ?: vendorBare[bare]
    }

    companion object {
        const val SCHEMA = 1
        private val HEX64 = Regex("^[0-9a-fA-F]{64}$")

        /** Schneidet Query ("?...") und Fragment ("#...") ab. */
        fun stripQuery(url: String): String {
            val q = url.indexOf('?')
            val f = url.indexOf('#')
            val cut = when {
                q < 0 -> f
                f < 0 -> q
                else -> minOf(q, f)
            }
            return if (cut < 0) url else url.substring(0, cut)
        }

        /** Ein Pfad ist sicher, wenn er relativ ist und weder "..", "." noch leere Segmente enthält. */
        fun isSafePath(p: String): Boolean {
            if (p.isEmpty() || p.length > 1024) return false
            if (p.startsWith("/") || p.endsWith("/")) return false
            for (ch in p) {
                if (ch.code < 0x20 || ch.code == 0x7f) return false
                if (ch == '\\' || ch == '?' || ch == '#') return false
            }
            for (seg in p.split('/')) {
                if (seg.isEmpty() || seg == "." || seg == "..") return false
            }
            return true
        }

        fun parse(text: String): Manifest {
            val o = try {
                JSONObject(text)
            } catch (e: JSONException) {
                throw ManifestException("Kein gültiges JSON: ${e.message}", e)
            }
            val schema = (o.opt("schema") as? Number)?.toInt()
            if (schema != SCHEMA) throw ManifestException("Nicht unterstütztes Schema: ${o.opt("schema")}")

            val version = optionalString(o, "version")
            if (version.isNullOrBlank()) throw ManifestException("Feld 'version' fehlt")
            val entry = optionalString(o, "entry") ?: "index.html"
            val arr = o.optJSONArray("files") ?: throw ManifestException("Feld 'files' fehlt")

            val seen = HashSet<String>()
            val sizeByHash = HashMap<String, Long>()
            val list = ArrayList<FileEntry>(arr.length())
            for (i in 0 until arr.length()) {
                val item = arr.optJSONObject(i) ?: throw ManifestException("files[$i] ist kein Objekt")
                val p = item.opt("p") as? String ?: throw ManifestException("files[$i]: 'p' fehlt")
                if (!isSafePath(p)) throw ManifestException("Unsicherer Pfad: '$p'")
                if (!seen.add(p)) throw ManifestException("Doppelter Pfad: '$p'")
                val h = item.opt("h") as? String
                if (h == null || !HEX64.matches(h)) throw ManifestException("Ungültiger Hash bei '$p'")
                val num = item.opt("s") as? Number ?: throw ManifestException("Größe 's' fehlt bei '$p'")
                val d = num.toDouble()
                if (d < 0 || d != Math.floor(d)) throw ManifestException("Ungültige Größe bei '$p'")
                val hash = h.lowercase()
                val size = num.toLong()
                val prev = sizeByHash.put(hash, size)
                if (prev != null && prev != size) throw ManifestException("Gleicher Hash, andere Größe bei '$p'")
                list.add(FileEntry(p, size, hash))
            }
            if (!seen.contains(entry)) throw ManifestException("Einstiegsdatei '$entry' fehlt in 'files'")

            val vendor = LinkedHashMap<String, String>()
            val v = o.optJSONObject("vendor")
            if (v != null) {
                val keys = v.keys()
                while (keys.hasNext()) {
                    val url = keys.next()
                    val target = v.opt(url) as? String ?: throw ManifestException("Vendor-Ziel für '$url' ist kein Text")
                    if (url.isEmpty()) throw ManifestException("Leere Vendor-URL")
                    if (!seen.contains(target)) throw ManifestException("Vendor-Ziel '$target' fehlt in 'files'")
                    vendor[url] = target
                }
            }
            return Manifest(version, optionalString(o, "generated"), optionalString(o, "commit"),
                entry, optionalString(o, "catalog"), list, vendor)
        }

        private fun optionalString(o: JSONObject, key: String): String? {
            if (!o.has(key) || o.isNull(key)) return null
            return o.get(key) as? String ?: throw ManifestException("Feld '$key' ist kein Text")
        }
    }
}
