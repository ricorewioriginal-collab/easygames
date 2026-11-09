package de.ricorewi.easygames

import de.ricorewi.easygames.core.Game
import de.ricorewi.easygames.core.Library
import org.json.JSONArray
import org.json.JSONObject

/** Ein Abschnitt der Spielanleitung (Format guides/README.md). */
data class GuideSection(val title: String, val paragraphs: List<String>, val list: List<String>, val steps: List<String>)

/** Anleitung eines Spiels: Kurzfassung (Katalog) plus Handbuch, Ratgeber, Lösungsbuch und FAQ aus `guides/<id>.json`. */
data class Guide(val tabs: List<Pair<String, List<GuideSection>>>)

object Guides {
    fun load(library: Library, g: Game): Guide =
        parse(g, try { library.open("guides/${g.id}.json")?.readText() } catch (e: Exception) { null })

    fun parse(g: Game, json: String?): Guide {
        val tabs = ArrayList<Pair<String, List<GuideSection>>>()
        val kurz = ArrayList<GuideSection>()
        if (g.anleitung.isNotBlank()) kurz += GuideSection("So geht's", listOf(g.anleitung), emptyList(), emptyList())
        if (g.steuerung.isNotEmpty()) kurz += GuideSection("Steuerung", emptyList(), g.steuerung, emptyList())
        if (g.tipps.isNotEmpty()) kurz += GuideSection("Tipps", emptyList(), g.tipps, emptyList())
        if (kurz.isNotEmpty()) tabs += "Kurz" to kurz
        val o = try { json?.let { JSONObject(it) } } catch (e: Exception) { null }
        if (o != null) {
            listOf("handbuch" to "Handbuch", "ratgeber" to "Ratgeber", "loesung" to "Lösungsbuch").forEach { (k, label) ->
                val s = sections(o.optJSONArray(k))
                if (s.isNotEmpty()) tabs += label to s
            }
            val faq = o.optJSONArray("faq")
            if (faq != null && faq.length() > 0) {
                tabs += "FAQ" to (0 until faq.length()).mapNotNull { i ->
                    val q = faq.optJSONObject(i) ?: return@mapNotNull null
                    GuideSection(q.optString("q"), listOf(q.optString("a")), emptyList(), emptyList())
                }
            }
        }
        return Guide(tabs)
    }

    private fun sections(a: JSONArray?): List<GuideSection> {
        if (a == null) return emptyList()
        return (0 until a.length()).mapNotNull { i ->
            val s = a.optJSONObject(i) ?: return@mapNotNull null
            GuideSection(s.optString("t"), strings(s.optJSONArray("p")), strings(s.optJSONArray("list")), strings(s.optJSONArray("steps")))
        }
    }

    private fun strings(a: JSONArray?): List<String> =
        if (a == null) emptyList() else (0 until a.length()).mapNotNull { a.optString(it).takeIf { s -> s.isNotBlank() } }
}
