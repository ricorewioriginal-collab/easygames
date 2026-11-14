package de.ricorewi.easygames.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import de.ricorewi.easygames.BuildConfig
import de.ricorewi.easygames.Categories
import de.ricorewi.easygames.GameUi
import de.ricorewi.easygames.Origin
import de.ricorewi.easygames.R
import de.ricorewi.easygames.UiState

// ====================================================================== Entdecken

@Composable
fun HomeScreen(s: UiState, nav: Nav, a: Actions) {
    val byName = compareBy<GameUi> { short(it).lowercase() }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 24.dp)) {
        item {
            Row(Modifier.fillMaxWidth().padding(start = 20.dp, end = 8.dp, top = 18.dp), verticalAlignment = Alignment.CenterVertically) {
                Image(painterResource(R.drawable.ic_launcher_foreground), null, Modifier.size(46.dp).clip(RoundedCornerShape(12.dp)).background(EG.grad))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    GradientTitle("easygames")
                    Text("${s.games.size} Spiele · ${s.games.count { it.status.installed }} installiert", color = EG.muted, fontSize = 13.sp)
                }
                IconButton(onClick = { nav.showLibrary("all") }) { Icon(Icons.Filled.Search, "Suchen", tint = EG.text) }
                IconButton(onClick = a::refresh) { Icon(Icons.Filled.Refresh, "Nach neuen Spielen und Updates suchen", tint = if (s.refreshing) EG.cyan else EG.text) }
            }
        }
        item { Banners(s, a) }
        if (s.games.isEmpty()) {
            item { Empty(if (!s.online) "Keine Verbindung" else "Spiele werden geladen …", if (!s.online) "Beim ersten Start lädt easygames einmal die Spieleliste. Bitte mit dem Internet verbinden." else "Einen Moment – die Spieleliste kommt gleich.") }
            return@LazyColumn
        }
        val recent = s.games.filter { it.status.lastPlayed > 0 }.sortedByDescending { it.status.lastPlayed }
        if (recent.isNotEmpty()) item { GameRow("Weiterspielen", recent.take(10), s, nav) }
        else item { Hero(s, nav) }
        val ups = s.updates
        if (ups.isNotEmpty() && !s.autoUpdate) item {
            GameRow("Updates verfügbar (${ups.size})", ups, s, nav, action = "Alle aktualisieren") { ups.forEach { a.install(it.game.id) } }
        }
        val fresh = s.games.filter { it.status.isNew }
        if (fresh.isNotEmpty()) item { GameRow("Neu bei easygames", fresh, s, nav, action = "Alle") { nav.showLibrary("new") } }
        // automatisch aus dem Katalog (promo/<id>-trailer-*.mp4, weitere: -trailer2-…), Video lädt online; jeder Trailer eine Karte
        val trailers = s.games.flatMap { g -> g.game.trailers.ifEmpty { listOfNotNull(g.game.trailer) }.mapIndexed { i, t -> Triple(g, i, t) } }
        if (trailers.isNotEmpty()) item {
            Column {
                SectionTitle("🎬  Trailer")
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(trailers, key = { "tr-" + it.first.game.id + "-" + it.second }) { (g, _, t) -> GameCard(g, s, 132.dp) { a.trailer(Origin.PUBLIC + t) } }
                }
            }
        }
        item { ChallengeCard(a) }
        Categories.ALL.forEach { c ->
            val list = s.games.filter { it.cat == c.id }.sortedWith(byName)
            if (list.isNotEmpty()) item(key = c.id) { GameRow("${c.icon}  ${c.label}", list, s, nav, action = "Alle") { nav.showLibrary("cat:" + c.id) } }
        }
    }
}

