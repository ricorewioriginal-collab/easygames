using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Threading;
using Microsoft.Web.WebView2.Core;

namespace EasyGames.Windows;

/// <summary>
/// Gemeinsame WebView2-Umgebung (eine für Bibliothek und alle Spielfenster: gleiche Spielstände, ein Browser-Prozess) und die
/// Auslieferung unter https://appassets.local: „/“ ist die Bibliothek (in der EXE), alles andere kommt aus dem Spiele-Ordner.
/// </summary>
public static class Host
{
    public static string Name => Store.AssetHost;
    private static Task<CoreWebView2Environment>? _env;

    /// <summary>
    /// Leistung wie bei einem Windows-Spiel: starke Grafikkarte bevorzugen, GPU nie per Sperrliste abschalten, keine Drosselung
    /// von Bildrate und Timern im Hintergrund/verdeckt (sonst stockt Mehrspieler), Ton ohne vorherigen Klick. Ton im Browser-Prozess statt in einem
    /// eigenen Audio-Prozess, der erst beim ersten Ton startet (sonst setzt der Ton im Spiel erst nach einigen Sekunden ein).
    /// Aufnahme des eigenen Spielfensters ohne Rückfrage (recorder.js: Clip/Aufnahme mit Ton) – fremde Seiten öffnen die Fenster ohnehin nicht.
    /// </summary>
    private const string BrowserArgs = "--force_high_performance_gpu --ignore-gpu-blocklist --enable-gpu-rasterization --enable-zero-copy " +
                                       "--disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows " +
                                       "--autoplay-policy=no-user-gesture-required --disable-features=AudioServiceOutOfProcess --auto-accept-this-tab-capture";

    private static readonly string[] CdnHosts = { "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com" };

    /// <summary>
    /// In Spielfenstern vor allen Skripten: Die Spiele bringen eigene Service Worker (PWA) mit. In der App verwaltet der Store die
    /// Offline-Dateien – ein Service Worker würde ältere Stände ausliefern und Updates verdecken (wie in der easygames-Android-App).
    /// </summary>
    public const string NativeScript = "if('serviceWorker' in navigator){try{navigator.serviceWorker.register=function(){return Promise.reject(new Error('Offline-Inhalte verwaltet die easygames-App.'));};" +
        "navigator.serviceWorker.getRegistrations&&navigator.serviceWorker.getRegistrations().then(function(l){l.forEach(function(r){r.unregister();});});}catch(e){}}";

    public static Task<CoreWebView2Environment> Env => _env ??= CoreWebView2Environment.CreateAsync(null, Path.Combine(App.DataDir, "WebView2"),
        new CoreWebView2EnvironmentOptions(BrowserArgs));

    /// <summary>Grundeinstellungen und Datei-Auslieferung für ein WebView.</summary>
    public static void Attach(CoreWebView2 core, Dispatcher ui, bool launcher)
    {
        core.Settings.AreDevToolsEnabled = false;
        core.Settings.AreDefaultContextMenusEnabled = false;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsZoomControlEnabled = false;
        core.Settings.IsPinchZoomEnabled = false;
        core.Settings.IsSwipeNavigationEnabled = false;
        core.Settings.AreBrowserAcceleratorKeysEnabled = false;   // Strg+R, Strg+F, F5 … gehören dem Spiel
        core.Settings.UserAgent += " RicoReWiApp/1 easygamesWindows/1";   // Kennung für das Cloud-Skript der Spiele (wie die Windows-App)
        core.AddWebResourceRequestedFilter("https://" + Name + "/*", CoreWebView2WebResourceContext.All, CoreWebView2WebResourceRequestSourceKinds.All);
        // Bibliotheken, die Spiele von CDNs laden (three.js, PeerJS, Schriften …): aus vendor/ ausliefern – offline und ohne fremde Server
        foreach (var h in CdnHosts.Union(App.Store.VendorHosts).Distinct())
            core.AddWebResourceRequestedFilter(h + "/*", CoreWebView2WebResourceContext.All, CoreWebView2WebResourceRequestSourceKinds.All);
        core.WebResourceRequested += (_, e) => Serve(core, ui, e, launcher);
    }

