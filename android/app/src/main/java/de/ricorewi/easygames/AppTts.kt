package de.ricorewi.easygames

import android.content.Context
import android.media.AudioAttributes
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/**
 * Android-Sprachausgabe für die Spiele. Die WebView hat keine eigene Web-Speech-Sprachausgabe (in Chromium für WebView abgeschaltet);
 * die Seiten bekommen deshalb über [NativeHtml] ein `speechSynthesis`, das hierher spricht. Die Engine startet erst bei der ersten Nutzung.
 * [emit] meldet Ereignisse (start/end/error/voices) an die Seite zurück; alle Aufrufe sind thread-sicher.
 */
class AppTts(context: Context, private val emit: (id: String, kind: String) -> Unit) {
    private val app = context.applicationContext
    private val main = Handler(Looper.getMainLooper())
    private var tts: TextToSpeech? = null
    @Volatile private var ready = false
    /** Wartende Ansagen bis die Engine bereit ist: (id, Aktion). */
    private val queue = ArrayList<Pair<String, Runnable>>()

    private fun init() {
        if (tts != null) return
        tts = TextToSpeech(app) { status ->
            main.post {
                val t = tts
                if (status != TextToSpeech.SUCCESS || t == null) {
                    // Engine fehlt/defekt: wartende Ansagen als Fehler melden; beim nächsten Wunsch neuer Versuch
                    ready = false
                    val ids = queue.map { it.first }
                    queue.clear()
                    try { t?.shutdown() } catch (e: Exception) { }
                    tts = null
                    for (id in ids) emit(id, "error")
                    return@post
                }
                ready = true
                t.setAudioAttributes(
                    AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
                )
                t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(id: String?) { emit(id ?: "", "start") }
                    override fun onDone(id: String?) { emit(id ?: "", "end") }
                    @Deprecated("Deprecated in Java")
                    override fun onError(id: String?) { emit(id ?: "", "error") }
                    override fun onError(id: String?, code: Int) { emit(id ?: "", "error") }
                })
                for (r in queue) r.second.run()
                queue.clear()
                emit("", "voices")
            }
        }
    }

    /** Männliche deutsche Stimme (Google „x-deg“, Samsung „SMTm…“), installiert, ohne Internetpflicht bevorzugt; sonst null. */
    private fun maleGerman(t: TextToSpeech): Voice? = try {
        val male = Regex("x-deg|smtm\\d|\\bmale\\b", RegexOption.IGNORE_CASE)
        (t.voices ?: emptySet<Voice>())
            .filter { it.locale?.language == "de" && male.containsMatchIn(it.name) && it.features?.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED) != true }
            .minByOrNull { if (it.isNetworkConnectionRequired) 1 else 0 }
    } catch (e: Exception) {
        null
    }

    /** Installierte Stimmen als JSON (männliche deutsche Stimme zuerst): n = Name, l = Sprache, d = bevorzugte Stimme, o = braucht Internet. */
    fun voicesJson(): String {
        main.post { init() }
        val out = JSONArray()
        val t = tts ?: return out.toString()
        if (!ready) return out.toString()
        try {
            // Männliche deutsche Stimme zuerst (Moderation/Caller), sonst Reihenfolge der Engine
            val pref = maleGerman(t)
            val list = (t.voices ?: emptySet<Voice>()).toMutableList()
            if (pref != null) { list.remove(pref); list.add(0, pref) }
            val def = list.firstOrNull()?.name
            for (v in list) {
                if (v.features?.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED) == true) continue
                out.put(JSONObject().put("n", v.name).put("l", v.locale.toLanguageTag()).put("d", v.name == def).put("o", v.isNetworkConnectionRequired))
            }
        } catch (e: Exception) {
            // keine Stimmen: die Seite spricht dann mit der Standardsprache
        }
        return out.toString()
    }

    fun speak(id: String, text: String, lang: String, voice: String, rate: Float, pitch: Float, volume: Float) {
        if (id.isEmpty() || text.isBlank()) return
        val t0 = text.take(3500)
        main.post {
            init()
            val go = Runnable {
                val t = tts
                if (t == null) {
                    emit(id, "error")
                    return@Runnable
                }
                try {
                    // Ohne gewählte Stimme spricht die Moderation (normale/tiefe Tonlage) mit der Männerstimme; Figurenstimmen (hohe Tonlage, z. B. Oma) behalten die Standardstimme
                    val de = if (lang.isEmpty()) Locale.getDefault().language == "de" else lang.lowercase(Locale.ROOT).startsWith("de")
                    val chosen = if (voice.isEmpty()) (if (pitch <= 1.05f && de) maleGerman(t) else null) else t.voices?.firstOrNull { it.name == voice }
                    if (chosen == null || t.setVoice(chosen) != TextToSpeech.SUCCESS) {
                        val loc = if (lang.isEmpty()) Locale.getDefault() else Locale.forLanguageTag(lang.replace('_', '-'))
                        val r = t.setLanguage(loc)
                        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) t.setLanguage(Locale.getDefault())
                    }
                    t.setSpeechRate(rate.coerceIn(0.1f, 4f))
                    t.setPitch(pitch.coerceIn(0.1f, 2f))
                    val p = Bundle()
                    p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume.coerceIn(0f, 1f))
                    if (t.speak(t0, TextToSpeech.QUEUE_ADD, p, id) != TextToSpeech.SUCCESS) emit(id, "error")
                } catch (e: Exception) {
                    emit(id, "error")
                }
            }
            if (ready) go.run() else if (tts != null) queue.add(id to go) else emit(id, "error")
        }
    }

    fun stop() {
        main.post {
            val ids = queue.map { it.first }
            queue.clear()
            for (id in ids) emit(id, "error")
            if (ready) try { tts?.stop() } catch (e: Exception) { }
        }
    }

    fun shutdown() {
        main.post {
            queue.clear()
            try { tts?.shutdown() } catch (e: Exception) { }
            tts = null
            ready = false
        }
    }
}
