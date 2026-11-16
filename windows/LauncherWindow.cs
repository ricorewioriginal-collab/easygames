using System.Text.Json;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace EasyGames.Windows;

/// <summary>
/// Hauptfenster: die Bibliothek (HTML-Oberfläche aus der EXE, launcher/index.html). Sie spricht über WebView2-Nachrichten mit
/// dem Store: Liste, Installieren, Updates, Entfernen, Spielen. Neue Spiele und Updates holt die App beim Start, alle 30 Minuten
/// und beim Zurückkehren ins Fenster (nach mindestens 10 Minuten).
/// </summary>
public sealed class LauncherWindow : Window
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private readonly WebView2 _web = new() { DefaultBackgroundColor = System.Drawing.Color.FromArgb(255, 8, 11, 18) };
    private readonly DispatcherTimer _tick = new() { Interval = TimeSpan.FromMilliseconds(250) };
    private readonly DispatcherTimer _auto = new() { Interval = TimeSpan.FromMinutes(30) };
    private readonly Dictionary<string, GameWindow> _open = new();
    private Store S => App.Store;
    private volatile bool _ready, _dirty = true, _refreshRunning;
    private string _lastGames = "";
    private DateTime _lastRefresh = DateTime.MinValue;
    private Updater.Info? _appUpdate;
    private int _appUpdatePct = -1;
    private volatile string? _toast;

    public LauncherWindow()
    {
        Title = "easygames";
        Width = 1320; Height = 840; MinWidth = 940; MinHeight = 600;
        WindowStartupLocation = WindowStartupLocation.CenterScreen;
        Background = new SolidColorBrush(Color.FromRgb(8, 11, 18));
        try { Icon = BitmapFrame.Create(new Uri("pack://application:,,,/app.ico")); } catch { }
        Content = _web;
        S.IsRunning = GameWindow.IsRunning;
        S.Changed += () => _dirty = true;
        App.TikTok.Changed += () => _dirty = true;
        GameWindow.RunningChanged += () => _dirty = true;
        _tick.Tick += (_, _) => { if (_ready && _dirty) Send(); };
        _auto.Tick += (_, _) => Refresh();
        Activated += (_, _) => { if (_ready && DateTime.UtcNow - _lastRefresh > TimeSpan.FromMinutes(10)) Refresh(); };
        Loaded += async (_, _) => await InitAsync();
    }

    private void FocusWeb()
    {
        try { if (IsActive && _web.CoreWebView2 != null) _web.Focus(); } catch { }
    }

    public void BringToFront()
    {
        if (WindowState == WindowState.Minimized) WindowState = WindowState.Normal;
        Activate();
    }

    private async Task InitAsync()
    {
        try
        {
            await _web.EnsureCoreWebView2Async(await Host.Env);
            var core = _web.CoreWebView2;
            Host.Attach(core, Dispatcher, launcher: true);
            try { await core.AddScriptToExecuteOnDocumentCreatedAsync(Host.PadScript()); } catch (Exception ex) { App.Log(ex); }   // Controller-Belegung auch in der Bibliothek
            core.WebMessageReceived += OnMessage;
            core.NavigationStarting += (_, e) =>
            {
                if (Uri.TryCreate(e.Uri, UriKind.Absolute, out var u) && u.Host.Equals(Host.Name, StringComparison.OrdinalIgnoreCase))
                {
                    if (u.AbsolutePath is "/" or "/index.html") return;
                    e.Cancel = true;   // Konto, Erfolge … (Links aus easygames-Seiten) im eigenen Fenster
                    var page = u.AbsolutePath.TrimStart('/');
                    Dispatcher.BeginInvoke(new Action(() => OpenPage(page + u.Query)));
                    return;
                }
                e.Cancel = true;
                Host.OpenExternal(e.Uri);
            };
            core.NewWindowRequested += (_, e) => { e.Handled = true; Host.OpenExternal(e.Uri); };
            // Controller sofort in der Bibliothek (WebView2 liefert Controller-Eingaben erst, wenn sie den Fokus hat – sonst erst nach einem Mausklick)
            core.NavigationCompleted += (_, _) => FocusWeb();
            Activated += (_, _) => FocusWeb();
            core.Navigate("https://" + Host.Name + "/");
            _tick.Start();
            _auto.Start();
        }
        catch (Exception ex)
        {
            App.Log(ex);
            MessageBox.Show(this, "easygames braucht die „Microsoft Edge WebView2 Runtime“ (bei Windows 10/11 meist vorhanden).\nDownload: https://go.microsoft.com/fwlink/p/?LinkId=2124703\n\n" + ex.Message,
                "easygames", MessageBoxButton.OK, MessageBoxImage.Warning);
            Close();
        }
    }

    private void Refresh()
    {
        if (_refreshRunning) return;
        _refreshRunning = true;
        _lastRefresh = DateTime.UtcNow;
        _ = Task.Run(async () =>
        {
            try
            {
                var before = S.Games.Select(g => g.Id).ToHashSet();
                await S.RefreshAsync();
                var fresh = S.Games.Where(g => before.Count > 0 && !before.Contains(g.Id)).Select(g => g.Short).ToList();
                if (fresh.Count > 0) _toast = fresh.Count == 1 ? "Neues Spiel: " + fresh[0] : fresh.Count + " neue Spiele: " + string.Join(", ", fresh.Take(4)) + (fresh.Count > 4 ? " …" : "");
                _appUpdate ??= await Updater.CheckAsync();
            }
            finally { _refreshRunning = false; _dirty = true; }
        });
    }

    private void OnMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        if (!Uri.TryCreate(e.Source, UriKind.Absolute, out var src) || !src.Host.Equals(Host.Name, StringComparison.OrdinalIgnoreCase)) return;
        try
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var r = doc.RootElement;
            string Str(string k) => r.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : "";
            bool Bool(string k) => r.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.True;
            var id = Str("id");
            switch (Str("cmd"))
            {
                case "ready":
                    _ready = true; _lastGames = ""; Send();
                    if (_lastRefresh == DateTime.MinValue) Refresh();
                    break;
                case "install": S.Enqueue(id); break;
                case "cancel": S.Cancel(id); break;
                case "uninstall":
                    var users = S.Uninstall(id);
                    if (users.Length > 0) _toast = "Wird noch von " + string.Join(", ", users) + " gebraucht und bleibt installiert.";
                    break;
                case "play": Play(id); break;
                case "tiktok":
                    switch (Str("act"))
                    {
                        case "start": _ = App.TikTok.StartAsync(Str("name")); break;
                        case "stop": App.TikTok.Stop(); break;
                        case "node": App.TikTok.InstallNode(); break;
                        case "python": App.TikTok.InstallPython(); break;
                        case "engine": App.TikTok.SetEngine(Str("engine")); break;
                        case "overlay": App.TikTok.SetOverlay(Bool("on")); break;
                        case "inGames": App.TikTok.SetInGames(Bool("on")); break;
                        case "setup": Play(id, true); break;
                        case "copy": try { Clipboard.SetText(Str("text")); _toast = "Link kopiert."; } catch { } break;
                    }
                    break;
                case "refresh": Refresh(); break;
                case "auto": S.AutoUpdate = Bool("on"); break;
                case "fullscreen": S.Fullscreen = Bool("on"); break;
                case "clips": S.Clips = Bool("on"); break;
                case "page": OpenPage(Str("page")); break;
                case "home": BackToGame(); break;
                case "open": Host.OpenExternal(Str("url")); break;
                case "appUpdate": _ = InstallAppUpdateAsync(); break;
                case "padmaps":
                    if (r.TryGetProperty("maps", out var maps)) { S.SetPadMaps(maps); _toast = "Controller-Belegung gespeichert – gilt in allen Spielen (beim nächsten Start)."; }
                    break;
            }
        }
        catch (Exception ex) { App.Log(ex); _toast = ex.Message; }
        _dirty = true;
    }

    // Seiten der easygames-Homepage (liegen mit den Basisdateien lokal vor): Konto, Erfolge, Ranglisten …
    private static readonly Dictionary<string, string> Pages = new(StringComparer.Ordinal)
    {
        ["konto"] = "Konto", ["erfolge"] = "Erfolge", ["ranglisten"] = "Ranglisten", ["profil"] = "Profil & Freunde", ["heute"] = "Heute",
        ["chat"] = "Chat", ["bug"] = "Fehler melden", ["konto-loeschen"] = "Konto löschen", ["radio-erfolge"] = "Radio-Erfolge", ["radio-profil"] = "Radio-Profil",
    };

    /// <summary>Home-Taste in der Bibliothek: zurück ins zuletzt gespielte, noch offene Spiel.</summary>
    private void BackToGame()
    {
        var w = _open.Values.Where(x => x.IsLoaded).OrderByDescending(x => x.LastActive).FirstOrDefault();
        if (w == null) return;
        if (w.WindowState == WindowState.Minimized) w.WindowState = WindowState.Normal;
        w.Activate();
    }

    private void OpenPage(string page)
    {
        var q = page.IndexOf('?');
        var file = q >= 0 ? page[..q] : page;
        if (!file.EndsWith(".html", StringComparison.Ordinal) || !Pages.TryGetValue(file[..^5], out var title)) return;
        if (!S.BaseReady) { _toast = "Gemeinsame Dateien werden noch geladen …"; _dirty = true; return; }
        var id = "page:" + file[..^5];
        if (_open.TryGetValue(id, out var w) && w.IsLoaded) { if (w.WindowState == WindowState.Minimized) w.WindowState = WindowState.Normal; w.Activate(); return; }
        var meta = new GameMeta(id, "", title, title, "", "", "", "", "", "page", "", Array.Empty<string>());
        w = new GameWindow(meta, "https://" + Host.Name + "/" + page, false);
        w.Closed += (_, _) => { _open.Remove(id); _dirty = true; };
        _open[id] = w;
        w.Show();
    }

    private void Play(string id, bool tiktokSetup = false)
    {
        var g = S.Find(id);
        if (g == null) return;
        if (tiktokSetup && _open.TryGetValue(id, out var old) && old.IsLoaded) old.Close();   // Einstellungen: neu öffnen
        if (_open.TryGetValue(id, out var w) && w.IsLoaded) { if (w.WindowState == WindowState.Minimized) w.WindowState = WindowState.Normal; w.Activate(); return; }
        if (g.Kind == "bundled" && !S.Status(g).Installed) { S.Enqueue(id); return; }
        w = new GameWindow(g, S.Url(g), S.Fullscreen && !tiktokSetup, tiktokSetup);
        w.Closed += (_, _) => { _open.Remove(id); _dirty = true; if (S.AutoUpdate && S.Status(g).Update) S.Enqueue(id); };
        _open[id] = w;
        w.Show();
    }

    private async Task InstallAppUpdateAsync()
    {
        if (_appUpdate == null || _appUpdatePct >= 0) return;
        _appUpdatePct = 0;
        try
        {
            await Updater.InstallAsync(_appUpdate, new Progress<int>(p => { _appUpdatePct = p; _dirty = true; }));
            Application.Current.Shutdown();
        }
        catch (Exception ex) { _appUpdatePct = -1; _toast = "Update fehlgeschlagen: " + ex.Message; _dirty = true; }
    }

    /// <summary>Zustand an die Oberfläche. Die Spieleliste nur, wenn sie sich geändert hat (Fortschritt kommt bis zu 4× pro Sekunde).</summary>
    private void Send()
    {
        _dirty = false;
        var games = S.Games.Select(g =>
        {
            var st = S.Status(g);
            return new
            {
                g.Id, g.Title, g.Short, g.Desc, g.Meta, g.Cover, g.Genre, g.Url, g.Kind, g.Modes,
                st.Installed, st.Update, st.New, st.Size, Play = st.PlaySeconds, Last = st.LastPlayed, st.Needs, Running = GameWindow.IsRunning(g.Id),
            };
        }).ToList();
        var gamesJson = JsonSerializer.Serialize(games, Json);
        var sendGames = gamesJson != _lastGames;
        _lastGames = gamesJson;
        var (done, total) = S.BusyProgress;
        var state = new
        {
            type = "state",
            version = Updater.Version,
            online = S.Online,
            refreshing = S.Refreshing,
            baseReady = S.BaseReady,
            busy = S.BusyId,
            done,
            total,
            queue = S.Queued,
            error = S.LastError,
            toast = _toast,
            auto = S.AutoUpdate,
            fullscreen = S.Fullscreen,
            clips = S.Clips,
            padMaps = S.PadMaps,
            tiktok = new { name = App.TikTok.Name, running = App.TikTok.Running, busy = App.TikTok.Busy, status = App.TikTok.Status, inGames = App.TikTok.InGames, engine = App.TikTok.Engine, overlay = App.TikTok.Overlay, node = TikTok.FindNode() != null, python = TikTok.FindPython() != null, log = App.TikTok.Log.TakeLast(8) },
            disk = S.DiskBytes,
            appUpdate = _appUpdate?.Version,
            appUpdatePct = _appUpdatePct,
        };
        _toast = null;
        var json = JsonSerializer.Serialize(state, Json);
        if (sendGames) json = json[..^1] + ",\"games\":" + gamesJson + "}";
        try { _web.CoreWebView2?.PostWebMessageAsJson(json); } catch { }
    }

    protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
    {
        // laufende Spiele mit schließen (Spielzeit wird gespeichert)
        foreach (var w in _open.Values.ToList()) try { w.Close(); } catch { }
        base.OnClosing(e);
    }
}