@Composable
fun Banners(s: UiState, a: Actions) {
    s.appUpdate?.let { u -> Banner("🚀", "easygames ${u.versionName} ist da – neue App-Version herunterladen.", EG.violet, "Laden", a::appUpdate, a::dismissAppUpdate) }
    if (!s.online && s.games.isNotEmpty()) Banner("📴", "Offline: installierte Spiele laufen weiter. Neue Spiele und Online-Mehrspieler brauchen Internet.", EG.orange)
    else if (!s.baseReady && s.refreshing) Banner("⏳", "Spieleliste und gemeinsame Dateien werden geladen …")
}

@Composable
private fun Hero(s: UiState, nav: Nav) {
    val pick = s.games.firstOrNull { it.status.isNew } ?: s.games.firstOrNull { it.cat == "abenteuer" } ?: s.games.first()
    Box(Modifier.padding(16.dp).fillMaxWidth().height(190.dp).clip(RoundedCornerShape(22.dp)).clickable { nav.open(Screen.Detail(pick.game.id)) }) {
        Cover(pick, Modifier.fillMaxSize(), 22.dp)
        Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xE6080B12)))))
        Column(Modifier.align(Alignment.BottomStart).padding(18.dp)) {
            Text("WILLKOMMEN BEI EASYGAMES", color = EG.cyan, style = MaterialTheme.typography.labelSmall)
            Text(short(pick), style = MaterialTheme.typography.headlineSmall)
            Text("Tippe auf ein Spiel, installiere es und spiel los – auch offline.", color = Color(0xFFC3CBDD), fontSize = 13.sp)
        }
    }
}

@Composable
fun GameRow(title: String, list: List<GameUi>, s: UiState, nav: Nav, action: String? = null, onAction: (() -> Unit)? = null) {
    Column {
        SectionTitle(title, action = action, onAction = onAction)
        LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(list, key = { it.game.id }) { g -> GameCard(g, s, 132.dp) { nav.open(Screen.Detail(g.game.id)) } }
        }
    }
}

@Composable
private fun ChallengeCard(a: Actions) {
    Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp).fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(EG.grad)
        .clickable { a.page("heute.html") }.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
        Text("🏆", fontSize = 34.sp)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text("Tages-Challenge", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            Text("Jeden Tag ein Spiel, eine Rangliste – wer schafft heute den besten Wert?", color = Color(0xF2FFFFFF), fontSize = 13.sp)
        }
    }
}

@Composable
fun Empty(title: String, text: String) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 32.dp, vertical = 60.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(6.dp))
        Text(text, color = EG.muted, fontSize = 14.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}

// ====================================================================== Bibliothek

