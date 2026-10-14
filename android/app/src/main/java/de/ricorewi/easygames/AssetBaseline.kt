package de.ricorewi.easygames

import android.content.res.AssetManager
import de.ricorewi.easygames.core.BaselineSource
import de.ricorewi.easygames.core.Manifest
import de.ricorewi.easygames.core.ManifestException
import java.io.IOException
import java.io.InputStream

/**
 * Start-Inhalt aus dem APK: `assets/easygames/sync/manifest.json` und `assets/easygames/<pfad>`.
 * Wird von tools/build-sync.js --stage erzeugt; fehlt er, startet die App mit dem Erststart-Download.
 */
class AssetBaseline private constructor(
    private val assets: AssetManager,
    override val manifest: Manifest
) : BaselineSource {

    override fun open(path: String): InputStream? {
        val entry = manifest.fileFor(path) ?: return null
        return try {
            assets.open("$ROOT/content/${entry.h}")
        } catch (e: IOException) {
            // Kompatibilität mit älteren APKs, die die originalen Pfade verwenden.
            try { assets.open("$ROOT/$path") } catch (legacy: IOException) { null }
        }
    }

    companion object {
        const val ROOT = "easygames"

        fun openOrNull(assets: AssetManager): AssetBaseline? {
            return try {
                val text = assets.open("$ROOT/sync/manifest.json").use { String(it.readBytes(), Charsets.UTF_8) }
                AssetBaseline(assets, Manifest.parse(text))
            } catch (e: IOException) {
                null
            } catch (e: ManifestException) {
                null
            }
        }
    }
}
