using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace EasyGames.Windows;

/// <summary>
/// TikTok LIVE in der App: startet die Brücke im Hintergrund – wahlweise tools/tiktok-bridge.mjs (TikTok-Live-Connector, Node.js)
/// oder tools/tiktok-bridge.py (TikTokLive, Python; gleiches Protokoll, gleiche Belegung) –
/// und spielt die Steuerung (easygames stream-tiktok.js, Eingebettet-Modus) in jedes Spielfenster ein. Kommentare, Geschenke und
/// Likes steuern dann das Spiel über den virtuellen Controller (gamepad.js) – ohne Umweg über die easygames-Seite.
/// Dateien liegen unter %LocalAppData%\easygames\tiktok: beim ersten Start aus der EXE (mitgeliefert, tiktok/ – kommt per
/// scripts/sync-easygames.php aus easygames), danach beim TikTok-Start von der easygames-Seite aktualisiert (offline bleibt die letzte Fassung). Die Belegung speichert die Brücke dort in tiktok-config.json.
/// </summary>
public sealed class TikTok
{
    public const int Port = 21213;
    private const string Home = "https://ricorewioriginal-collab.github.io/easygames/";
    public string Dir { get; } = Path.Combine(App.DataDir, "tiktok");
    private string SettingsFile => Path.Combine(Dir, "settings.json");
    private readonly object _gate = new();
    private readonly LinkedList<string> _log = new();
    private Process? _proc;
    private bool _busy;

    public string Name { get; private set; } = "";
    public bool InGames { get; private set; } = true;
    /// <summary>"node" (TikTok-Live-Connector) oder "python" (TikTokLive).</summary>
    public string Engine { get; private set; } = "node";
    public string Status { get; private set; } = "Aus";
    public bool Running { get { lock (_gate) return _proc is { HasExited: false }; } }
    public bool Busy => _busy;
    public string[] Log { get { lock (_gate) return _log.ToArray(); } }
    public event Action? Changed;

    public TikTok()
    {
        Directory.CreateDirectory(Dir);
        Seed();
        try
        {
            using var d = JsonDocument.Parse(File.ReadAllText(SettingsFile));
            if (d.RootElement.TryGetProperty("name", out var n)) Name = n.GetString() ?? "";
            if (d.RootElement.TryGetProperty("inGames", out var g)) InGames = g.GetBoolean();
            if (d.RootElement.TryGetProperty("engine", out var en) && en.GetString() == "python") Engine = "python";
        }
        catch { }
    }

    /// <summary>Mitgelieferte Fassung aus der EXE auspacken, wenn noch keine da ist (erster Start, auch ohne Internet).</summary>
    private void Seed()
    {
        foreach (var name in new[] { "stream-tiktok.js", "tiktok-bridge.mjs", "tiktok-bridge.py" })
        {
            try
            {
                var f = Path.Combine(Dir, name);
                if (File.Exists(f)) continue;
                using var s = typeof(TikTok).Assembly.GetManifestResourceStream("tiktok/" + name);
                if (s == null) continue;
                using var o = File.Create(f + ".tmp"); s.CopyTo(o); o.Close(); File.Move(f + ".tmp", f, true);
            }
            catch (Exception ex) { App.Log(ex); }
        }
    }

    private void Save() { try { File.WriteAllText(SettingsFile, JsonSerializer.Serialize(new { name = Name, inGames = InGames, engine = Engine })); } catch { } }
    private void Note(string line)
    {
        lock (_gate) { _log.AddLast(line); while (_log.Count > 40) _log.RemoveFirst(); }
        if (line.Contains("Verbunden") || line.Contains("live") || line.Contains("LIVE") || line.Contains("Brücke bereit")) Status = line.Length > 120 ? line[..120] : line;
        Changed?.Invoke();
    }

    public void SetInGames(bool on) { InGames = on; Save(); Changed?.Invoke(); }
    public void SetEngine(string e) { if (Running || _busy) return; Engine = e == "python" ? "python" : "node"; Save(); Changed?.Invoke(); }

