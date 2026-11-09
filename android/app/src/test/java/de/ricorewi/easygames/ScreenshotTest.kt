package de.ricorewi.easygames

import android.app.Application
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import de.ricorewi.easygames.core.Catalog
import de.ricorewi.easygames.core.GameStatus
import de.ricorewi.easygames.core.Manifest
import de.ricorewi.easygames.ui.Actions
import de.ricorewi.easygames.ui.App
import de.ricorewi.easygames.ui.EasyGamesTheme
import de.ricorewi.easygames.ui.Nav
import de.ricorewi.easygames.ui.Screen
import de.ricorewi.easygames.ui.Tab
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * Bildschirmfotos der nativen Oberfläche mit echten easygames-Daten (Katalog, Kategorien, Vorschaubilder, Anleitungen aus dem Repo).
 * Läuft ohne Gerät: ./gradlew :app:testDebugUnitTest  → Bilder in app/build/screenshots
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], application = Application::class, qualifiers = "w411dp-h891dp-xxhdpi")
class ScreenshotTest {
    @get:Rule val compose = createComposeRule()

    private val repo = File(System.getProperty("easygames.repo") ?: "../..")
    private val out = File(System.getProperty("easygames.shots") ?: "build/screenshots").apply { mkdirs() }
    private val catalog = Catalog.parse(File(repo, "sync/catalog.json").readText())
    private val manifest = Manifest.parse(File(repo, "sync/manifest.json").readText())
    private val day = 86_400_000L
    private val now = System.currentTimeMillis()

    private fun state(busy: String? = "anmacha-kart", done: Long = 690_000, total: Long = 1_470_000, online: Boolean = true, update: AppUpdate.Info? = null): UiState {
        val cats = Categories.parse(File(repo, "categories.js").readText())
        val installed = mapOf("schatzfieber" to (7920L to now - 3_600_000), "zotik" to (27_000L to now - 5 * 3_600_000), "ricopoly" to (50_400L to now - day),
            "anmacha-flipper" to (2_160L to now - 2 * day), "riftzone" to (0L to 0L), "anmacha-quiz" to (3_960L to now - 4 * day))
        val games = catalog.games.map { g ->
            val thumb = "thumbs/${g.id}.webp"
            val cover = if (File(repo, thumb).isFile) thumb else g.img
            val inst = installed[g.id]
            val size = manifest.files.filter { it.p.startsWith(g.folder + "/") }.sumOf { it.s }
            GameUi(g, GameStatus(inst != null, g.id == "anmacha-flipper", g.id in setOf("schatzfieber", "radio-bingo", "leuchtfeuer"), size,
                inst?.first ?: 0, inst?.second ?: 0, if (g.id == "anmacha-funkparcours") listOf("easyclash") else emptyList()), cats[g.id] ?: "mehr", cover)
        }
        return UiState(games, online = online, baseReady = true, busyId = busy, done = done, total = total, queue = if (busy != null) listOf("anmacha-memory") else emptyList(),
            autoUpdate = false, disk = 41_800_000, appUpdate = update)
    }

    private val actions = object : Actions {
        override fun guide(g: de.ricorewi.easygames.core.Game): Guide = Guides.parse(g, File(repo, "guides/${g.id}.json").takeIf { it.isFile }?.readText())
    }

    private fun shot(name: String, s: UiState, setup: Nav.() -> Unit) {
        val nav = Nav().apply(setup)
        Covers.files = { File(repo, it).takeIf { f -> f.isFile } }
        compose.setContent { EasyGamesTheme { App(s, nav, actions) } }
        compose.waitForIdle()
        Thread.sleep(2500)          // Kartenbilder werden im Hintergrund geladen
        compose.waitForIdle()
        val f = File(out, "$name.png")
        compose.onRoot().captureRoboImage(f.path)
        assertTrue("Bild fehlt: $f", f.isFile && f.length() > 10_000)
    }

    @Test fun home() = shot("1-entdecken", state()) { tab = Tab.HOME }
    @Test fun library() = shot("2-bibliothek", state(busy = null)) { tab = Tab.LIBRARY }
    @Test fun libraryAdventure() = shot("3-bibliothek-abenteuer", state(busy = null)) { tab = Tab.LIBRARY; filter = "cat:abenteuer" }
    @Test fun detailInstalled() = shot("4-spiel-installiert", state(busy = null)) { tab = Tab.LIBRARY; open(Screen.Detail("schatzfieber")) }
    @Test fun detailDownloading() = shot("5-spiel-download", state(busy = "radio-bingo", done = 410_000, total = 690_000)) { open(Screen.Detail("radio-bingo")) }
    @Test fun guide() = shot("6-anleitung", state(busy = null)) { open(Screen.GuideOf("schatzfieber")) }
    @Test fun community() = shot("7-community", state(busy = null)) { tab = Tab.COMMUNITY }
    @Test fun more() = shot("8-mehr", state(busy = null, update = AppUpdate.Info(42, "2.1.0"))) { tab = Tab.MORE }
    @Test fun offline() = shot("9-offline", state(busy = null, online = false)) { tab = Tab.HOME }
}
