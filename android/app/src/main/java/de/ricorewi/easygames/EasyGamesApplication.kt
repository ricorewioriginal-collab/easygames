package de.ricorewi.easygames

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.WorkManager

/**
 * Hält die Bibliothek ([Repo]). Läuft auch, wenn nur der WorkManager im Hintergrund nach Updates sucht –
 * hier daher keine Oberflächen-Logik.
 */
class EasyGamesApplication : Application() {

    lateinit var repo: Repo
        private set

    override fun onCreate() {
        super.onCreate()
        repo = Repo(this)
        if (Build.VERSION.SDK_INT >= 26) {
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(NotificationChannel(CHANNEL_UPDATES, "Neue Spiele & Updates", NotificationManager.IMPORTANCE_DEFAULT))
            nm.createNotificationChannel(NotificationChannel(CHANNEL_REMINDERS, "Erinnerungen der Spiele", NotificationManager.IMPORTANCE_DEFAULT))
        }
        schedule(this, repo.wifiOnly)
        // Speicher der früheren App-Version (alle Spiele auf einmal) freigeben – Spielstände liegen in der WebView und bleiben
        val old = java.io.File(filesDir, "content")
        if (old.exists()) Thread { old.deleteRecursively() }.start()
    }

    companion object {
        const val CHANNEL_UPDATES = "updates"
        const val CHANNEL_REMINDERS = "reminders"

        /** Hintergrund-Suche nach neuen Spielen und Updates alle 6 Stunden (mit „Nur im WLAN“ nur im WLAN). */
        fun schedule(ctx: Context, wifiOnly: Boolean) {
            WorkManager.getInstance(ctx).enqueueUniquePeriodicWork("easygames-sync", ExistingPeriodicWorkPolicy.UPDATE, SyncWorker.periodicRequest(wifiOnly))
        }

        fun repo(ctx: Context): Repo = (ctx.applicationContext as EasyGamesApplication).repo
    }
}