    /// <summary>Home-/Guide-Taste des Controllers (Standard-Knopf 16) – oder bei Controllern ohne Home-Taste (bzw. wenn Windows sie für die
    /// Xbox Game Bar abfängt) Start 2 Sekunden halten: zurück in die Bibliothek, auch aus dem Vollbild. Liest die Controller direkt
    /// (auch wenn ein Fenster im Spiel sie gerade für das Spiel sperrt) und meldet die Taste an die App.</summary>
    public static string HomeScript() =>
        "(function(){if(window.top!==window||!navigator.getGamepads)return;var was=false,st=0,tip=null;" +
        "function show(p){if(!tip){tip=document.createElement('div');tip.setAttribute('aria-hidden','true');tip.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;pointer-events:none;" +
        "padding:9px 16px 11px;border-radius:12px;background:rgba(8,10,20,.92);color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5)';" +
        "tip.innerHTML='\u2630 Start halten: zur\u00fcck zur Bibliothek<div style=\"height:4px;margin-top:7px;border-radius:2px;background:rgba(255,255,255,.2)\"><i style=\"display:block;height:100%;width:0;border-radius:2px;background:#ffd400\"></i></div>';}" +
        "if(p<0){if(tip.parentNode)tip.remove();return;}if(!tip.parentNode)(document.body||document.documentElement).appendChild(tip);tip.querySelector('i').style.width=Math.round(p*100)+'%';}" +
        "function home(){if(window.chrome&&chrome.webview)chrome.webview.postMessage({type:'egHome'});}" +
        "setInterval(function(){if(document.hidden){st=0;if(tip)show(-1);return;}var N=window.EasyGamesPadNormal,l;" +
        "try{l=N&&N.physical?N.physical():navigator.getGamepads();}catch(e){return;}var on=false,s=false,o=false;for(var i=0;i<(l?l.length:0);i++){var g=l[i];if(!g||!g.buttons)continue;var b=g.buttons,pr=function(n){return b[n]&&(b[n].pressed||b[n].value>.5);};" +
        "if(pr(16))on=true;if(pr(9))s=true;for(var k=0;k<16;k++)if(k!==9&&pr(k))o=true;}" +
        "if(on&&!was)home();was=on;" +
        "if(st<0){if(!s)st=0;return;}" +   // nach dem Auslösen erst loslassen
        "if(s&&!o){if(!st)st=Date.now();var p=(Date.now()-st)/2000;if(p>.25)show(Math.min(1,p));if(p>=1){st=-1;show(-1);home();}}else{if(st)show(-1);st=0;}},50);})();";

    /// <summary>Ton vorwärmen: stilles Audio öffnet das Ausgabegerät sofort beim Laden, damit der erste Spielton ohne Verzögerung kommt.
    /// Läuft 15 Sekunden, bis das Spiel selbst Ton hat.</summary>
    public static string AudioWarmScript() =>
        "(function(){if(window.top!==window)return;try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var c=new A(),g=c.createGain(),o=c.createOscillator();" +
        "g.gain.value=0;o.connect(g);g.connect(c.destination);o.start();setTimeout(function(){try{o.stop();c.close();}catch(e){}},15000);}catch(e){}})();";

    /// <summary>
    /// Wird in jede Seite (Spiele und Bibliothek) vor deren Skripten eingespielt: die Controller-Belegungen aus den Einstellungen und der
    /// Normalisierungs-Teil von gamepad.js (jeder Controller im Standard-Layout, auch für Spiele mit eigener Controller-Steuerung).
    /// Ältere gamepad.js ohne Nur-Normalisierung wird nicht eingespielt (sonst würden Tasten doppelt ausgelöst).
    /// </summary>
    /// <summary>Aufnahme im Spiel (recorder/recorder.js aus der EXE): F9 = Clip der letzten 30 s, F10 = Aufnahme starten/stoppen.</summary>
    public static string RecorderScript(string title, bool clip)
    {
        using var s = Asm.GetManifestResourceStream("recorder/recorder.js");
        if (s == null) return "";
        using var r = new StreamReader(s);
        var cfg = System.Text.Json.JsonSerializer.Serialize(new { clip, secs = 30, game = title });
        return "if (window === window.top) { window.EG_REC = " + cfg + ";\n" + r.ReadToEnd() + "\n}";
    }

