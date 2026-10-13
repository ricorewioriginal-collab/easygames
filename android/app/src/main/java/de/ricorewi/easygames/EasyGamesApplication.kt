package de.ricorewi.easygames

import android.app.Application
import de.ricorewi.easygames.core.ContentStore
import de.ricorewi.easygames.core.HttpFetcher
import de.ricorewi.easygames.core.SyncConfig
import de.ricorewi.easygames.core.SyncEngine
import java.io.File

/**
 * Hält die Singletons (Inhaltsspeicher, Sync-Engine, Koordinator). Wird auch gestartet, wenn nur der
 * WorkManager im Hintergrund einen Sync ausführt, daher darf hier keine UI-Logik stehen.
 */
class EasyGamesApplication : Application() {

    lateinit var coordinator: SyncCoordinator
        private set

    override fun onCreate() {
        super.onCreate()
        val baseline = AssetBaseline.openOrNull(assets)          // null, wenn kein Start-Inhalt im APK ist
        val store = ContentStore(File(filesDir, "content"), baseline)
        // autoCommit = false: Updates werden nie mitten im Spiel aktiviert (Stand bleibt "pending").
        val engine = SyncEngine(store, HttpFetcher(), BuildConfig.SYNC_BASE, SyncConfig(autoCommit = false))
        coordinator = SyncCoordinator(this, store, engine)
    }
}