    /// <summary>python.exe (ohne den Microsoft-Store-Platzhalter in WindowsApps) oder der Starter py.exe.</summary>
    public static string? FindPython()
    {
        var local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var dirs = (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator).ToList();
        try { dirs.AddRange(Directory.GetDirectories(Path.Combine(local, "Programs", "Python")).OrderByDescending(d => d)); } catch { }
        foreach (var exe in new[] { "python.exe", "py.exe" })
            foreach (var dir in dirs)
            {
                try
                {
                    var d = dir.Trim('"');
                    if (d.Contains("WindowsApps", StringComparison.OrdinalIgnoreCase)) continue;
                    var f = Path.Combine(d, exe); if (File.Exists(f)) return f;
                }
                catch { }
            }
        return null;
    }

    /// <summary>Python über winget installieren (sichtbares Fenster, der Nutzer bestätigt dort).</summary>
    public void InstallPython()
    {
        try { Process.Start(new ProcessStartInfo("winget", "install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements") { UseShellExecute = true }); }
        catch (Exception ex) { Note("winget nicht gefunden – Python bitte von https://www.python.org installieren. (" + ex.Message + ")"); }
    }

    public static string? FindNode()
    {
        foreach (var dir in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator)
                     .Append(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs")))
        {
            try { var f = Path.Combine(dir.Trim('"'), "node.exe"); if (File.Exists(f)) return f; } catch { }
        }
        return null;
    }

    /// <summary>Node.js über winget installieren (sichtbares Fenster, der Nutzer bestätigt dort).</summary>
    public void InstallNode()
    {
        try { Process.Start(new ProcessStartInfo("winget", "install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements") { UseShellExecute = true }); }
        catch (Exception ex) { Note("winget nicht gefunden – Node.js bitte von https://nodejs.org installieren. (" + ex.Message + ")"); }
    }

    /// <summary>Brücke und Steuer-Skript von easygames holen (offline: vorhandene Fassung behalten).</summary>
    public async Task UpdateFilesAsync()
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd("easygamesWindows/1.0");
        foreach (var (url, file) in new[] { ("tools/tiktok-bridge.mjs", "tiktok-bridge.mjs"), ("tools/tiktok-bridge.py", "tiktok-bridge.py"), ("stream-tiktok.js", "stream-tiktok.js") })
        {
            try
            {
                var text = await http.GetStringAsync(Home + url + "?t=" + DateTime.UtcNow.Ticks / TimeSpan.TicksPerHour);
                if (text.Length > 200) { var f = Path.Combine(Dir, file); await File.WriteAllTextAsync(f + ".tmp", text); File.Move(f + ".tmp", f, true); }
            }
            catch (Exception ex) { if (!File.Exists(Path.Combine(Dir, file))) Note("Download fehlgeschlagen: " + url + " (" + ex.Message + ")"); }
        }
    }

