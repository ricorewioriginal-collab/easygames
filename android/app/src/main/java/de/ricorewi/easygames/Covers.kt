package de.ricorewi.easygames

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.util.LruCache
import com.caverock.androidsvg.SVG
import de.ricorewi.easygames.core.Library
import java.io.File

/**
 * Kartenbilder aus der Bibliothek (WebP-Vorschaubilder, PNG/JPG oder SVG), verkleinert auf höchstens 512 px
 * und im Speicher zwischengehalten (ein Achtel des App-Speichers, 16–64 MB).
 */
object Covers {
    private const val MAX = 512
    private val cache = object : LruCache<String, Bitmap>((Runtime.getRuntime().maxMemory() / 8).coerceIn(16L shl 20, 64L shl 20).toInt()) {
        override fun sizeOf(key: String, value: Bitmap) = value.byteCount
    }

    fun cached(path: String): Bitmap? = cache.get(path)

    /** Nur für Vorschau/Screenshot-Tests: Dateien ohne Bibliothek finden. */
    @Volatile var files: ((String) -> File?)? = null

    /** Blockierend (Hintergrund). null = Datei fehlt oder nicht lesbar. */
    fun load(library: Library?, path: String): Bitmap? {
        cache.get(path)?.let { return it }
        val f = files?.invoke(path) ?: library?.open(path) ?: return null
        val bmp = try { if (path.endsWith(".svg", true)) svg(f) else raster(f) } catch (e: Throwable) { null } ?: return null
        cache.put(path, bmp)
        return bmp
    }

    private fun raster(f: File): Bitmap? {
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(f.path, o)
        var sample = 1
        while (o.outWidth / (sample * 2) >= MAX && o.outHeight / (sample * 2) >= MAX) sample *= 2
        return BitmapFactory.decodeFile(f.path, BitmapFactory.Options().apply { inSampleSize = sample })
    }

    private fun svg(f: File): Bitmap {
        val svg = f.inputStream().use { SVG.getFromInputStream(it) }
        val w = svg.documentWidth.takeIf { it > 0 } ?: svg.documentViewBox?.width() ?: MAX.toFloat()
        val h = svg.documentHeight.takeIf { it > 0 } ?: svg.documentViewBox?.height() ?: MAX.toFloat()
        val scale = MAX / maxOf(w, h)
        val bw = (w * scale).toInt().coerceAtLeast(1)
        val bh = (h * scale).toInt().coerceAtLeast(1)
        svg.setDocumentWidth(bw.toFloat()); svg.setDocumentHeight(bh.toFloat())
        val bmp = Bitmap.createBitmap(bw, bh, Bitmap.Config.ARGB_8888)
        svg.renderToCanvas(Canvas(bmp))
        return bmp
    }
}
