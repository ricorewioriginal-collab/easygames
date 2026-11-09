package de.ricorewi.easygames.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import de.ricorewi.easygames.Guide
import de.ricorewi.easygames.UiState
import de.ricorewi.easygames.core.Game
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

enum class Tab(val label: String, val icon: ImageVector) {
    HOME("Entdecken", Icons.Filled.Home),
    LIBRARY("Bibliothek", Icons.AutoMirrored.Filled.List),
    COMMUNITY("Community", Icons.Filled.Person),
    MORE("Mehr", Icons.Filled.Menu),
}

sealed interface Screen {
    data class Detail(val id: String) : Screen
    data class GuideOf(val id: String) : Screen
}

/** Navigationszustand (Reiter, geöffnete Seiten, Filter der Bibliothek). */
class Nav {
    var tab by mutableStateOf(Tab.HOME)
    val stack = mutableStateListOf<Screen>()
    var filter by mutableStateOf("all")
    var query by mutableStateOf("")

    fun open(s: Screen) { stack += s }
    fun back(): Boolean = if (stack.isNotEmpty()) { stack.removeAt(stack.lastIndex); true } else false
    fun showLibrary(f: String) { stack.clear(); filter = f; tab = Tab.LIBRARY }
}

/** Was die Oberfläche auslösen kann (umgesetzt in MainActivity; in Vorschau/Tests ohne Wirkung). */
interface Actions {
    fun install(id: String) {}
    fun cancel(id: String) {}
    fun uninstall(id: String) {}
    fun play(id: String) {}
    fun page(rel: String) {}
    fun share(g: Game) {}
    fun open(url: String) {}
    fun refresh() {}
    fun setAuto(on: Boolean) {}
    fun setWifiOnly(on: Boolean) {}
    fun appUpdate() {}
    fun dismissAppUpdate() {}
    fun guide(g: Game): Guide = Guide(emptyList())
}

@Composable
fun App(s: UiState, nav: Nav, actions: Actions, messages: Flow<String> = emptyFlow()) {
    val snack = remember { SnackbarHostState() }
    LaunchedEffect(messages) { messages.collect { snack.showSnackbar(it) } }
    BackHandler(enabled = nav.stack.isNotEmpty() || nav.tab != Tab.HOME) { if (!nav.back()) nav.tab = Tab.HOME }

    Scaffold(
        containerColor = EG.bg,
        snackbarHost = { SnackbarHost(snack) },
        bottomBar = {
            Column {
                DownloadBar(s) { s.busyId?.let { nav.open(Screen.Detail(it)) } }
                if (nav.stack.isEmpty()) NavigationBar(containerColor = EG.surface, tonalElevation = 0.dp) {
                    Tab.entries.forEach { t ->
                        val badge = if (t == Tab.LIBRARY) s.updates.size else 0
                        NavigationBarItem(
                            selected = nav.tab == t,
                            onClick = { nav.tab = t },
                            icon = {
                                Box {
                                    Icon(t.icon, contentDescription = t.label)
                                    if (badge > 0) Text("$badge", Modifier.align(Alignment.TopEnd).offset(x = 10.dp, y = (-6).dp).background(EG.orange, CircleShape)
                                        .padding(horizontal = 5.dp), color = Color(0xFF1B0D02), style = MaterialTheme.typography.labelSmall)
                                }
                            },
                            label = { Text(t.label) },
                            colors = NavigationBarItemDefaults.colors(indicatorColor = Color(0xFF2A2350), selectedIconColor = Color.White, selectedTextColor = Color.White,
                                unselectedIconColor = EG.muted, unselectedTextColor = EG.muted),
                        )
                    }
                }
            }
        },
    ) { pad ->
        Box(Modifier.fillMaxSize().padding(pad)) {
            val top = nav.stack.lastOrNull()
            AnimatedContent(targetState = top ?: nav.tab, transitionSpec = { fadeIn() togetherWith fadeOut() }, label = "screen") { target ->
                when (target) {
                    is Screen.Detail -> s.find(target.id)?.let { DetailScreen(it, s, nav, actions) } ?: LaunchedEffect(target) { nav.back() }
                    is Screen.GuideOf -> s.find(target.id)?.let { GuideScreen(it, actions.guide(it.game), nav) } ?: LaunchedEffect(target) { nav.back() }
                    Tab.HOME -> HomeScreen(s, nav, actions)
                    Tab.LIBRARY -> LibraryScreen(s, nav, actions)
                    Tab.COMMUNITY -> CommunityScreen(actions)
                    Tab.MORE -> MoreScreen(s, actions)
                    else -> {}
                }
            }
        }
    }
}
