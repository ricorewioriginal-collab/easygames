package de.ricorewi.easygames

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.lifecycleScope
import de.ricorewi.easygames.core.Game
import de.ricorewi.easygames.ui.Actions
import de.ricorewi.easygames.ui.App
import de.ricorewi.easygames.ui.EasyGamesTheme
import de.ricorewi.easygames.ui.Nav
import de.ricorewi.easygames.ui.Screen
import de.ricorewi.easygames.ui.Tab
import kotlinx.coroutines.launch

/**
 * Native Startseite der App (Jetpack Compose): Entdecken, Bibliothek, Community, Mehr. Spiele werden einzeln installiert
 * und in [GameActivity] gestartet. easygames-Links (Einladungen, geteilte Spiele) öffnen direkt hier.
 */
class MainActivity : ComponentActivity(), Actions {

    private lateinit var repo: Repo
    private val nav = Nav()
    private var lastRefresh = 0L
    /** Spiel, das nach der Installation starten soll (Link von außen): Spiel-ID und Pfad samt Query/Hash. */
    private var pendingLaunch: Pair<String, String>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(SystemBarStyle.dark(0xFF080B12.toInt()), SystemBarStyle.dark(0xFF0F1522.toInt()))
        repo = EasyGamesApplication.repo(this)
        setContent {
            val state by repo.state.collectAsState()
            EasyGamesTheme { App(state, nav, this, repo.events) }
        }
        lifecycleScope.launch {
            repo.state.collect { s ->
                val (id, rel) = pendingLaunch ?: return@collect
                if (s.find(id)?.status?.installed == true && s.busyId != id) { pendingLaunch = null; GameActivity.startGame(this@MainActivity, id, rel) }
                else if (s.busyId == null && id !in s.queue && s.find(id)?.status?.installed != true && !s.refreshing && s.games.isNotEmpty()) pendingLaunch = null
            }
        }
        if (savedInstanceState == null) handle(intent)
        askNotifications()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handle(intent)
    }

    override fun onResume() {
        super.onResume()
        // Neue Spiele und Updates beim Start und beim Zurückkehren (höchstens alle 10 Minuten)
        val now = SystemClock.elapsedRealtime()
        if (lastRefresh == 0L || now - lastRefresh > 10 * 60_000) { lastRefresh = now; repo.refresh() }
        else repo.publish()
    }

    private fun handle(intent: Intent?) {
        intent ?: return
        when (intent.getStringExtra(EXTRA_TAB)) {
            EXTRA_TAB_MORE -> { nav.stack.clear(); nav.tab = Tab.MORE }
            EXTRA_TAB_NEW -> nav.showLibrary("new")
            EXTRA_TAB_UPDATES -> nav.showLibrary("updates")
        }
        val uri = intent.data ?: return
        if (intent.action != Intent.ACTION_VIEW) return
        val rel = Origin.relPath(uri) ?: return
        val file = rel.substringBefore('?')
        if (file.isEmpty() || file == "index.html") return
        val withQuery = rel + (uri.encodedQuery?.let { "?$it" } ?: "") + (uri.encodedFragment?.let { "#$it" } ?: "")
        val folder = file.substringBefore('/')
        val game = repo.library.catalog?.byFolder(folder)
        if (game == null || !file.contains('/')) {
            if (file.endsWith(".html")) page(withQuery)   // Konto, Profil, Ranglisten …
            return
        }
        // Einladung oder geteiltes Spiel: installiert -> direkt starten, sonst installieren und danach starten
        nav.stack.clear(); nav.tab = Tab.HOME; nav.open(Screen.Detail(game.id))
        if (repo.library.status(game).installed) GameActivity.startGame(this, game.id, withQuery)
        else { pendingLaunch = game.id to withQuery; install(game.id) }
    }

    private fun askNotifications() {
        if (Build.VERSION.SDK_INT < 33) return
        val prefs = getSharedPreferences("easygames", MODE_PRIVATE)
        if (prefs.getBoolean("asked_notify", false) || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return
        prefs.edit().putBoolean("asked_notify", true).apply()
        requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 7)
    }

    // ------------------------------------------------------------------ Actions

    override fun install(id: String) = repo.install(id)
    override fun cancel(id: String) { if (pendingLaunch?.first == id) pendingLaunch = null; repo.cancel(id) }
    override fun uninstall(id: String) = repo.uninstall(id)
    override fun refresh() { lastRefresh = SystemClock.elapsedRealtime(); repo.refresh(manual = true) }
    override fun setAuto(on: Boolean) { repo.autoUpdate = on }
    override fun setWifiOnly(on: Boolean) { repo.wifiOnly = on }
    override fun dismissAppUpdate() = repo.dismissAppUpdate()
    override fun appUpdate() = open(BuildConfig.UPDATE_APK_URL)
    override fun guide(g: Game): Guide = Guides.load(repo.library, g)

    override fun play(id: String) {
        val g = repo.library.find(id) ?: return
        if (!repo.library.status(g).installed) { install(id); return }
        GameActivity.startGame(this, id, g.entry)
    }

    override fun page(rel: String) {
        if (repo.library.open(rel.substringBefore('?').substringBefore('#')) == null) {
            Toast.makeText(this, if (repo.state.value.online) "Einen Moment – die Seite wird noch geladen." else "Für diese Seite einmal mit dem Internet verbinden.", Toast.LENGTH_LONG).show()
            repo.refresh()
            return
        }
        GameActivity.startPage(this, rel)
    }

    override fun share(g: Game) {
        val link = Origin.PUBLIC + g.entry
        val text = "${Repo.short(g)} – kostenlos spielen bei easygames: $link"
        startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text).putExtra(Intent.EXTRA_SUBJECT, Repo.short(g)), "Spiel teilen"))
    }

    override fun trailer(url: String) = TrailerActivity.start(this, url)

    override fun open(url: String) {
        try {
            val view = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addCategory(Intent.CATEGORY_BROWSABLE)
            // easygames-Adressen öffnet sonst diese App selbst: hier ausdrücklich im Browser
            if (url.startsWith(Origin.PUBLIC)) startActivity(Intent.createChooser(view, "Öffnen mit")
                .putExtra(Intent.EXTRA_EXCLUDE_COMPONENTS, arrayOf(android.content.ComponentName(this, MainActivity::class.java))))
            else startActivity(view)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, R.string.toast_no_browser, Toast.LENGTH_SHORT).show()
        }
    }

    companion object {
        const val EXTRA_TAB = "tab"
        const val EXTRA_TAB_MORE = "more"
        const val EXTRA_TAB_NEW = "new"
        const val EXTRA_TAB_UPDATES = "updates"
    }
}