    /// <summary>Zielordner für Aufnahmen: Videos\easygames.</summary>
    public static string ClipDir => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyVideos), "easygames");

    /// <summary>
    /// Nur in Spielfenstern (game: true): gamepad.js läuft im Modus „plain“ – die Knopf-Belegung des Spiels und die Belegung der App wirken,
    /// der künstliche Rahmen bleibt aus (kein Leuchtrahmen, keine Belegungs-Übersicht, keine Fenster-/Menü-Übernahme, keine Knopf-Symbole,
    /// kein Zeiger, kein Fenster mit Select + Start). Info-Seiten (Konto, Anleitung) behalten die Bedienhilfe.
    /// </summary>
    public static string PadScript(bool game = false)
    {
        var js = "window.EASYGAMES_PADMAPS=" + App.Store.PadMapsJson + ";" + (game ? "window.EASYGAMES_PAD='plain';" : "");
        try
        {
            var f = Path.Combine(App.Store.Root, "gamepad.js");
            if (File.Exists(f))
            {
                var text = File.ReadAllText(f);
                if (text.Contains("EASYGAMES_PAD_NORMAL_ONLY", StringComparison.Ordinal)) js += "window.EASYGAMES_PAD_NORMAL_ONLY=1;\n" + text;
            }
        }
        catch { }
        return js;
    }

    public static void OpenExternal(string url)
    {
        try { if (url.StartsWith("https://") || url.StartsWith("http://")) Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); } catch { }
    }

    private static readonly Dictionary<string, string> Mime = new(StringComparer.OrdinalIgnoreCase)
    {
        [".html"] = "text/html; charset=utf-8", [".htm"] = "text/html; charset=utf-8", [".js"] = "text/javascript; charset=utf-8", [".mjs"] = "text/javascript; charset=utf-8",
        [".css"] = "text/css; charset=utf-8", [".json"] = "application/json; charset=utf-8", [".webmanifest"] = "application/manifest+json", [".map"] = "application/json",
        [".txt"] = "text/plain; charset=utf-8", [".csv"] = "text/csv; charset=utf-8", [".xml"] = "application/xml", [".svg"] = "image/svg+xml",
        [".png"] = "image/png", [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg", [".gif"] = "image/gif", [".webp"] = "image/webp", [".avif"] = "image/avif", [".ico"] = "image/x-icon",
        [".mp3"] = "audio/mpeg", [".ogg"] = "audio/ogg", [".oga"] = "audio/ogg", [".opus"] = "audio/ogg", [".wav"] = "audio/wav", [".m4a"] = "audio/mp4", [".aac"] = "audio/aac", [".flac"] = "audio/flac",
        [".mp4"] = "video/mp4", [".webm"] = "video/webm", [".woff"] = "font/woff", [".woff2"] = "font/woff2", [".ttf"] = "font/ttf", [".otf"] = "font/otf",
        [".wasm"] = "application/wasm", [".glb"] = "model/gltf-binary", [".gltf"] = "model/gltf+json", [".bin"] = "application/octet-stream",
    };

    private static readonly Regex RangeRx = new(@"^bytes=(\d*)-(\d*)$", RegexOptions.Compiled);

    /// <summary>Liefert eine Datei aus – im Hintergrund gelesen, mit MIME-Typ und Range (Ton/Video). Eigene Auslieferung statt
    /// SetVirtualHostNameToFolderMapping, weil der virtuelle Ordner Medien sehr langsam lädt (gleiche Lösung wie die Windows-App).</summary>
    private static void Serve(CoreWebView2 core, Dispatcher ui, CoreWebView2WebResourceRequestedEventArgs e, bool launcher)
    {
        if (!Uri.TryCreate(e.Request.Uri, UriKind.Absolute, out var uri)) return;
        string? vendor = null;
        if (!uri.Host.Equals(Name, StringComparison.OrdinalIgnoreCase))
        {
            // CDN-Adresse: nur antworten, wenn die Bibliothek lokal liegt – sonst geht die Anfrage normal ins Netz
            if (e.Request.Method != "GET" && e.Request.Method != "HEAD") return;
            vendor = App.Store.VendorFile(e.Request.Uri);
            if (vendor == null) return;
        }
        string? range = null;
        try { if (e.Request.Headers.Contains("Range")) range = e.Request.Headers.GetHeader("Range"); } catch { }
        var rel = Uri.UnescapeDataString(uri.AbsolutePath).TrimStart('/');
        var deferral = e.GetDeferral();
        Task.Run(() =>
        {
            int status = 404; string reason = "Not Found"; byte[]? data = null;
            var headers = "Cache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\n";
            try
            {
                Stream? src = null;
                string ext;
                if (vendor != null)
                {
                    src = new FileStream(vendor, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
                    ext = Path.GetExtension(vendor);
                }
                else if (launcher && (rel.Length == 0 || rel == "index.html" || rel.StartsWith("_launcher/", StringComparison.Ordinal)))
                {
                    var name = rel.StartsWith("_launcher/", StringComparison.Ordinal) ? rel["_launcher/".Length..] : "index.html";
                    src = Embedded(name);
                    ext = Path.GetExtension(name);
                }
                else
                {
                    if (rel.Length == 0 || rel.EndsWith('/')) rel += "index.html";
                    var root = Path.GetFullPath(App.Store.Root);
                    var file = Path.GetFullPath(Path.Combine(root, rel.Replace('/', Path.DirectorySeparatorChar)));
                    ext = Path.GetExtension(file);
                    if (file.StartsWith(root.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) && File.Exists(file))
                        src = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
                }
                if (src != null)
                {
                    using (src)
                    {
                        long len = src.Length, from = 0, to = len - 1;
                        var type = Mime.TryGetValue(ext, out var m) ? m : "application/octet-stream";
                        var r = range == null ? null : RangeRx.Match(range);
                        if (r != null && r.Success && len > 0 && (r.Groups[1].Length > 0 || r.Groups[2].Length > 0))
                        {
                            if (r.Groups[1].Length > 0) { from = long.Parse(r.Groups[1].Value); if (r.Groups[2].Length > 0) to = Math.Min(len - 1, long.Parse(r.Groups[2].Value)); }
                            else from = Math.Max(0, len - long.Parse(r.Groups[2].Value));
                            if (from > to || from >= len) { status = 416; reason = "Range Not Satisfiable"; headers += $"Content-Range: bytes */{len}\r\n"; }
                            else { status = 206; reason = "Partial Content"; headers += $"Content-Range: bytes {from}-{to}/{len}\r\n"; }
                        }
                        else { status = 200; reason = "OK"; }
                        if (status != 416)
                        {
                            data = new byte[Math.Max(0, to - from + 1)];
                            src.Seek(from, SeekOrigin.Begin);
                            int off = 0; while (off < data.Length) { var n = src.Read(data, off, data.Length - off); if (n <= 0) break; off += n; }
                            headers += $"Content-Type: {type}\r\nContent-Length: {data.Length}\r\nAccept-Ranges: bytes\r\n";
                        }
                    }
                }
            }
            catch { status = 500; reason = "Error"; data = null; }
            ui.BeginInvoke(new Action(() =>
            {
                try { e.Response = core.Environment.CreateWebResourceResponse(data == null ? null : new MemoryStream(data, false), status, reason, headers); }
                catch { }
                finally { deferral.Complete(); }
            }));
        });
    }

    private static readonly Assembly Asm = typeof(Host).Assembly;

    private static Stream? Embedded(string name)
    {
        if (name.Contains("..")) return null;
        var s = Asm.GetManifestResourceStream("launcher/" + name);
        if (s == null) return null;
        var ms = new MemoryStream();   // seekbar für Range
        s.CopyTo(ms);
        s.Dispose();
        ms.Position = 0;
        return ms;
    }
}
