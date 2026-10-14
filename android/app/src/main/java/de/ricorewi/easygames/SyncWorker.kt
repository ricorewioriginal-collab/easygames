package de.ricorewi.easygames

import android.content.Context
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequest
import androidx.work.PeriodicWorkRequest
import androidx.work.Worker
import androidx.work.WorkerParameters
import de.ricorewi.easygames.core.CancelToken
import de.ricorewi.easygames.core.SyncResult
import java.util.concurrent.TimeUnit

/** Hintergrund-Sync über den WorkManager (nur im WLAN, nicht bei schwachem Akku). */
class SyncWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    private val cancel = CancelToken()

    override fun doWork(): Result {
        val app = applicationContext as? EasyGamesApplication ?: return Result.success()
        // null = es läuft bereits ein Sync in diesem Prozess -> nichts zu tun
        val result = app.coordinator.runSyncBlocking(cancel) ?: return Result.success()
        if (result !is SyncResult.Failed) return Result.success()
        return when {
            result.cancelled -> Result.retry()                       // vom System gestoppt -> später fortsetzen
            result.offline -> Result.success()                       // der nächste Lauf holt es nach
            runAttemptCount < 3 -> Result.retry()
            else -> Result.success()
        }
    }

    override fun onStopped() {
        cancel.cancel()
    }

    companion object {
        private fun constraints(wifiOnly: Boolean): Constraints = Constraints.Builder()
            .setRequiredNetworkType(if (wifiOnly) NetworkType.UNMETERED else NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        fun periodicRequest(wifiOnly: Boolean = true): PeriodicWorkRequest =
            PeriodicWorkRequest.Builder(SyncWorker::class.java, 6L, TimeUnit.HOURS)
                .setConstraints(constraints(wifiOnly))
                .build()

        fun oneTimeRequest(wifiOnly: Boolean = true): OneTimeWorkRequest =
            OneTimeWorkRequest.Builder(SyncWorker::class.java)
                .setConstraints(constraints(wifiOnly))
                .build()
    }
}
