package de.ricorewi.easygames

import de.ricorewi.easygames.core.Library

/** Die 7 Kategorien von easygames (wie auf der Webseite, im Portal und in der RicoReWi-Radio-App) plus „Weitere Spiele“. */
data class Category(val id: String, val label: String, val short: String, val icon: String)

object Categories {
    val ALL = listOf(
        Category("abenteuer", "Abenteuer & Rollenspiel", "Abenteuer", "🧭"),
        Category("action", "Action & Geschick", "Action", "⚡"),
        Category("denken", "Denken & Puzzle", "Puzzle", "🧩"),
        Category("quiz", "Quiz & Shows", "Quiz", "❓"),
        Category("sim", "Simulation & Kreativ", "Simulation", "🏗️"),
        Category("tisch", "Tisch, Karten & Glück", "Tisch", "🎲"),
        Category("musik", "Musik & Rhythmus", "Musik", "🎵"),
        Category("mehr", "Weitere Spiele", "Weitere", "✨"),
    )

    fun of(id: String): Category = ALL.firstOrNull { it.id == id } ?: ALL.last()

    private val PAIR = Regex("""['"]([^'"]+)['"]\s*:\s*['"]([a-z]+)['"]""")

    /** Spiel-ID → Kategorie aus `categories.js` der easygames-Seite (Teil der Basis, also offline vorhanden). */
    fun load(library: Library): Map<String, String> {
        val text = try { library.open("categories.js")?.readText() } catch (e: Exception) { null } ?: return emptyMap()
        return parse(text)
    }

    fun parse(text: String): Map<String, String> {
        val of = text.substringAfter("of:", "")
        val ids = ALL.map { it.id }.toSet()
        return PAIR.findAll(of).filter { it.groupValues[2] in ids }.associate { it.groupValues[1] to it.groupValues[2] }
    }
}
