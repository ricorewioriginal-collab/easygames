package de.ricorewi.easygames.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import de.ricorewi.easygames.Covers
import de.ricorewi.easygames.EasyGamesApplication
import de.ricorewi.easygames.GameUi
import de.ricorewi.easygames.UiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Kartenbild aus der Bibliothek; solange es lädt oder fehlt: Farbverlauf mit dem Spiel-Symbol. */
@Composable
fun Cover(g: GameUi, modifier: Modifier = Modifier, corner: Dp = 16.dp) {
    val ctx = LocalContext.current
    val bmp by produceState(initialValue = Covers.cached(g.cover), g.cover) {
        if (value == null) value = withContext(Dispatchers.IO) {
            runCatching { Covers.load((ctx.applicationContext as? EasyGamesApplication)?.repo?.library, g.cover) }.getOrNull()
        }
    }
    Box(modifier.clip(RoundedCornerShape(corner)).background(EG.swatch(g.game.id)), contentAlignment = Alignment.Center) {
        val b = bmp
        if (b != null) Image(b.asImageBitmap(), null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        else Text(g.game.icon.ifEmpty { "🎮" }, fontSize = 40.sp)
    }
}

@Composable
fun Badge(text: String, bg: Color, fg: Color = Color.White) {
    Text(text, Modifier.clip(RoundedCornerShape(7.dp)).background(bg).padding(horizontal = 7.dp, vertical = 2.dp),
        color = fg, style = MaterialTheme.typography.labelSmall)
}

/** Kurztext unter einer Karte: Fortschritt, Warteschlange, Größe oder Spielzeit. */
fun subline(g: GameUi, s: UiState): String = when {
    s.busyId == g.game.id -> "Wird geladen … ${(s.progress * 100).toInt()} %"
    g.game.id in s.queue -> "Wartet auf Download"
    !g.status.installed -> size(g.status.size)
    g.status.playSeconds > 0 -> playTime(g.status.playSeconds)
    else -> "Installiert"
}

/** Spielekarte (Raster und Reihen). */
@Composable
fun GameCard(g: GameUi, s: UiState, width: Dp?, onClick: () -> Unit) {
    val busy = s.busyId == g.game.id
    Column((if (width != null) Modifier.width(width) else Modifier.fillMaxWidth()).clip(RoundedCornerShape(16.dp)).clickable(onClick = onClick)) {
        Box(Modifier.fillMaxWidth().aspectRatio(1f)) {
            Cover(g, Modifier.fillMaxSize())
            if (!g.status.installed && !busy) Box(Modifier.fillMaxSize().clip(RoundedCornerShape(16.dp)).background(Color(0x66080B12)))
            Row(Modifier.padding(8.dp), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                if (g.game.id in s.running) Badge("▶ LÄUFT", EG.green, Color(0xFF03150D))
                else if (g.status.update) Badge("UPDATE", EG.orange, Color(0xFF1B0D02))
                if (g.status.isNew) Badge("NEU", EG.pink)
            }
            when {
                busy -> LinearProgressIndicator(progress = { s.progress }, modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(5.dp),
                    color = EG.cyan, trackColor = Color(0x99000000))
                g.game.id in s.queue -> Corner("⏳", Modifier.align(Alignment.BottomEnd))
                !g.status.installed -> Corner("⬇", Modifier.align(Alignment.BottomEnd))
            }
        }
        Text(short(g), Modifier.padding(top = 8.dp, start = 2.dp), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(subline(g, s), Modifier.padding(start = 2.dp, bottom = 2.dp), color = EG.dim, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun Corner(t: String, m: Modifier) {
    Box(m.padding(8.dp).size(30.dp).clip(CircleShape).background(Color(0xD0080B12)), contentAlignment = Alignment.Center) { Text(t, fontSize = 14.sp) }
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier, action: String? = null, onAction: (() -> Unit)? = null) {
    Row(modifier.fillMaxWidth().padding(start = 20.dp, end = 12.dp, top = 22.dp, bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(text, Modifier.weight(1f), style = MaterialTheme.typography.titleLarge)
        if (action != null && onAction != null) Text(action, Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onAction).padding(8.dp), color = EG.cyan, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
    }
}

/** Großer Knopf im Markenverlauf (oder grün zum Spielen). */
@Composable
fun BigButton(text: String, modifier: Modifier = Modifier, brush: Brush = EG.grad, enabled: Boolean = true, onClick: () -> Unit) {
    Box(modifier.height(52.dp).clip(RoundedCornerShape(14.dp)).background(if (enabled) brush else Brush.linearGradient(listOf(EG.surface2, EG.surface2)))
        .clickable(enabled = enabled, onClick = onClick).padding(horizontal = 18.dp), contentAlignment = Alignment.Center) {
        Text(text, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, maxLines = 1)
    }
}

@Composable
fun OutlineButton(text: String, modifier: Modifier = Modifier, danger: Boolean = false, onClick: () -> Unit) {
    Box(modifier.height(44.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, if (danger) Color(0x66F87171) else EG.line, RoundedCornerShape(12.dp))
        .background(EG.surface2).clickable(onClick = onClick).padding(horizontal = 14.dp), contentAlignment = Alignment.Center) {
        Text(text, color = if (danger) Color(0xFFFECACA) else EG.text, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1)
    }
}

@Composable
fun Chip(text: String) {
    Text(text, Modifier.clip(RoundedCornerShape(20.dp)).background(EG.surface2).border(1.dp, EG.line, RoundedCornerShape(20.dp))
        .padding(horizontal = 10.dp, vertical = 5.dp), color = Color(0xFFC9D2E6), fontSize = 12.sp)
}

/** Hinweisleiste (Offline, neue App-Version, erste Einrichtung). */
@Composable
fun Banner(icon: String, text: String, accent: Color = EG.line, action: String? = null, onAction: (() -> Unit)? = null, onClose: (() -> Unit)? = null) {
    Row(Modifier.padding(horizontal = 16.dp, vertical = 6.dp).fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(EG.surface)
        .border(1.dp, accent, RoundedCornerShape(14.dp)).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(icon, fontSize = 20.sp)
        Spacer(Modifier.width(10.dp))
        Text(text, Modifier.weight(1f), fontSize = 13.sp, color = EG.text)
        if (action != null && onAction != null) Text(action, Modifier.clip(RoundedCornerShape(10.dp)).background(EG.violet).clickable(onClick = onAction)
            .padding(horizontal = 12.dp, vertical = 7.dp), fontWeight = FontWeight.Bold, fontSize = 13.sp)
        if (onClose != null) Text("✕", Modifier.clip(CircleShape).clickable(onClick = onClose).padding(8.dp), color = EG.muted)
    }
}

/** Laufender Download (über der Navigation). */
@Composable
fun DownloadBar(s: UiState, onClick: () -> Unit) {
    val g = s.busyId?.let { s.find(it) } ?: return
    Row(Modifier.fillMaxWidth().background(EG.surface).clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        Cover(g, Modifier.size(34.dp), 8.dp)
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(short(g) + (if (s.queue.isNotEmpty()) "  ·  +${s.queue.size} in der Warteschlange" else ""), fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(5.dp))
            LinearProgressIndicator(progress = { s.progress }, Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(3.dp)), color = EG.cyan, trackColor = EG.line)
        }
        Spacer(Modifier.width(12.dp))
        Text("${(s.progress * 100).toInt()} %", fontSize = 12.sp, color = EG.muted)
    }
}

@Composable
fun GradientTitle(text: String, size: Int = 26) {
    Text(text, style = MaterialTheme.typography.headlineMedium.copy(brush = EG.grad, fontSize = size.sp))
}

@Composable
fun RowScope.Stat(label: String, value: String) {
    Column(Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(EG.surface2).border(1.dp, EG.line, RoundedCornerShape(12.dp)).padding(12.dp)) {
        Text(label.uppercase(), color = EG.dim, fontSize = 10.5.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.6.sp)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

fun short(g: GameUi): String = g.game.title.substringBefore(" – ").trim()

fun size(b: Long): String = when {
    b >= 1_000_000_000 -> String.format("%.1f GB", b / 1e9).replace('.', ',')
    b >= 10_000_000 -> "${b / 1_000_000} MB"
    else -> String.format("%.1f MB", b / 1e6).replace('.', ',')
}

fun playTime(s: Long): String {
    if (s <= 0) return "noch nicht gespielt"
    val h = s / 3600
    val m = (s % 3600 + 30) / 60
    return if (h > 0) "$h Std. " + (if (m > 0) "$m Min." else "") else "${maxOf(1, m)} Min."
}

fun ago(ms: Long, now: Long = System.currentTimeMillis()): String {
    if (ms <= 0) return "–"
    val d = (now - ms) / 86_400_000.0
    return when {
        d < 1 -> "heute"; d < 2 -> "gestern"
        d < 30 -> "vor ${d.toInt()} Tagen"
        else -> java.text.SimpleDateFormat("dd.MM.yyyy", java.util.Locale.GERMANY).format(java.util.Date(ms))
    }
}

@Composable
fun IconText(icon: String, label: String, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) { Text(icon, fontSize = 18.sp); Spacer(Modifier.width(10.dp)); Text(label) }
}
