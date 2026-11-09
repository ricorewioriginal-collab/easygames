package de.ricorewi.easygames.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/** Farben der easygames-Marke (wie Webseite und Windows-Client). */
object EG {
    val bg = Color(0xFF080B12)
    val surface = Color(0xFF0F1522)
    val surface2 = Color(0xFF161E30)
    val line = Color(0xFF242E46)
    val text = Color(0xFFEEF2FB)
    val muted = Color(0xFF8B97B2)
    val dim = Color(0xFF5D6984)
    val cyan = Color(0xFF22D3EE)
    val violet = Color(0xFF8B5CF6)
    val pink = Color(0xFFEC4899)
    val orange = Color(0xFFFB923C)
    val green = Color(0xFF34D399)
    val grad = Brush.linearGradient(listOf(Color(0xFF06C8F0), Color(0xFF7C5CF6), Color(0xFFEC4899)))
    val play = Brush.linearGradient(listOf(Color(0xFF10B981), Color(0xFF22C55E)))

    /** Kräftige Ersatzfarben für Karten ohne Bild (je Spiel fest). */
    private val swatches = listOf(
        listOf(0xFF0EA5E9, 0xFF6366F1), listOf(0xFF8B5CF6, 0xFFEC4899), listOf(0xFFF97316, 0xFFEF4444),
        listOf(0xFF10B981, 0xFF0EA5E9), listOf(0xFFF59E0B, 0xFFEC4899), listOf(0xFF6366F1, 0xFF22D3EE),
    )
    fun swatch(id: String): Brush = swatches[(id.hashCode() and 0x7fffffff) % swatches.size].let { c ->
        Brush.linearGradient(c.map { Color(it) })
    }
}

private val scheme = darkColorScheme(
    primary = EG.violet, onPrimary = Color.White, secondary = EG.cyan, tertiary = EG.pink,
    background = EG.bg, onBackground = EG.text, surface = EG.surface, onSurface = EG.text,
    surfaceVariant = EG.surface2, onSurfaceVariant = EG.muted, outline = EG.line, outlineVariant = EG.line,
    surfaceContainer = EG.surface, surfaceContainerHigh = EG.surface2, surfaceContainerHighest = EG.surface2,
    secondaryContainer = Color(0xFF2A2350), onSecondaryContainer = Color.White, error = Color(0xFFF87171),
)

private val type = Typography().let { t ->
    t.copy(
        headlineMedium = t.headlineMedium.copy(fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.5).sp),
        headlineSmall = t.headlineSmall.copy(fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.3).sp),
        titleLarge = t.titleLarge.copy(fontWeight = FontWeight.Bold),
        titleMedium = t.titleMedium.copy(fontWeight = FontWeight.Bold),
        labelSmall = TextStyle(fontSize = 10.5.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.6.sp),
    )
}

@Composable
fun EasyGamesTheme(content: @Composable () -> Unit) = MaterialTheme(colorScheme = scheme, typography = type, content = content)
