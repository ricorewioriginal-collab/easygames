package de.ricorewi.easygames.ui

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import de.ricorewi.easygames.Categories
import de.ricorewi.easygames.GameUi
import de.ricorewi.easygames.Guide
import de.ricorewi.easygames.Origin
import de.ricorewi.easygames.UiState

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DetailScreen(g: GameUi, s: UiState, nav: Nav, a: Actions) {
    val id = g.game.id
    val busy = s.busyId == id
    val queued = id in s.queue
    val running = id in s.running
    var confirm by remember(id) { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        // Bühne: unscharfes Kartenbild als Hintergrund, Karte groß davor
        Box(Modifier.fillMaxWidth().height(300.dp)) {
            Cover(g, Modifier.fillMaxSize().alpha(0.55f).then(if (Build.VERSION.SDK_INT >= 31) Modifier.blur(28.dp) else Modifier), 0.dp)
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x33080B12), EG.bg))))
            Cover(g, Modifier.align(Alignment.Center).padding(top = 20.dp).size(210.dp), 24.dp)
            Row(Modifier.fillMaxWidth().padding(6.dp)) {
                IconButton(onClick = { nav.back() }, Modifier.clip(CircleShape).background(Color(0x99080B12))) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Zurück", tint = Color.White) }
                Spacer(Modifier.weight(1f))
                IconButton(onClick = { a.share(g.game) }, Modifier.clip(CircleShape).background(Color(0x99080B12))) { Icon(Icons.Filled.Share, "Teilen", tint = Color.White) }
            }
        }
        Column(Modifier.padding(horizontal = 20.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (running) Badge("▶ LÄUFT", EG.green, Color(0xFF03150D))
                if (g.status.update) Badge("UPDATE", EG.orange, Color(0xFF1B0D02))
                if (g.status.isNew) Badge("NEU", EG.pink)
            }
            Text(g.game.title, Modifier.padding(top = 6.dp), style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(10.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Categories.of(g.cat).let { Chip(it.icon + " " + it.label) }
                if (g.game.online) Chip("🌐 Online & Handys")
                if (g.game.multi) Chip("👥 Mehrspieler")
                if (g.game.pad) Chip("🎮 Controller")
                if (g.game.tv) Chip("📺 TV")
            }
            Spacer(Modifier.height(18.dp))
            // Hauptaktion
            when {
                busy -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        BigButton("⬇ ${(s.progress * 100).toInt()} %", Modifier.weight(1f), enabled = false) {}
                        Spacer(Modifier.width(8.dp)); OutlineButton("Abbrechen") { a.cancel(id) }
                    }
                    LinearProgressIndicator(progress = { s.progress }, Modifier.padding(top = 10.dp).fillMaxWidth().height(6.dp).clip(RoundedCornerShape(4.dp)), color = EG.cyan, trackColor = EG.line)
                    Hint("${size(s.done)} von ${size(if (s.total > 0) s.total else g.status.size)}")
                }
                queued -> Row(verticalAlignment = Alignment.CenterVertically) {
                    BigButton("⏳ In der Warteschlange", Modifier.weight(1f), enabled = false) {}
                    Spacer(Modifier.width(8.dp)); OutlineButton("Entfernen") { a.cancel(id) }
                }
                !g.status.installed -> {
                    BigButton("⬇ Installieren · ${size(g.status.size)}", Modifier.fillMaxWidth()) { a.install(id) }
                    Hint("Danach auch ohne Internet spielbar.")
                }
                else -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        BigButton(if (running) "▶ Zum Spiel" else "▶ Spielen", Modifier.weight(1f), EG.play) { a.play(id) }
                        if (g.status.update) { Spacer(Modifier.width(8.dp)); OutlineButton("⟳ Update") { a.install(id) } }
                    }
                    Hint(if (g.status.update) (if (s.autoUpdate) "Update verfügbar – wird automatisch geladen." else "Update verfügbar.") else "Aktuell · offline spielbar")
                }
            }
            if (g.game.online) Text("🌐 Online-Mehrspieler läuft über easygames: Mitspieler treten per Link, Code oder QR von überall bei – Browser, Handy, App und TV.",
                Modifier.padding(top = 4.dp), color = EG.muted, fontSize = 13.sp)
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Stat("Spielzeit", playTime(g.status.playSeconds)); Stat("Zuletzt", ago(g.status.lastPlayed)) }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Stat("Größe", size(g.status.size))
                Stat("Status", if (g.status.installed) (if (g.status.update) "Update offen" else "Installiert") else "Nicht installiert")
            }
            Text(g.game.desc, Modifier.padding(vertical = 18.dp), color = Color(0xFFC3CBDD), fontSize = 14.5.sp, lineHeight = 22.sp)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlineButton("📖 Anleitung") { nav.open(Screen.GuideOf(id)) }
                OutlineButton("↗ Im Browser") { a.open(Origin.PUBLIC + g.game.entry) }
                if (g.status.installed && !running) OutlineButton(if (confirm) "Wirklich entfernen?" else "🗑 Deinstallieren", danger = true) {
                    if (confirm) { a.uninstall(id); confirm = false } else confirm = true
                }
            }
            if (confirm) Hint("Spielstände bleiben erhalten.")
            if (g.status.needs.isNotEmpty()) Hint("Nutzt Dateien von: " + g.status.needs.joinToString(", ") { n -> s.games.firstOrNull { it.game.folder == n }?.let { short(it) } ?: n.removePrefix("vendor/") } + " (automatisch mitinstalliert)")
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun Hint(t: String) = Text(t, Modifier.padding(top = 8.dp), color = EG.dim, fontSize = 12.5.sp)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuideScreen(g: GameUi, guide: Guide, nav: Nav) {
    var tab by rememberSaveable(g.game.id) { mutableIntStateOf(0) }
    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().padding(6.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { nav.back() }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Zurück", tint = Color.White) }
            Column {
                Text("Anleitung", color = EG.muted, fontSize = 12.sp)
                Text(short(g), style = MaterialTheme.typography.titleLarge)
            }
        }
        if (guide.tabs.isEmpty()) { Empty("Noch keine Anleitung", "Für dieses Spiel gibt es noch keine Anleitung."); return@Column }
        PrimaryScrollableTabRow(selectedTabIndex = tab.coerceAtMost(guide.tabs.lastIndex), containerColor = EG.bg, contentColor = Color.White, edgePadding = 12.dp) {
            guide.tabs.forEachIndexed { i, (name, _) -> Tab(tab == i, { tab = i }, text = { Text(name) }, selectedContentColor = Color.White, unselectedContentColor = EG.muted) }
        }
        val sections = guide.tabs[tab.coerceAtMost(guide.tabs.lastIndex)].second
        LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            items(sections) { sec ->
                Column {
                    Text(sec.title, style = MaterialTheme.typography.titleMedium, color = Color.White)
                    sec.paragraphs.forEach { Text(it, Modifier.padding(top = 6.dp), color = Color(0xFFC3CBDD), lineHeight = 21.sp) }
                    sec.list.forEach { Row(Modifier.padding(top = 5.dp)) { Text("•  ", color = EG.cyan); Text(it, color = Color(0xFFC3CBDD), lineHeight = 21.sp) } }
                    sec.steps.forEachIndexed { i, t -> Row(Modifier.padding(top = 5.dp)) { Text("${i + 1}.  ", color = EG.cyan, fontWeight = FontWeight.Bold); Text(t, color = Color(0xFFC3CBDD), lineHeight = 21.sp) } }
                }
            }
        }
    }
}