    public async Task StartAsync(string name)
    {
        name = name.Trim().TrimStart('@');
        if (name.Length == 0) { Note("Bitte deinen TikTok-Namen eingeben."); return; }
        if (_busy || Running) return;
        _busy = true; Name = name; Save(); Changed?.Invoke();
        try
        {
            var py = Engine == "python";
            var exe = py ? FindPython() : FindNode();
            if (exe == null)
            {
                Status = py ? "Python fehlt" : "Node.js fehlt";
                Note(py ? "Python fehlt – „Python installieren“ drücken, danach erneut starten." : "Node.js fehlt – „Node.js installieren“ drücken, danach erneut starten."); return;
            }
            Status = "Wird vorbereitet …"; Note("Aktualisiere die Brücke …");
            await UpdateFilesAsync();
            var script = py ? "tiktok-bridge.py" : "tiktok-bridge.mjs";
            if (!File.Exists(Path.Combine(Dir, script))) { Status = "Brücke fehlt"; return; }
            if (py)
            {
                if (await RunAsync(exe, "-c \"import TikTokLive\"", quiet: true) != 0)
                {
                    Note("Installiere TikTokLive (einmalig) …");
                    if (await RunAsync(exe, "-m pip install --user --disable-pip-version-check TikTokLive") != 0) { Status = "Installation fehlgeschlagen"; return; }
                }
            }
            else if (!Directory.Exists(Path.Combine(Dir, "node_modules", "tiktok-live-connector")))
            {
                Note("Installiere tiktok-live-connector (einmalig) …");
                var npm = Path.Combine(Path.GetDirectoryName(exe)!, "npm.cmd");
                var code = await RunAsync(File.Exists(npm) ? npm : "npm", "i tiktok-live-connector --no-audit --no-fund");
                if (code != 0) { Status = "Installation fehlgeschlagen"; return; }
            }
            var psi = new ProcessStartInfo(exe, (py ? "-u " : "") + $"{script} \"{name}\" --port {Port}")
            {
                WorkingDirectory = Dir, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true,
                StandardOutputEncoding = Encoding.UTF8, StandardErrorEncoding = Encoding.UTF8,
            };
            if (py) psi.Environment["PYTHONIOENCODING"] = "utf-8";
            var p = new Process { StartInfo = psi, EnableRaisingEvents = true };
            p.OutputDataReceived += (_, e) => { if (e.Data != null) Note(e.Data); };
            p.ErrorDataReceived += (_, e) => { if (e.Data != null) Note(e.Data); };
            p.Exited += (_, _) => { Status = "Aus"; Note("Brücke beendet."); };
            p.Start(); p.BeginOutputReadLine(); p.BeginErrorReadLine();
            lock (_gate) _proc = p;
            Status = "Wartet auf deinen LIVE …";
        }
        catch (Exception ex) { App.Log(ex); Status = "Fehler"; Note(ex.Message); }
        finally { _busy = false; Changed?.Invoke(); }
    }

    private async Task<int> RunAsync(string exe, string args, bool quiet = false)
    {
        var psi = new ProcessStartInfo(exe, args) { WorkingDirectory = Dir, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
        using var p = new Process { StartInfo = psi };
        p.OutputDataReceived += (_, e) => { if (!quiet && !string.IsNullOrWhiteSpace(e.Data)) Note(e.Data); };
        p.ErrorDataReceived += (_, e) => { if (!quiet && !string.IsNullOrWhiteSpace(e.Data)) Note(e.Data); };
        p.Start(); p.BeginOutputReadLine(); p.BeginErrorReadLine();
        await p.WaitForExitAsync();
        return p.ExitCode;
    }

    public void Stop()
    {
        Process? p; lock (_gate) { p = _proc; _proc = null; }
        try { if (p is { HasExited: false }) p.Kill(true); } catch { }
        Status = "Aus"; Changed?.Invoke();
    }

    /// <summary>Easygames-ID eines Spiels (letzter Teil der öffentlichen Adresse), damit die Belegung je Spiel überall gleich heißt.</summary>
    public static string GameKey(GameMeta g)
    {
        var u = (g.Url ?? "").TrimEnd('/');
        var i = u.LastIndexOf('/');
        return i >= 0 && i < u.Length - 1 ? u[(i + 1)..] : g.Id;
    }

    /// <summary>Skript für das Spielfenster (nur oberste Seite, nicht in eingebetteten Frames); leer, wenn aus oder nicht geladen.</summary>
    public string EmbedScript(GameMeta g, bool setup)
    {
        if (!setup && (!InGames || !Running)) return "";   // nur während die Brücke läuft (sonst keine Einblendungen im Spiel)
        var f = Path.Combine(Dir, "stream-tiktok.js");
        string text;
        try { text = File.ReadAllText(f); } catch { return ""; }
        var cfg = JsonSerializer.Serialize(new { ws = "ws://127.0.0.1:" + Port, id = GameKey(g), title = g.Title, setup });
        return "if (window === window.top) { window.EG_TIKTOK_EMBED = " + cfg + ";\n" + text + "\n}";
    }
}