@Composable
fun LibraryScreen(s: UiState, nav: Nav, a: Actions) {
    val filters = buildList {
        add("all" to "Alle ${s.games.size}")
        add("installed" to "Installiert ${s.games.count { it.status.installed }}")
        val u = s.updates.size; if (u > 0) add("updates" to "Updates $u")
        val n = s.games.count { it.status.isNew }; if (n > 0) add("new" to "Neu $n")
        Categories.ALL.forEach { c -> val k = s.games.count { it.cat == c.id }; if (k > 0) add("cat:" + c.id to "${c.icon} ${c.short} $k") }
    }
    val q = nav.query.trim().lowercase()
    val list = s.games.filter { g ->
        when {
            nav.filter == "installed" -> g.status.installed
            nav.filter == "updates" -> g.status.update
            nav.filter == "new" -> g.status.isNew
            nav.filter.startsWith("cat:") -> g.cat == nav.filter.removePrefix("cat:")
            else -> true
        } && (q.isEmpty() || (g.game.title + " " + g.game.desc).lowercase().contains(q))
    }.sortedWith(compareBy<GameUi>({ if (it.game.id in s.running) 0 else if (it.status.installed) 1 else 2 }, { short(it).lowercase() }).let { c ->
        if (nav.filter == "all" && q.isEmpty()) compareByDescending<GameUi> { it.status.isNew }.then(c) else c
    })
    LazyVerticalGrid(GridCells.Adaptive(148.dp), Modifier.fillMaxSize(), contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Row(Modifier.padding(top = 18.dp, bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Bibliothek", Modifier.weight(1f), style = MaterialTheme.typography.headlineMedium)
                    IconButton(onClick = a::refresh) { Icon(Icons.Filled.Refresh, "Aktualisieren", tint = if (s.refreshing) EG.cyan else EG.text) }
                }
                OutlinedTextField(nav.query, { nav.query = it }, Modifier.fillMaxWidth(), placeholder = { Text("Spiele suchen …") }, singleLine = true,
                    leadingIcon = { Icon(Icons.Filled.Search, null) }, shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = EG.violet, unfocusedBorderColor = EG.line, focusedContainerColor = EG.surface, unfocusedContainerColor = EG.surface))
                LazyRow(Modifier.padding(vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(filters, key = { it.first }) { (id, label) ->
                        FilterChip(nav.filter == id, { nav.filter = id }, { Text(label) },
                            colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Color(0xFF2A2350), selectedLabelColor = Color.White, labelColor = EG.muted, containerColor = EG.surface))
                    }
                }
                Banners(s, a)
            }
        }
        if (list.isEmpty()) item(span = { GridItemSpan(maxLineSpan) }) {
            Empty(if (nav.filter == "installed") "Noch nichts installiert" else if (s.games.isEmpty()) "Spiele werden geladen …" else "Keine Treffer",
                if (nav.filter == "installed") "Wähle ein Spiel und tippe auf Installieren – danach läuft es auch offline." else "Versuch einen anderen Suchbegriff oder Filter.")
        }
        items(list, key = { it.game.id }) { g -> GameCard(g, s, null) { nav.open(Screen.Detail(g.game.id)) } }
    }
}

// ====================================================================== Community

private data class Entry(val icon: String, val title: String, val text: String, val rel: String)

private val COMMUNITY = listOf(
    Entry("🏆", "Tages-Challenge", "Ein Spiel pro Tag, eine gemeinsame Rangliste", "heute.html"),
    Entry("👤", "Konto & Anmeldung", "Mit Google anmelden – Spielstände auf allen Geräten", "konto.html"),
    Entry("👥", "Profil & Freunde", "Spitzname, Avatar, Freunde einladen", "profil.html"),
    Entry("🏅", "Erfolge", "Medaillen und Ränge über alle Spiele", "erfolge.html"),
    Entry("📊", "Ranglisten", "Bestenlisten aller Spiele", "ranglisten.html"),
    Entry("💬", "Chat", "Mit anderen Spielerinnen und Spielern schreiben", "chat.html"),
    Entry("🐞", "Fehler melden", "Etwas klappt nicht? Sag uns Bescheid", "bug.html"),
)

@Composable
fun CommunityScreen(a: Actions) {
    LazyVerticalGrid(GridCells.Adaptive(300.dp), Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column(Modifier.padding(top = 2.dp, bottom = 6.dp)) {
                Text("Community", style = MaterialTheme.typography.headlineMedium)
                Text("Konto, Freunde, Erfolge und Ranglisten – dieselben wie auf easygames, im Browser und in der RicoReWi-Radio-App.", color = EG.muted, fontSize = 14.sp)
            }
        }
        items(COMMUNITY, key = { it.rel }) { e ->
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(EG.surface).border(1.dp, EG.line, RoundedCornerShape(18.dp))
                .clickable { a.page(e.rel) }.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(EG.surface2), contentAlignment = Alignment.Center) { Text(e.icon, fontSize = 24.sp) }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(e.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(e.text, color = EG.muted, fontSize = 13.sp)
                }
                Text("›", color = EG.dim, fontSize = 22.sp)
            }
        }
        item(span = { GridItemSpan(maxLineSpan) }) {
            Banner("🌐", "Online & Mehrspieler: Spiele mit „Online & Handys“ laden Mitspieler per Link, Code oder QR ein. Die Links führen zu easygames – so kann jeder mitspielen, im Browser, am Handy, in der App und am TV.", EG.cyan)
        }
    }
}

