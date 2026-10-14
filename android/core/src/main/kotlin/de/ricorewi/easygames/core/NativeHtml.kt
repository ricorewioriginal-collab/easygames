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
