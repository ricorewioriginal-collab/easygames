package de.ricorewi.easygames.core

/** MIME-Typen nach Dateiendung. */
object Mime {
    private val types = mapOf(
        "js" to "text/javascript", "mjs" to "text/javascript",
        "html" to "text/html", "htm" to "text/html",
        "css" to "text/css", "json" to "application/json",
        "wasm" to "application/wasm",
        "png" to "image/png", "jpg" to "image/jpeg", "jpeg" to "image/jpeg",
        "webp" to "image/webp", "svg" to "image/svg+xml", "gif" to "image/gif", "ico" to "image/x-icon",
        "mp3" to "audio/mpeg", "ogg" to "audio/ogg", "wav" to "audio/wav", "m4a" to "audio/mp4",
        "mp4" to "video/mp4", "webm" to "video/webm",
        "glb" to "model/gltf-binary", "gltf" to "model/gltf+json",
        "bin" to "application/octet-stream", "pck" to "application/octet-stream",
        "woff" to "font/woff", "woff2" to "font/woff2", "ttf" to "font/ttf",
        "txt" to "text/plain", "xml" to "application/xml", "map" to "application/json"
    )

    const val FALLBACK = "application/octet-stream"

    fun forPath(path: String): String {
        val name = path.substringAfterLast('/')
        val dot = name.lastIndexOf('.')
        if (dot < 0) return FALLBACK
        return types[name.substring(dot + 1).lowercase()] ?: FALLBACK
    }

    /** Textuelle Typen werden mit Zeichensatz UTF-8 ausgeliefert. */
    fun isText(mime: String): Boolean =
        mime.startsWith("text/") || mime == "application/json" || mime == "application/xml" ||
            mime == "image/svg+xml" || mime == "model/gltf+json"
}
