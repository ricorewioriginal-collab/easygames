using System.IO;
using System.Collections.Concurrent;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace EasyGames.Windows;

/// <summary>Ein Spiel aus dem easygames-Katalog (sync/catalog.json auf GitHub, dieselbe Quelle wie die easygames-Android-App).</summary>
public sealed record GameMeta(string Id, string Folder, string Title, string Short, string Desc, string Meta, string Cover,
                              string Genre, string Url, string Kind, string Entry, string[] Modes);

/// <summary>Zustand eines Spiels für die Bibliothek.</summary>
public sealed record GameStatus(string Id, bool Installed, bool Update, bool New, long Size, long PlaySeconds, string? LastPlayed, string[] Needs);

/// <summary>
/// Spiele-Bibliothek wie ein kleiner Steam-Client: Jedes Spiel wird einzeln geladen, geprüft (SHA-256) und aktualisiert.
/// Quelle ist der Sync-Stand von easygames auf GitHub (sync/manifest.json + sync/catalog.json, wie die easygames-Android-App) –
/// kein eigener Server nötig. Neue Spiele erscheinen damit automatisch, geänderte Dateien werden als Update erkannt.
/// Gemeinsame Dateien (cloud/fire-peer.js, vendor/, Vorschaubilder, Konto-Seiten …) bilden die „Basis“, die immer aktuell
/// gehalten wird; große Bibliotheken (vendor/<name> ab 2 MB, z. B. MediaPipe) bekommen nur Spiele, die sie nutzen.
/// CDN-Adressen der Spiele liefert die App aus vendor/ (Zuordnung „vendor“ im Manifest). Ohne Netz bleibt der letzte Stand spielbar.
/// </summary>
public sealed class Store
{
    /// <summary>Spielestand auf GitHub (Zweig main), gleiche Quelle wie die easygames-Android-App.</summary>
    public const string Source = "https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/";
    /// <summary>Öffentliche easygames-Adresse (Links, Kategorien).</summary>
    public const string Public = "https://ricorewioriginal-collab.github.io/easygames/";
    /// <summary>Lokale Adresse der Spiele (wie in der Windows-App von RicoReWi Radio).</summary>
    public const string AssetHost = "appassets.local";
    private const long BigVendorBytes = 2L * 1024 * 1024;
    private const int Parallel = 4;
    private static readonly TimeSpan NewFor = TimeSpan.FromDays(14);
    private static readonly Regex DepRx = new(@"\.\./([A-Za-z0-9_-]+)/([A-Za-z0-9_.-]*)", RegexOptions.Compiled);
    private static readonly JsonSerializerOptions Json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = false };

    private readonly HttpClient _http;
    private readonly string _data;
    private readonly SemaphoreSlim _op = new(1, 1);
    private readonly object _gate = new();
    private StateData _state;
    private Feed? _feed;
    private CancellationTokenSource? _cancel;

    /// <summary>Ordner mit Basis und installierten Spielen (wird unter https://appassets.local ausgeliefert).</summary>
    public string Root { get; }
    public bool Online { get; private set; }
    public bool Refreshing { get; private set; }
    public string? BusyId { get; private set; }
    public (long Done, long Total) BusyProgress { get; private set; }
    public string? LastError { get; private set; }
    /// <summary>Spiele, die gerade laufen (werden nicht aktualisiert oder gelöscht).</summary>
    public Func<string, bool> IsRunning { get; set; } = _ => false;
    public event Action? Changed;

    private readonly ConcurrentQueue<string> _queue = new();
    public IReadOnlyCollection<string> Queued => _queue.ToArray();

    public Store(string dataDir, HttpMessageHandler? handler = null)
    {
        _data = dataDir;
        Root = Path.Combine(dataDir, "library");
        Directory.CreateDirectory(Root);
        _http = handler == null ? new HttpClient() : new HttpClient(handler);
        _http.Timeout = TimeSpan.FromMinutes(5);
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("easygamesWindows/1.0");
        _http.DefaultRequestHeaders.CacheControl = new System.Net.Http.Headers.CacheControlHeaderValue { NoCache = true };
        _state = LoadState();
        _feed = LoadFeedCache();
    }

    public IReadOnlyList<GameMeta> Games => _feed?.Games ?? new List<GameMeta>();
    public bool AutoUpdate { get => _state.AutoUpdate; set { _state.AutoUpdate = value; SaveState(); } }
    public bool Fullscreen { get => _state.Fullscreen; set { _state.Fullscreen = value; SaveState(); } }
    public bool Clips { get => _state.Clips; set { _state.Clips = value; SaveState(); } }

    /// <summary>Controller-Belegungen als JSON-Objekt (für die Spielfenster und die Bibliothek).</summary>
    public string PadMapsJson { get { lock (_gate) return JsonSerializer.Serialize(_state.PadMaps); } }
    public Dictionary<string, JsonElement> PadMaps { get { lock (_gate) return new Dictionary<string, JsonElement>(_state.PadMaps); } }

    /// <summary>Übernimmt die Belegungen aus den Einstellungen (nur ein JSON-Objekt aus Objekten, höchstens 32 Pads, klein).</summary>
    public void SetPadMaps(JsonElement maps)
    {
        if (maps.ValueKind != JsonValueKind.Object || maps.GetRawText().Length > 64 * 1024) throw new InvalidDataException("Ungültige Controller-Belegung.");
        var next = new Dictionary<string, JsonElement>();
        foreach (var p in maps.EnumerateObject())
            if (p.Value.ValueKind == JsonValueKind.Object && p.Name.Length is > 0 and <= 300 && next.Count < 32) next[p.Name] = p.Value.Clone();
        lock (_gate) _state.PadMaps = next;
        SaveState();
    }
    public bool BaseReady { get { lock (_gate) return _feed != null && BaseFiles(_feed).All(p => _state.Files.TryGetValue(p.Key, out var f) && f.H == p.Value.H); } }

    // ---------- Status ----------

    public GameStatus Status(GameMeta g)
    {
        lock (_gate)
        {
            var installed = g.Kind == "bundled" && _state.Installed.Contains(g.Folder);
            var update = installed && _feed != null && FolderOutdated(_feed, g.Folder);
            var size = _feed == null ? 0 : _feed.Files.Where(f => InFolder(f.Key, g.Folder)).Sum(f => f.Value.S);
            _state.Play.TryGetValue(g.Id, out var play);
            var isNew = _state.FirstSeen.TryGetValue(g.Id, out var seen) && seen > DateTime.MinValue && DateTime.UtcNow - seen < NewFor;
            _state.Deps.TryGetValue(g.Folder, out var needs);
            return new GameStatus(g.Id, installed, update, isNew, size, play?.Seconds ?? 0, play?.Last, needs?.ToArray() ?? Array.Empty<string>());
        }
    }

    public GameMeta? Find(string id) => Games.FirstOrDefault(g => g.Id == id);

    public string Url(GameMeta g) => g.Kind == "bundled" ? "https://" + AssetHost + "/" + g.Entry : g.Url;

    private static bool InFolder(string path, string folder) => path.StartsWith(folder + "/", StringComparison.Ordinal);

    private bool FolderOutdated(Feed feed, string folder)
    {
        foreach (var (p, f) in feed.Files)
            if (InFolder(p, folder) && (!_state.Files.TryGetValue(p, out var l) || l.H != f.H)) return true;
        foreach (var p in _state.Files.Keys)
            if (InFolder(p, folder) && !feed.Files.ContainsKey(p)) return true;
        return false;
    }

    private static HashSet<string> GameFolders(Feed feed) => feed.Games.Where(g => g.Kind == "bundled").Select(g => g.Folder).ToHashSet(StringComparer.Ordinal);

    /// <summary>Einzeln ladbare Einheiten: Spielordner und große Bibliotheken (vendor/&lt;name&gt;).</summary>
    private static HashSet<string> Units(Feed feed) { var u = GameFolders(feed); u.UnionWith(feed.BigVendor); return u; }

    private static IEnumerable<KeyValuePair<string, FileRec>> BaseFiles(Feed feed)
    {
        var folders = GameFolders(feed);
        var covers = feed.Games.Select(g => g.Cover).ToHashSet(StringComparer.Ordinal);   // Kartenbilder gehören zur Basis (Bibliothek)
        return feed.Files.Where(f =>
        {
            if (covers.Contains(f.Key)) return true;
            var i = f.Key.IndexOf('/');
            return (i < 0 || !folders.Contains(f.Key[..i])) && !feed.BigVendor.Any(v => InFolder(f.Key, v));
        });
    }

    /// <summary>Lokale Datei für eine CDN-Adresse (Bibliothek aus vendor/), wenn sie geladen ist; sonst null.</summary>
    public string? VendorFile(string url)
    {
        var feed = _feed;
        if (feed == null) return null;
        if (!feed.Vendor.TryGetValue(url, out var p))
        {
            var cut = url.IndexOfAny(new[] { '?', '#' });
            if (cut < 0 || !feed.Vendor.TryGetValue(url[..cut], out p)) return null;
        }
        lock (_gate) if (!_state.Files.ContainsKey(p)) return null;
        var f = Local(p);
        return File.Exists(f) ? f : null;
    }

    /// <summary>Hosts der CDN-Adressen (für die Umleitung in den Spielfenstern).</summary>
    public IEnumerable<string> VendorHosts => (_feed?.Vendor.Keys ?? Enumerable.Empty<string>())
        .Select(u => Uri.TryCreate(u, UriKind.Absolute, out var x) ? x.Scheme + "://" + x.Host : null).Where(h => h != null).Distinct()!;

    // ---------- Server-Stand holen ----------

    /// <summary>Lädt Dateiliste und Spieleliste vom Server, hält die Basis aktuell, erkennt neue Spiele und (falls an) aktualisiert installierte Spiele.</summary>
    public async Task RefreshAsync(CancellationToken ct = default)
    {
        Refreshing = true; Fire();
        try
        {
            var feed = await FetchFeedAsync(ct);
            Online = feed != null;
            if (feed != null)
            {
                List<string> moved, gone;
                lock (_gate)
                {
                    (moved, gone) = Reconcile(_feed, feed);
                    _feed = feed;
                    var first = _state.FirstSeen.Count == 0;
                    foreach (var g in feed.Games)
                        if (!_state.FirstSeen.ContainsKey(g.Id)) _state.FirstSeen[g.Id] = first ? DateTime.MinValue : DateTime.UtcNow;
                }
                SaveFeedCache(feed);
                SaveState();
                Fire();
                await RunExclusive(null, async c => await SyncBaseAsync(feed, c), ct);   // löscht auch die Dateien entfernter Spiele
                foreach (var f in gone) try { var d = Path.Combine(Root, f); if (Directory.Exists(d) && !Directory.EnumerateFiles(d, "*", SearchOption.AllDirectories).Any()) Directory.Delete(d, true); } catch { }
                foreach (var id in moved) Enqueue(id);   // umbenanntes Spiel war installiert: neues gleich laden
                if (_state.AutoUpdate)
                    foreach (var g in feed.Games.Where(g => Status(g) is { Installed: true, Update: true } && !IsRunning(g.Id)).ToList())
                        Enqueue(g.Id);
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { LastError = ex.Message; }
        finally { Refreshing = false; Fire(); }
    }

    /// <summary>
    /// Umbenannte und entfernte Spiele (z. B. neuer Ordner/neue Kennung): Spielzeit und „gesehen“ gehen auf das neue Spiel über, war das
    /// alte installiert, wird das neue geladen (Rückgabe moved). Installierte Ordner, die es im Katalog nicht mehr gibt und die kein anderes
    /// installiertes Spiel braucht, gelten als nicht mehr installiert – ihre Dateien räumt der Basis-Abgleich weg (Rückgabe gone).
    /// Erkannt wird ein Umzug an derselben Spiel-Adresse (easygames-Link), am selben Ordner oder am selben Titel. Aufruf unter _gate.
    /// </summary>
    private (List<string> Moved, List<string> Gone) Reconcile(Feed? old, Feed feed)
    {
        var moved = new List<string>(); var gone = new List<string>();
        var ids = feed.Games.Select(g => g.Id).ToHashSet(StringComparer.Ordinal);
        static string U(string u) => u.TrimEnd('/').ToLowerInvariant();
        GameMeta? Successor(GameMeta o) => feed.Games.FirstOrDefault(n => n.Kind == "bundled" && ((o.Url.Length > 0 && U(n.Url) == U(o.Url)) || n.Folder == o.Folder))
                                           ?? feed.Games.FirstOrDefault(n => n.Kind == "bundled" && o.Title.Length > 0 && n.Title == o.Title);
        if (old != null)
            foreach (var o in old.Games.Where(o => !ids.Contains(o.Id)))
            {
                var n = Successor(o);
                if (n == null) continue;
                if (_state.Play.TryGetValue(o.Id, out var p) && !_state.Play.ContainsKey(n.Id)) _state.Play[n.Id] = p;
                if (_state.FirstSeen.TryGetValue(o.Id, out var seen) && !_state.FirstSeen.ContainsKey(n.Id)) _state.FirstSeen[n.Id] = seen;
                if (o.Kind == "bundled" && _state.Installed.Contains(o.Folder) && !moved.Contains(n.Id)) moved.Add(n.Id);
            }
        var folders = Units(feed);
        foreach (var f in _state.Installed.Where(f => !folders.Contains(f)).ToList())
        {
            var oldId = old?.Games.FirstOrDefault(g => g.Folder == f)?.Id ?? f;
            if (IsRunning(oldId)) continue;   // läuft gerade: beim nächsten Abgleich
            if (_state.Deps.Any(d => d.Key != f && folders.Contains(d.Key) && _state.Installed.Contains(d.Key) && d.Value.Contains(f))) continue;   // noch gebraucht
            _state.Installed.Remove(f); _state.Deps.Remove(f); gone.Add(f);
        }
        foreach (var n in moved.ToList()) if (Find(feed, n) is { } g && _state.Installed.Contains(g.Folder)) moved.Remove(n);   // gleicher Ordner: normales Update
        return (moved, gone);
    }

    private static GameMeta? Find(Feed feed, string id) => feed.Games.FirstOrDefault(g => g.Id == id);

    /// <summary>Holt Dateiliste und Katalog von GitHub (am CDN-Zwischenspeicher vorbei); null ohne Netz oder bei Fehlern.</summary>
    private async Task<Feed?> FetchFeedAsync(CancellationToken ct)
    {
        try
        {
            var t = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var man = await _http.GetStringAsync(Source + "sync/manifest.json?t=" + t, ct);
            using var m = JsonDocument.Parse(man);
            var cat = m.RootElement.TryGetProperty("catalog", out var c) && c.ValueKind == JsonValueKind.String && Safe(c.GetString() ?? "") ? c.GetString()! : "sync/catalog.json";
            var games = await _http.GetStringAsync(Source + cat + "?t=" + t, ct);
            return Feed.Parse(Source, man, games);
        }
        catch (OperationCanceledException) { throw; }
        catch { return null; }
    }

    private async Task SyncBaseAsync(Feed feed, CancellationToken ct)
    {
        var files = BaseFiles(feed).ToDictionary(k => k.Key, k => k.Value, StringComparer.Ordinal);
        var folders = GameFolders(feed);
        List<string> stale;
        lock (_gate) stale = _state.Files.Keys.Where(p => { var i = p.IndexOf('/'); return (i < 0 || !folders.Contains(p[..i])) && !files.ContainsKey(p) && !InstalledFolder(p) && !feed.BigVendor.Any(v => InFolder(p, v) && feed.Files.ContainsKey(p)); }).ToList();
        await ApplyAsync(feed, files, stale, ct, null);
    }

    private bool InstalledFolder(string path) => _state.Installed.Any(u => InFolder(path, u));

    // ---------- Installieren / Aktualisieren / Entfernen ----------

    /// <summary>Spiel in die Warteschlange (Installation oder Update). Läuft nacheinander im Hintergrund.</summary>
    public void Enqueue(string id)
    {
        if (BusyId == id || _queue.Contains(id)) return;
        var g = Find(id);
        if (g == null || g.Kind != "bundled") return;
        _queue.Enqueue(id);
        Fire();
        _ = Task.Run(PumpAsync);
    }

    public void Cancel(string id)
    {
        if (BusyId == id) _cancel?.Cancel();
        else if (_queue.Contains(id))
        {
            var rest = _queue.Where(q => q != id).ToList();
            while (_queue.TryDequeue(out _)) { }
            foreach (var q in rest) _queue.Enqueue(q);
            Fire();
        }
    }

    private async Task PumpAsync()
    {
        while (_queue.TryPeek(out var id))
        {
            if (!await _op.WaitAsync(0)) return;   // läuft schon: der laufende Pump arbeitet die Schlange ab
            try
            {
                if (!_queue.TryDequeue(out id)) return;
                _cancel = new CancellationTokenSource();
                BusyId = id; BusyProgress = (0, 0); LastError = null; Fire();
                try { await InstallCoreAsync(id, _cancel.Token); }
                catch (OperationCanceledException) { }
                catch (Exception ex) { LastError = (Find(id)?.Short ?? id) + ": " + ex.Message; }
            }
            finally
            {
                BusyId = null; _cancel?.Dispose(); _cancel = null;
                _op.Release();
                Fire();
            }
        }
    }

    /// <summary>Installiert/aktualisiert sofort (für Tests und „Spielen“ nach Installation).</summary>
    public Task InstallAsync(string id, CancellationToken ct = default) => RunExclusive(id, c => InstallCoreAsync(id, c), ct);

    private async Task RunExclusive(string? id, Func<CancellationToken, Task> work, CancellationToken ct)
    {
        await _op.WaitAsync(ct);
        try
        {
            if (id != null) { BusyId = id; BusyProgress = (0, 0); Fire(); }
            await work(ct);
        }
        finally
        {
            if (id != null) BusyId = null;
            _op.Release();
            Fire();
            if (!_queue.IsEmpty) _ = Task.Run(PumpAsync);
        }
    }

    private async Task InstallCoreAsync(string id, CancellationToken ct)
    {
        try { await InstallOnceAsync(id, ct); }
        catch (ChecksumException)
        {
            // Der Server hat die Spiele inzwischen neu abgeglichen (neue Dateien, unsere Dateiliste ist älter): Liste neu holen und noch einmal laden
            var feed = await FetchFeedAsync(ct);
            if (feed == null) throw;
            lock (_gate) _feed = feed;
            SaveFeedCache(feed); Fire();
            await InstallOnceAsync(id, ct);
        }
    }

    private async Task InstallOnceAsync(string id, CancellationToken ct)
    {
        var feed = _feed ?? throw new InvalidOperationException("Keine Spieleliste – bitte mit dem Internet verbinden.");
        var g = Find(id) ?? throw new InvalidOperationException("Spiel nicht gefunden.");
        if (IsRunning(id)) throw new InvalidOperationException("Das Spiel läuft gerade – nach dem Beenden aktualisieren.");
        if (!BaseReady) await SyncBaseAsync(feed, ct);
        var folders = Units(feed);
        var todo = new Queue<string>(); todo.Enqueue(g.Folder);
        var done = new HashSet<string>(StringComparer.Ordinal);
        long total = 0, progress = 0;
        while (todo.TryDequeue(out var folder))
        {
            if (!done.Add(folder)) continue;
            var files = feed.Files.Where(f => InFolder(f.Key, folder)).ToDictionary(k => k.Key, k => k.Value, StringComparer.Ordinal);
            if (files.Count == 0) throw new InvalidOperationException("Für „" + folder + "“ gibt es keine Dateien auf dem Server.");
            List<string> stale;
            lock (_gate)
            {
                stale = _state.Files.Keys.Where(p => InFolder(p, folder) && !files.ContainsKey(p)).ToList();
                total += files.Where(f => !_state.Files.TryGetValue(f.Key, out var l) || l.H != f.Value.H).Sum(f => f.Value.S);
            }
            BusyProgress = (progress, total); Fire();
            await ApplyAsync(feed, files, stale, ct, n => { Interlocked.Add(ref progress, n); BusyProgress = (Interlocked.Read(ref progress), total); Fire(); });
            // Abhängigkeiten: Spiele, die Dateien aus anderen Spielordnern nutzen (z. B. ../easyclash/js/model.js) oder große Bibliotheken
            var deps = folder.StartsWith("vendor/", StringComparison.Ordinal) ? new List<string>() : ScanDeps(folder, folders, feed);
            lock (_gate)
            {
                _state.Deps[folder] = deps;
                if (!_state.Installed.Contains(folder)) _state.Installed.Add(folder);
            }
            foreach (var d in deps) { bool need; lock (_gate) need = !_state.Installed.Contains(d) || FolderOutdated(feed, d); if (need) todo.Enqueue(d); }
            SaveState();
        }
    }

    private List<string> ScanDeps(string folder, HashSet<string> folders, Feed feed)
    {
        var cdn = feed.Vendor.Where(v => feed.BigVendor.Any(b => InFolder(v.Value, b))).ToList();
        var deps = new SortedSet<string>(StringComparer.Ordinal);
        var dir = Path.Combine(Root, folder);
        if (!Directory.Exists(dir)) return new();
        foreach (var f in Directory.EnumerateFiles(dir, "*", SearchOption.AllDirectories))
        {
            var ext = Path.GetExtension(f).ToLowerInvariant();
            if (ext is not (".html" or ".htm" or ".js" or ".mjs" or ".css" or ".json")) continue;
            string text;
            try { text = File.ReadAllText(f); } catch { continue; }
            foreach (Match m in DepRx.Matches(text))
            {
                var d = m.Groups[1].Value;
                if (d != folder && folders.Contains(d)) deps.Add(d);
                if (d == "vendor" && folders.Contains("vendor/" + m.Groups[2].Value)) deps.Add("vendor/" + m.Groups[2].Value);
            }
            foreach (var (url, target) in cdn)
                if (text.Contains(url, StringComparison.Ordinal)) { var b = feed.BigVendor.FirstOrDefault(x => InFolder(target, x)); if (b != null) deps.Add(b); }
        }
        return deps.ToList();
    }

    /// <summary>Spiel entfernen. Wird es von einem anderen installierten Spiel gebraucht, bleibt es (Rückgabe: Namen der Spiele).</summary>
    public string[] Uninstall(string id)
    {
        var g = Find(id);
        if (g == null) return Array.Empty<string>();
        if (IsRunning(id)) throw new InvalidOperationException("Das Spiel läuft gerade.");
        if (BusyId == id) throw new InvalidOperationException("Das Spiel wird gerade geladen.");
        lock (_gate)
        {
            var users = _state.Deps.Where(d => d.Key != g.Folder && _state.Installed.Contains(d.Key) && d.Value.Contains(g.Folder))
                                   .Select(d => Games.FirstOrDefault(x => x.Folder == d.Key)?.Short ?? d.Key).ToArray();
            if (users.Length > 0) return users;
            foreach (var p in _state.Files.Keys.Where(p => InFolder(p, g.Folder)).ToList()) _state.Files.Remove(p);
            _state.Installed.Remove(g.Folder);
            _state.Deps.Remove(g.Folder);
        }
        try { var dir = Path.Combine(Root, g.Folder); if (Directory.Exists(dir)) Directory.Delete(dir, true); } catch { }
        SaveState();
        Fire();
        return Array.Empty<string>();
    }

    public void AddPlayTime(string id, TimeSpan t)
    {
        lock (_gate)
        {
            if (!_state.Play.TryGetValue(id, out var p)) _state.Play[id] = p = new PlayRec();
            p.Seconds += (long)Math.Max(0, t.TotalSeconds);
            p.Last = DateTime.UtcNow.ToString("o");
        }
        SaveState();
        Fire();
    }

    public long DiskBytes { get { lock (_gate) return _state.Files.Values.Sum(f => f.S); } }

    // ---------- Dateien laden und übernehmen ----------

    /// <summary>Lädt geänderte Dateien parallel in einen Zwischenordner, prüft Größe und SHA-256 und übernimmt erst dann alles.</summary>
    private async Task ApplyAsync(Feed feed, Dictionary<string, FileRec> files, List<string> stale, CancellationToken ct, Action<long>? progress)
    {
        List<KeyValuePair<string, FileRec>> changed;
        lock (_gate) changed = files.Where(f => (!_state.Files.TryGetValue(f.Key, out var l) || l.H != f.Value.H || !File.Exists(Local(f.Key))) && Safe(f.Key, f.Value)).ToList();
        if (changed.Count == 0 && stale.Count == 0) return;
        var tmp = Path.Combine(_data, "download");
        Directory.CreateDirectory(tmp);
        var parts = new ConcurrentBag<(string Path, string Tmp)>();
        using var gate = new SemaphoreSlim(Parallel);
        var tasks = changed.Select(async f =>
        {
            await gate.WaitAsync(ct);
            try
            {
                var t = Path.Combine(tmp, Guid.NewGuid().ToString("N"));
                var url = feed.BaseUrl + string.Join("/", f.Key.Split('/').Select(Uri.EscapeDataString)) + "?v=" + f.Value.H[..12];
                await DownloadAsync(url, t, f.Value, ct, progress);
                parts.Add((f.Key, t));
            }
            finally { gate.Release(); }
        }).ToList();
        try { await Task.WhenAll(tasks); }
        catch
        {
            foreach (var p in parts) TryDelete(p.Tmp);
            throw;
        }
        lock (_gate)
        {
            foreach (var (p, t) in parts)
            {
                var dst = Local(p);
                Directory.CreateDirectory(Path.GetDirectoryName(dst)!);
                File.Move(t, dst, true);
                _state.Files[p] = files[p];
            }
            foreach (var p in stale)
            {
                TryDelete(Local(p));
                _state.Files.Remove(p);
            }
        }
        SaveState();
    }

    private static bool Safe(string p) => p.Length > 0 && !(p.Contains("..") || p.StartsWith('/') || p.StartsWith('.') || p.Contains(':') || p.Contains('\\'));
    private static bool Safe(string p, FileRec f) => Safe(p) && f.H.Length == 64;

    private string Local(string p) => Path.Combine(Root, p.Replace('/', Path.DirectorySeparatorChar));

    private async Task DownloadAsync(string url, string target, FileRec f, CancellationToken ct, Action<long>? progress)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                using (var resp = await _http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct))
                {
                    resp.EnsureSuccessStatusCode();
                    await using var src = await resp.Content.ReadAsStreamAsync(ct);
                    await using var dst = File.Create(target);
                    var buf = new byte[81920];
                    int n;
                    long got = 0;
                    while ((n = await src.ReadAsync(buf, ct)) > 0)
                    {
                        await dst.WriteAsync(buf.AsMemory(0, n), ct);
                        got += n;
                        if (got <= f.S) progress?.Invoke(n);
                    }
                }
                string hash;
                await using (var fs = File.OpenRead(target))
                    hash = Convert.ToHexString(await SHA256.HashDataAsync(fs, ct)).ToLowerInvariant();
                if (new FileInfo(target).Length != f.S || hash != f.H) throw new ChecksumException("Prüfsumme stimmt nicht: " + Path.GetFileName(new Uri(url).LocalPath));
                return;
            }
            catch (OperationCanceledException) { TryDelete(target); throw; }
            catch (ChecksumException) { TryDelete(target); throw; }   // gleiche Adresse liefert wieder dasselbe – Dateiliste ist veraltet
            catch when (attempt < 3) { TryDelete(target); await Task.Delay(600 * attempt, ct); }
            catch { TryDelete(target); throw; }
        }
    }

    private static void TryDelete(string p) { try { if (File.Exists(p)) File.Delete(p); } catch { } }

    private void Fire() { try { Changed?.Invoke(); } catch { } }

    // ---------- Speichern ----------

    private string StateFile => Path.Combine(_data, "state.json");
    private string FeedFile => Path.Combine(_data, "feed.json");

    private StateData LoadState()
    {
        try { if (File.Exists(StateFile)) return JsonSerializer.Deserialize<StateData>(File.ReadAllText(StateFile), Json) ?? new(); } catch { }
        return new StateData();
    }

    private void SaveState()
    {
        string text;
        lock (_gate) text = JsonSerializer.Serialize(_state, Json);
        WriteAtomic(StateFile, text);
    }

    private Feed? LoadFeedCache()
    {
        try
        {
            if (!File.Exists(FeedFile)) return null;
            var c = JsonSerializer.Deserialize<FeedCache>(File.ReadAllText(FeedFile), Json);
            return c == null ? null : Feed.Parse(c.BaseUrl, c.Manifest, c.Games);
        }
        catch { return null; }
    }

    private void SaveFeedCache(Feed f) => WriteAtomic(FeedFile, JsonSerializer.Serialize(new FeedCache(f.BaseUrl, f.ManifestText, f.GamesText), Json));

    private readonly object _write = new();
    private void WriteAtomic(string file, string text)
    {
        lock (_write)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(file)!);
            var tmp = file + ".tmp";
            File.WriteAllText(tmp, text);
            File.Move(tmp, file, true);
        }
    }

    private sealed record FeedCache(string BaseUrl, string Manifest, string Games);

    public sealed class FileRec
    {
        public long S { get; set; }
        public string H { get; set; } = "";
    }

    public sealed class PlayRec
    {
        public long Seconds { get; set; }
        public string? Last { get; set; }
    }

    private sealed class StateData
    {
        public Dictionary<string, FileRec> Files { get; set; } = new(StringComparer.Ordinal);
        public List<string> Installed { get; set; } = new();
        public Dictionary<string, List<string>> Deps { get; set; } = new();
        public Dictionary<string, PlayRec> Play { get; set; } = new();
        public Dictionary<string, DateTime> FirstSeen { get; set; } = new();
        public bool AutoUpdate { get; set; } = true;
        public bool Fullscreen { get; set; }
        /// <summary>Clip-Puffer im Spiel (F9 = letzte 30 s speichern); aus = nur Aufnahme mit F10.</summary>
        public bool Clips { get; set; } = true;
        /// <summary>Eigene Controller-Belegungen je Pad-Kennung (Format: gamepad.js, EasyGamesPadNormal).</summary>
        public Dictionary<string, JsonElement> PadMaps { get; set; } = new();
    }

    private sealed class Feed
    {
        public string BaseUrl = "";
        public string ManifestText = "";
        public string GamesText = "";
        public Dictionary<string, FileRec> Files = new(StringComparer.Ordinal);
        public List<GameMeta> Games = new();
        /// <summary>CDN-Adresse → lokaler Pfad in vendor/ (Manifest „vendor“).</summary>
        public Dictionary<string, string> Vendor = new(StringComparer.Ordinal);
        /// <summary>Große Bibliotheken (vendor/&lt;name&gt; ab 2 MB), nur für Spiele, die sie nutzen.</summary>
        public HashSet<string> BigVendor = new(StringComparer.Ordinal);

        /// <summary>sync/manifest.json (Schema 1: files [{p,s,h}], vendor) und sync/catalog.json (games [{id,title,path,img,modes …}]).</summary>
        public static Feed? Parse(string baseUrl, string manifest, string games)
        {
            using var m = JsonDocument.Parse(manifest);
            var mr = m.RootElement;
            if (mr.TryGetProperty("version", out var ov) && ov.ValueKind == JsonValueKind.Number && mr.TryGetProperty("files", out var of) && of.ValueKind == JsonValueKind.Object)
                return Legacy(baseUrl, manifest, games, of);   // Zwischenspeicher einer älteren App-Version (Spielestand vom eigenen Server)
            if (!mr.TryGetProperty("schema", out var sc) || sc.ValueKind != JsonValueKind.Number || sc.GetInt32() != 1 || !mr.TryGetProperty("files", out var files) || files.ValueKind != JsonValueKind.Array) return null;
            var f = new Feed { BaseUrl = baseUrl, ManifestText = manifest, GamesText = games };
            foreach (var e in files.EnumerateArray())
            {
                if (!e.TryGetProperty("p", out var pp) || pp.ValueKind != JsonValueKind.String || !e.TryGetProperty("s", out var ss) || !e.TryGetProperty("h", out var hh)) continue;
                var path = pp.GetString() ?? "";
                var rec = new FileRec { S = ss.GetInt64(), H = (hh.GetString() ?? "").ToLowerInvariant() };
                if (Safe(path, rec)) f.Files[path] = rec;
            }
            if (mr.TryGetProperty("vendor", out var vd) && vd.ValueKind == JsonValueKind.Object)
                foreach (var v in vd.EnumerateObject())
                    if (v.Value.ValueKind == JsonValueKind.String && f.Files.ContainsKey(v.Value.GetString() ?? "")) f.Vendor[v.Name] = v.Value.GetString()!;
            foreach (var g in f.Files.Where(x => x.Key.StartsWith("vendor/", StringComparison.Ordinal) && x.Key.Count(ch => ch == '/') >= 2)
                                     .GroupBy(x => "vendor/" + x.Key.Split('/')[1]))
                if (g.Sum(x => x.Value.S) >= BigVendorBytes) f.BigVendor.Add(g.Key);

            using var c = JsonDocument.Parse(games);
            if (!c.RootElement.TryGetProperty("games", out var list) || list.ValueKind != JsonValueKind.Array) return null;
            string S(JsonElement e, string k) => e.TryGetProperty(k, out var x) && x.ValueKind == JsonValueKind.String ? x.GetString() ?? "" : "";
            foreach (var e in list.EnumerateArray())
            {
                var id = S(e, "id");
                var folder = S(e, "path").Trim('/');
                if (id.Length == 0 || folder.Length == 0 || folder.Contains('/') || !Safe(folder)) continue;
                if (!f.Files.Keys.Any(k => InFolder(k, folder))) continue;   // Dateien fehlen: nicht anbieten
                var title = S(e, "title").Length > 0 ? S(e, "title") : id;
                var thumb = "thumbs/" + folder + ".webp";
                var cover = f.Files.ContainsKey(thumb) ? thumb : S(e, "img");   // kleines Vorschaubild, sonst Kartenbild
                var modes = new List<string>();
                if (e.TryGetProperty("modes", out var mo) && mo.ValueKind == JsonValueKind.Object)
                    foreach (var x in mo.EnumerateObject()) if (x.Value.ValueKind == JsonValueKind.True) modes.Add(x.Name);
                if (e.TryGetProperty("multiplayer", out var mp) && mp.ValueKind == JsonValueKind.True && !modes.Contains("multi")) modes.Add("multi");
                var cut = title.IndexOf(" – ", StringComparison.Ordinal);
                f.Games.Add(new GameMeta(id, folder, title, cut > 2 ? title[..cut] : title, S(e, "desc"), (S(e, "icon") + " easygames").Trim(), cover,
                                         "", Public + folder + "/", "bundled", folder + "/index.html", modes.ToArray()));
            }
            return f;
        }

        /// <summary>
        /// Früheres Format (manifest.json mit „files“-Objekt + games.json vom eigenen Server). Nur noch, um beim ersten Start der neuen
        /// Version installierte Spiele und Spielzeiten auf die GitHub-Kennungen zu übertragen (Zuordnung über die easygames-Adresse).
        /// </summary>
        private static Feed? Legacy(string baseUrl, string manifest, string games, JsonElement files)
        {
            var f = new Feed { BaseUrl = baseUrl, ManifestText = manifest, GamesText = games };
            foreach (var p in files.EnumerateObject())
                if (p.Value.ValueKind == JsonValueKind.Array && p.Value.GetArrayLength() >= 2)
                    f.Files[p.Name] = new FileRec { S = p.Value[0].GetInt64(), H = p.Value[1].GetString() ?? "" };
            using var g = JsonDocument.Parse(games);
            if (!g.RootElement.TryGetProperty("games", out var list)) return null;
            string S(JsonElement e, string k) => e.TryGetProperty(k, out var x) && x.ValueKind == JsonValueKind.String ? x.GetString() ?? "" : "";
            foreach (var e in list.EnumerateArray())
            {
                var id = S(e, "id"); var entry = S(e, "entry");
                if (id.Length == 0) continue;
                var folder = entry.Contains('/') ? entry[..entry.IndexOf('/')] : id;
                f.Games.Add(new GameMeta(id, folder, S(e, "title"), S(e, "short"), S(e, "desc"), S(e, "meta"), S(e, "cover"), S(e, "genre"), S(e, "url"), S(e, "kind"), entry, Array.Empty<string>()));
            }
            return f;
        }
    }
}

/// <summary>Geladene Datei passt nicht zur Dateiliste (Größe/SHA-256) – meist ist die Liste älter als der Stand auf dem Server.</summary>
public sealed class ChecksumException : IOException
{
    public ChecksumException(string message) : base(message) { }
}
