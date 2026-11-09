package de.ricorewi.easygames

import android.Manifest
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequest
import androidx.work.Worker
import androidx.work.WorkerParameters
import de.ricorewi.easygames.core.SyncCancelledException
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Sucht im Hintergrund nach neuen Spielen, Spiel-Updates und einer neuen App-Version und meldet sie per Benachrichtigung.
 * Mit „Updates automatisch“ werden installierte Spiele gleich aktualisiert (nicht bei schwachem Akku).
 */
class SyncWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    private val cancel = AtomicBoolean(false)

    override fun doWork(): Result {
        val ctx = applicationContext
        val lib = EasyGamesApplication.repo(ctx).library
        val r = try { lib.refresh(cancel) } catch (e: SyncCancelledException) { return Result.retry() } catch (e: Exception) { return Result.success() }
        if (!r.online) return Result.success()
        if (r.newGames.isNotEmpty()) {
            val names = r.newGames.take(3).joinToString(", ") { Repo.short(it) }
            notify(ctx, 10, if (r.newGames.size == 1) "Neues Spiel: $names" else "${r.newGames.size} neue Spiele", names + " – jetzt in der Bibliothek.", MainActivity.EXTRA_TAB_NEW)
        }
        val updates = lib.updates()
        if (updates.isNotEmpty()) {
            if (lib.autoUpdate) {
                val ok = updates.filter { g -> try { lib.install(g.id, cancel); true } catch (e: Exception) { false } }
                if (ok.isNotEmpty()) notify(ctx, 11, "${ok.size} Spiel(e) aktualisiert", ok.take(4).joinToString(", ") { Repo.short(it) }, null)
            } else {
                notify(ctx, 11, "${updates.size} Update(s) verfügbar", updates.take(4).joinToString(", ") { Repo.short(it) }, MainActivity.EXTRA_TAB_UPDATES)
            }
        }
        if (AppUpdate.enabled() && AppUpdate.due(ctx)) {
            val latest = AppUpdate.fetchLatest(ctx)
            if (latest != null && AppUpdate.isNewer(ctx, latest) && !AppUpdate.dismissed(ctx, latest)) {
                notify(ctx, 12, "easygames ${latest.versionName} ist da", "Tippen zum Herunterladen der neuen App-Version.", null, Uri.parse(BuildConfig.UPDATE_APK_URL))
            }
        }
        EasyGamesApplication.repo(ctx).publish()
        return Result.success()
    }

    override fun onStopped() { cancel.set(true) }

    companion object {
        fun periodicRequest(wifiOnly: Boolean): PeriodicWorkRequest =
            PeriodicWorkRequest.Builder(SyncWorker::class.java, 6L, TimeUnit.HOURS)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(if (wifiOnly) NetworkType.UNMETERED else NetworkType.CONNECTED)
                        .setRequiresBatteryNotLow(true)
                        .build()
                )
                .build()

        fun notify(ctx: Context, id: Int, title: String, text: String, tab: String?, url: Uri? = null) {
            if (Build.VERSION.SDK_INT >= 33 && ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
            val intent = if (url != null) Intent(Intent.ACTION_VIEW, url)
            else Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP).apply { if (tab != null) putExtra(MainActivity.EXTRA_TAB, tab) }
            val pi = PendingIntent.getActivity(ctx, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val n = NotificationCompat.Builder(ctx, EasyGamesApplication.CHANNEL_UPDATES)
                .setSmallIcon(R.drawable.ic_stat_easygames)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build()
            ctx.getSystemService(NotificationManager::class.java).notify(id, n)
        }
    }
}
