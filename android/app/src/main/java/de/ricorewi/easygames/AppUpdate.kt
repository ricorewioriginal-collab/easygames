package de.ricorewi.easygames

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Hinweis auf eine neuere App-Hülle (APK). Spiele und Oberfläche aktualisieren sich per Sync von selbst;
 * Symbol, Splash und Hüllen-Code kommen nur mit einem neuen APK, das der Nutzer selbst installiert.
 * Geprüft wird höchstens alle 6 Stunden (kleine JSON-Datei, kein Zusatzverkehr im Spiel).
 */
object AppUpdate {
    data class Info(val versionCode: Long, val versionName: String)

    private const val PREFS = "easygames_app_update"
    private const val KEY_LAST_CHECK = "last_check"
    private const val KEY_DISMISSED = "dismissed_code"
    private const val INTERVAL_MS = 6L * 60 * 60 * 1000

    fun enabled(): Boolean = BuildConfig.UPDATE_INFO_URL.isNotBlank() && BuildConfig.UPDATE_APK_URL.isNotBlank()

    @Suppress("DEPRECATION")
    fun installedCode(ctx: Context): Long = try {
        val p = ctx.packageManager.getPackageInfo(ctx.packageName, 0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) p.longVersionCode else p.versionCode.toLong()
    } catch (e: PackageManager.NameNotFoundException) {
        BuildConfig.VERSION_CODE.toLong()
    }

    fun due(ctx: Context): Boolean {
        val last = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_LAST_CHECK, 0L)
        return System.currentTimeMillis() - last >= INTERVAL_MS || last > System.currentTimeMillis()
    }

    /** Blockierend (Hintergrundthread). Liefert die neueste veröffentlichte Version oder null bei Fehler/ohne Angabe. */
    fun fetchLatest(ctx: Context): Info? {
        var conn: HttpURLConnection? = null
        return try {
            val c = URL(BuildConfig.UPDATE_INFO_URL).openConnection() as HttpURLConnection
            conn = c
            c.connectTimeout = 8000
            c.readTimeout = 8000
            c.useCaches = false
            c.setRequestProperty("Cache-Control", "no-cache")
            c.setRequestProperty("User-Agent", "EasyGamesApp/" + BuildConfig.VERSION_NAME)
            if (c.responseCode != 200) return null
            val text = c.inputStream.use { it.readBytes().toString(Charsets.UTF_8) }
            val j = JSONObject(text)
            val code = j.optLong("version_code", 0L)
            if (code <= 0L) return null
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply()
            Info(code, j.optString("version", code.toString()))
        } catch (e: Exception) {
            null
        } finally {
            conn?.disconnect()
        }
    }

    fun isNewer(ctx: Context, latest: Info): Boolean = latest.versionCode > installedCode(ctx)

    /** Wurde genau diese Version schon mit „Später“ weggeklickt? Bei einer noch neueren Version wird wieder gefragt. */
    fun dismissed(ctx: Context, latest: Info): Boolean =
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_DISMISSED, 0L) >= latest.versionCode

    fun dismiss(ctx: Context, latest: Info) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putLong(KEY_DISMISSED, latest.versionCode).apply()
    }
}
