package de.ricorewi.easygames.core

import java.io.IOException
import java.io.OutputStream

/** HTTP-Statusfehler (nicht 200/304). */
class HttpStatusException(val code: Int, val url: String) : IOException("HTTP $code für $url")

/** URL verletzt die Sicherheitsregeln (z. B. http statt https). Nie wiederholen. */
class InsecureUrlException(message: String) : IOException(message)

/** Download wurde abgebrochen (Cancel oder Abbruch wegen Fehler einer anderen Datei). */
class SyncCancelledException : RuntimeException("Abgebrochen")

/** Antwort auf die Manifest-Abfrage. `notModified` = 304 (ETag passt). */
class ManifestResponse(val notModified: Boolean, val text: String?, val etag: String?)

/** Netzabstraktion. Alle Methoden sind blockierend und werfen IOException. */
interface Fetcher {
    /** Holt das Manifest; mit `etag` wird If-None-Match gesendet. */
    @Throws(IOException::class)
    fun getManifest(url: String, etag: String?): ManifestResponse

    /**
     * Lädt `url` in `out` (bereits entpackt) und meldet jeden geschriebenen Block über `onBytes`.
     * Wirft `onBytes` eine Exception, bricht der Download ab und die Verbindung wird geschlossen.
     */
    @Throws(IOException::class)
    fun download(url: String, out: OutputStream, onBytes: (Int) -> Unit)
}
