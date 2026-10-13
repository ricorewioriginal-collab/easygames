package de.ricorewi.easygames.core

import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStream

/**
 * Mitgelieferter Start-Inhalt (im APK unter assets/easygames/). Unveränderlich.
 * Auf Android wird das aus dem AssetManager gespeist, in Tests aus einem Verzeichnis.
 */
interface BaselineSource {
    val manifest: Manifest

    /** Öffnet die Datei zum Manifest-Pfad oder null, wenn sie nicht vorhanden ist. */
    fun open(path: String): InputStream?

    /** Die Baseline deckt einen Eintrag ab, wenn Pfad UND Hash übereinstimmen. */
    fun covers(entry: FileEntry): Boolean = manifest.fileFor(entry.p)?.h == entry.h
}

/** Baseline aus einem Verzeichnis: `<dir>/sync/manifest.json` und `<dir>/<p>`. */
class DirBaselineSource private constructor(
    private val dir: File,
    override val manifest: Manifest
) : BaselineSource {

    override fun open(path: String): InputStream? {
        if (manifest.fileFor(path) == null) return null   // nur Manifest-Pfade, nie beliebige
        val f = File(dir, path)
        return try {
            if (f.isFile) FileInputStream(f) else null
        } catch (e: IOException) {
            null
        }
    }

    companion object {
        /** Liefert null, wenn kein (gültiges) Manifest vorhanden ist. */
        fun openOrNull(dir: File): DirBaselineSource? {
            val mf = File(dir, "sync/manifest.json")
            if (!mf.isFile) return null
            return try {
                DirBaselineSource(dir, Manifest.parse(mf.readText(Charsets.UTF_8)))
            } catch (e: ManifestException) {
                null
            } catch (e: IOException) {
                null
            }
        }
    }
}
