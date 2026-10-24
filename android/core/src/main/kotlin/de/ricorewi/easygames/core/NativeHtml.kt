package de.ricorewi.easygames.core

/** Native Sync owns offline files; PWA workers must not serve older files over it. */
object NativeHtml {
    private val guard = """
        <script>
        window.EASYGAMES_NATIVE = true;
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register = function () {
            return Promise.reject(new Error('Offline-Inhalte werden von der easygames-App verwaltet.'));
          };
        }
        // Android-WebView hat keine Notification-API: Erinnerungen der Spiele laufen über die App-Brücke.
        if (window.EasyGamesApp && EasyGamesApp.notifyState) {
          var waiting = [];
          window.__egNotifyDone = function (state) {
            var list = waiting; waiting = [];
            list.forEach(function (done) { done(state); });
          };
          var AppNotification = function (title, options) {
            options = options || {};
            this.title = String(title); this.body = String(options.body || ''); this.tag = String(options.tag || '');
            EasyGamesApp.notify(this.title, this.body, this.tag);
          };
          AppNotification.prototype.close = function () {};
          AppNotification.requestPermission = function (callback) {
            return new Promise(function (resolve) {
              waiting.push(function (state) { resolve(state); if (typeof callback === 'function') callback(state); });
              EasyGamesApp.notifyRequest();
            });
          };
          Object.defineProperty(AppNotification, 'permission', { get: function () { return EasyGamesApp.notifyState(); } });
          window.Notification = AppNotification;
        }
        // Android-WebView hat keine eigene Sprachausgabe: speechSynthesis spricht über die App (Android-Stimme).
        // Ereignisse kommen über __egTts zurück und werden an eingebettete Spiele (gleiche Herkunft) weitergereicht.
        if (window.EasyGamesApp && EasyGamesApp.ttsSpeak && !window.__egTtsOn) {
          window.__egTtsOn = 1;
          var tok = 'f' + Math.random().toString(36).slice(2, 8), q = {}, n = 0, voices = [], L = {};
          var Utt = function (t) { this.text = t == null ? '' : String(t); this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1; this._l = {}; };
          Utt.prototype.addEventListener = function (k, f) { (this._l[k] = this._l[k] || []).push(f); };
          Utt.prototype.removeEventListener = function (k, f) { var a = this._l[k] || [], i = a.indexOf(f); if (i >= 0) a.splice(i, 1); };
          var fire = function (u, k, err) {
            var e = { type: k, utterance: u, charIndex: 0, charLength: 0, elapsedTime: 0, name: '', error: err || '' };
            try { if (typeof u['on' + k] === 'function') u['on' + k](e); } catch (x) {}
            (u._l[k] || []).slice().forEach(function (f) { try { f.call(u, e); } catch (x) {} });
          };
          var load = function () {
            try {
              var a = JSON.parse(EasyGamesApp.ttsVoices() || '[]'), changed = a.length !== voices.length;
              voices = a.map(function (v) { return { name: v.n, lang: v.l, voiceURI: v.n, localService: !v.o, 'default': !!v.d }; });
              return changed;
            } catch (x) { return false; }
          };
          var synth = {
            onvoiceschanged: null, paused: false,
            get speaking() { return Object.keys(q).length > 0; }, get pending() { return Object.keys(q).length > 1; },
            speak: function (u) {
              if (!u || !String(u.text || '').trim()) { if (u) setTimeout(function () { fire(u, 'end'); }, 0); return; }
              var id = tok + '_' + (++n); q[id] = u;
              try { EasyGamesApp.ttsSpeak(id, String(u.text), u.lang || '', (u.voice && u.voice.name) || '', +u.rate || 1, +u.pitch || 1, u.volume == null ? 1 : +u.volume); }
              catch (x) { delete q[id]; fire(u, 'error', 'synthesis-failed'); }
            },
            cancel: function () {
              var list = Object.keys(q).map(function (i) { return q[i]; }); q = {};
              try { EasyGamesApp.ttsStop(); } catch (x) {}
              list.forEach(function (u) { fire(u, 'error', 'canceled'); });
            },
            pause: function () {}, resume: function () {},
            getVoices: function () { load(); return voices.slice(); },
            addEventListener: function (k, f) { (L[k] = L[k] || []).push(f); },
            removeEventListener: function (k, f) { var a = L[k] || [], i = a.indexOf(f); if (i >= 0) a.splice(i, 1); }
          };
          window.__egTts = function (id, k) {
            if (k === 'voices') {
              if (load()) { var e = { type: 'voiceschanged' }; try { if (typeof synth.onvoiceschanged === 'function') synth.onvoiceschanged(e); } catch (x) {} (L.voiceschanged || []).slice().forEach(function (f) { try { f.call(synth, e); } catch (x) {} }); }
            } else if (q[id]) {
              var u = q[id];
              if (k === 'start') fire(u, 'start'); else { delete q[id]; fire(u, k === 'end' ? 'end' : 'error', k === 'end' ? '' : 'synthesis-failed'); }
              return;
            }
            for (var i = 0; i < window.frames.length; i++) { try { if (window.frames[i].__egTts) window.frames[i].__egTts(id, k); } catch (x) {} }
          };
          try {
            Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true, writable: true });
            Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utt, configurable: true, writable: true });
          } catch (x) {}
        }
        // Worklet module requests can bypass the WebView's local HTTP interceptor.
        // Godot's standalone audio worklet has no relative imports: fetch it via
        // the native store first, then load its verified bytes from a blob URL.
        if (window.AudioWorklet && AudioWorklet.prototype.addModule) {
          var addModule = AudioWorklet.prototype.addModule;
          AudioWorklet.prototype.addModule = function (url, options) {
            var worklet = this, resolved = new URL(url, location.href);
            if (resolved.origin !== location.origin || !resolved.pathname.endsWith('.audio.worklet.js')) {
              return addModule.call(worklet, url, options);
            }
            return fetch(resolved.href).then(function (r) {
              if (!r.ok) throw new Error('Audio-Modul fehlt: ' + resolved.pathname);
              return r.text();
            }).then(function (text) {
              var blob = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
              return addModule.call(worklet, blob, options).finally(function () { URL.revokeObjectURL(blob); });
            });
          };
        }
        </script>
    """.trimIndent()

    fun prepare(html: String): String {
        val head = Regex("<head(?:\\s[^>]*)?>", RegexOption.IGNORE_CASE).find(html)
        if (head != null) return html.substring(0, head.range.last + 1) + guard + html.substring(head.range.last + 1)
        return guard + html
    }

    /** Removes only this reserved app origin's web caches; localStorage/IndexedDB saves remain. */
    fun bootstrap(startUrl: String): String = """
        <!doctype html><html><head><meta charset="utf-8"></head><body style="background:#101827;color:white">
        <p>Spiele werden vorbereitet …</p><script>
        (async function () {
          if ('serviceWorker' in navigator) {
            try { var regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map(function (r) { return r.unregister(); })); } catch (e) {}
          }
          if ('caches' in window) {
            try { var keys = await caches.keys();
              await Promise.all(keys.map(function (k) { return caches.delete(k); })); } catch (e) {}
          }
          location.replace('$startUrl');
        })();
        </script></body></html>
    """.trimIndent()
}
