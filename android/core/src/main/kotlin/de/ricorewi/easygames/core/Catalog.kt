package de.ricorewi.easygames.core

import org.json.JSONArray
import org.json.JSONObject

/** Ein Spiel aus `sync/catalog.json` (erzeugt von tools/build-sync.js aus games.js und guides.js). */
data class Game(
    val id: String,
    val title: String,
    val desc: String,
    val icon: String,
    /** Kartenbild (Pfad im Inhalt, z. B. `ricopoly/card.jpg`). */
    val img: String,
    /** CSS-Verlauf der Karte (Ersatz, solange kein Bild da ist). */
    val bg: String,
    /** Ordner des Spiels (ohne Schrägstrich), z. B. `ricopoly`. */
    val folder: String,
    val online: Boolean,
    val multi: Boolean,
    val pad: Boolean,
    val tv: Boolean,
    val cloudGame: String?,
    val anleitung: String,
    val steuerung: List<String>,
    val tipps: List<String>,
    /** Trailer (Pfad auf der easygames-Homepage, z. B. `promo/taschi-trailer-16x9.mp4`), automatisch aus promo/ – oder null. */
    val trailer: String? = null,
) {
    /** Startseite des Spiels im Inhalt. */
    val entry: String get() = "$folder/"
}

class Catalog private constructor(val games: List<Game>, val links: Map<String, String>) {
    private val byId = games.associateBy { it.id }
    private val byFolder = games.associateBy { it.folder }

    fun find(id: String): Game? = byId[id]
    fun byFolder(folder: String): Game? = byFolder[folder]
    val folders: Set<String> get() = byFolder.keys

    companion object {
        fun parse(text: String): Catalog {
            val o = JSONObject(text)
            val arr = o.optJSONArray("games") ?: throw ManifestException("Katalog: 'games' fehlt")
            val list = ArrayList<Game>(arr.length())
            for (i in 0 until arr.length()) {
                val g = arr.optJSONObject(i) ?: continue
                val id = g.optString("id")
                val path = g.optString("path").trim('/')
                if (id.isEmpty() || path.isEmpty() || path.contains('/') || !Manifest.isSafePath(path)) continue
                val modes = g.optJSONObject("modes") ?: JSONObject()
                val guide = g.optJSONObject("guide") ?: JSONObject()
                list += Game(
                    id = id,
                    title = g.optString("title", id),
                    desc = g.optString("desc"),
                    icon = g.optString("icon"),
                    img = g.optString("img"),
                    bg = g.optString("bg"),
                    folder = path,
                    online = modes.optBoolean("online"),
                    multi = modes.optBoolean("multi") || g.optBoolean("multiplayer"),
                    pad = modes.optBoolean("pad"),
                    tv = modes.optBoolean("tvParam"),
                    cloudGame = g.optJSONObject("cloud")?.optString("game")?.takeIf { it.isNotEmpty() },
                    anleitung = guide.optString("anleitung"),
                    steuerung = strings(guide.optJSONArray("steuerung")),
                    tipps = strings(guide.optJSONArray("tipps")),
                    trailer = g.optJSONObject("trailer")?.optString("v16")?.takeIf { it.startsWith("promo/") && Manifest.isSafePath(it) },
                )
            }
            val links = LinkedHashMap<String, String>()
            o.optJSONObject("links")?.let { l -> l.keys().forEach { k -> links[k] = l.optString(k) } }
            return Catalog(list, links)
        }

        private fun strings(a: JSONArray?): List<String> =
            if (a == null) emptyList() else (0 until a.length()).mapNotNull { a.optString(it).takeIf { s -> s.isNotBlank() } }
    }
}