// ====================================================================== Mehr

@Composable
fun MoreScreen(s: UiState, a: Actions) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 24.dp)) {
        Text("Mehr", Modifier.padding(start = 20.dp, top = 18.dp), style = MaterialTheme.typography.headlineMedium)
        Banners(s, a)
        Group("Einstellungen") {
            Toggle("Updates automatisch laden", "Installierte Spiele aktualisieren sich von selbst (nie während du spielst).", s.autoUpdate, a::setAuto)
            Toggle("Updates nur im WLAN", "Automatische Updates im Hintergrund nur über WLAN.", s.wifiOnly, a::setWifiOnly)
            Line("Nach neuen Spielen und Updates suchen", if (s.refreshing) "Suche läuft …" else "Spieleliste vom Server abgleichen", a::refresh)
            Info("Speicher", "${size(s.disk)} belegt · ${s.games.count { it.status.installed }} Spiele installiert")
        }
        Group("App") {
            Info("Version", BuildConfig.VERSION_NAME + if (s.appUpdate != null) "  ·  Version ${s.appUpdate.versionName} verfügbar" else "")
            if (s.appUpdate != null) Line("Neue App-Version herunterladen", "easygames ${s.appUpdate.versionName}", a::appUpdate)
            Line("easygames im Browser", "ricorewioriginal-collab.github.io/easygames") { a.open(Origin.PUBLIC) }
            Line("RicoReWi Radio", "Radio, Spiele und Apps von RicoReWi") { a.open("https://www.ricorewi-radio.de/") }
        }
        Group("Unterstützen") {
            Line("☕ Kaffee spendieren", "Alle Spiele sind kostenlos – jede Spende hilft, neue zu bauen") { a.open("https://buymeacoffee.com/easygames") }
            Line("💙 Mit PayPal spenden", "Danke! ♥") { a.open("https://www.paypal.com/donate/?hosted_button_id=QQLF3ADU2T46S") }
        }
        Group("Rechtliches") {
            Line("Impressum", "ricorewi.de") { a.open(Origin.LEGAL_IMPRINT) }
            Line("Datenschutz", "ricorewi.de") { a.open(Origin.LEGAL_PRIVACY) }
        }
        Text("By RicoReWi × AnMaCha", Modifier.fillMaxWidth().padding(top = 18.dp), color = EG.dim, fontSize = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}

@Composable
private fun Group(title: String, content: @Composable () -> Unit) {
    Text(title.uppercase(), Modifier.padding(start = 24.dp, top = 22.dp, bottom = 8.dp), color = EG.dim, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    Column(Modifier.padding(horizontal = 16.dp).fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(EG.surface).border(1.dp, EG.line, RoundedCornerShape(18.dp))) { content() }
}

@Composable
private fun Line(title: String, sub: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text(title, fontWeight = FontWeight.SemiBold); Text(sub, color = EG.muted, fontSize = 12.5.sp) }
        Text("›", color = EG.dim, fontSize = 20.sp)
    }
}

@Composable
private fun Info(title: String, sub: String) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp)) { Text(title, fontWeight = FontWeight.SemiBold); Text(sub, color = EG.muted, fontSize = 12.5.sp) }
}

@Composable
private fun Toggle(title: String, sub: String, on: Boolean, set: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().clickable { set(!on) }.padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text(title, fontWeight = FontWeight.SemiBold); Text(sub, color = EG.muted, fontSize = 12.5.sp) }
        Spacer(Modifier.width(10.dp))
        Switch(on, set, colors = SwitchDefaults.colors(checkedTrackColor = EG.violet, checkedThumbColor = Color.White, uncheckedTrackColor = EG.line, uncheckedBorderColor = EG.line))
    }
}

