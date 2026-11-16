using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace EasyGames.Windows;

/// <summary>
/// Eigenes Fenster je Spiel (wie ein gestartetes Spiel bei Steam). Installierte Spiele laufen lokal unter https://appassets.local
/// (offline, gleiche Adresse für alle Spiele → Spielstände und Anmeldung bleiben), Online-Spiele laden von ihrer Adresse.
/// Einladungen/Mehrspieler laufen wie überall über easygames (cloud/fire-peer.js, Links auf die easygames-Homepage).
/// F11 = Vollbild. Der Link „← Alle Spiele“ der Spiele schließt das Fenster. Spielzeit wird gezählt.
/// </summary>
public sealed class GameWindow : Window
{
    private static readonly HashSet<string> RunningIds = new();
    public static bool IsRunning(string id) { lock (RunningIds) return RunningIds.Contains(id); }
    public static event Action? RunningChanged;

    private readonly WebView2 _web = new() { DefaultBackgroundColor = System.Drawing.Color.Black };
    private readonly GameMeta _game;
    private readonly string _url;
    private readonly string _startHost;
    private readonly DateTime _started = DateTime.UtcNow;
    public DateTime LastActive { get; private set; } = DateTime.UtcNow;
    private WindowState _restore = WindowState.Normal;

    private readonly bool _ttSetup;

    public GameWindow(GameMeta game, string url, bool fullscreen, bool tiktokSetup = false)
    {
        _ttSetup = tiktokSetup;
        _game = game;
        _url = url;
        _startHost = new Uri(url).Host.ToLowerInvariant();
        Title = game.Title + " – easygames";
        Width = 1280; Height = 800; MinWidth = 480; MinHeight = 360;
        WindowStartupLocation = WindowStartupLocation.CenterScreen;
        Background = Brushes.Black;
        try { Icon = BitmapFrame.Create(new Uri("pack://application:,,,/app.ico")); } catch { }
        Content = _web;
        lock (RunningIds) RunningIds.Add(game.Id);
        RunningChanged?.Invoke();
        if (fullscreen) Loaded += (_, _) => Fullscreen(true);
        Loaded += async (_, _) => await InitAsync();
        PreviewKeyDown += (_, e) =>
        {
            if (e.Key == Key.F11) { Fullscreen(WindowStyle != WindowStyle.None); e.Handled = true; }
        };
    }

    private void Fullscreen(bool on)
    {
        if (on)
        {
            if (WindowStyle == WindowStyle.None) return;
            _restore = WindowState;
            WindowStyle = WindowStyle.None;
            ResizeMode = ResizeMode.NoResize;
            if (WindowState == WindowState.Maximized) WindowState = WindowState.Normal;   // sonst bleibt die Taskleiste sichtbar
            WindowState = WindowState.Maximized;
        }
        else
        {
            if (WindowStyle != WindowStyle.None) return;
            WindowStyle = WindowStyle.SingleBorderWindow;
            ResizeMode = ResizeMode.CanResize;
            WindowState = _restore == WindowState.Minimized ? WindowState.Normal : _restore;
        }
    }

    private async Task InitAsync()
    {
        try
        {
            await _web.EnsureCoreWebView2Async(await Host.Env);
            var core = _web.CoreWebView2;
            Host.Attach(core, Dispatcher, launcher: false);
            try { await core.AddScriptToExecuteOnDocumentCreatedAsync(Host.PadScript(game: !_game.Id.StartsWith("page:", StringComparison.Ordinal))); } catch (Exception ex) { App.Log(ex); }   // Controller-Belegung (ohne Hilfsschicht von gamepad.js)
            try { await core.AddScriptToExecuteOnDocumentCreatedAsync(Host.NativeScript); } catch (Exception ex) { App.Log(ex); }   // keine Service Worker der Spiele
            try { await core.AddScriptToExecuteOnDocumentCreatedAsync(Host.AudioWarmScript()); } catch (Exception ex) { App.Log(ex); }   // Ton sofort statt nach Sekunden
            try { await core.AddScriptToExecuteOnDocumentCreatedAsync(Host.HomeScript()); } catch (Exception ex) { App.Log(ex); }   // Home-Taste: zurück in die Bibliothek
            if (!_game.Id.StartsWith("page:", StringComparison.Ordinal))
            {
                var rec = Host.RecorderScript(_game.Title, App.Store.Clips);   // Aufnahme: F9 Clip, F10 Start/Stopp
                if (rec.Length > 0) try { await core.AddScriptToExecuteOnDocumentCreatedAsync(rec); } catch (Exception ex) { App.Log(ex); }
            }
            core.DownloadStarting += OnDownload;
            core.WebMessageReceived += OnMessage;
            var tt = App.TikTok.EmbedScript(_game, _ttSetup);   // TikTok LIVE steuert das Spiel (nur wenn die Brücke läuft)
            if (tt.Length > 0) try { await core.AddScriptToExecuteOnDocumentCreatedAsync(tt); } catch (Exception ex) { App.Log(ex); }
            core.NavigationStarting += (_, e) =>
            {
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps) return;
                var host = uri.Host.ToLowerInvariant();
                if (host == Host.Name)
                {
                    // „← Alle Spiele“ (../) führt zur Übersicht: zurück in die Bibliothek
                    if (uri.AbsolutePath is "/" or "" or "/index.html") { e.Cancel = true; Dispatcher.BeginInvoke(new Action(Close)); }
                    return;
                }
                if (host == _startHost) return;
                e.Cancel = true;
                Host.OpenExternal(e.Uri);   // fremde Seiten (Impressum, Teilen …) im Standard-Browser
            };
            core.NewWindowRequested += (_, e) => { e.Handled = true; Host.OpenExternal(e.Uri); };
            core.ContainsFullScreenElementChanged += (_, _) => Fullscreen(core.ContainsFullScreenElement);
            // Tastatur/Controller sofort im Spiel (sonst erst nach einem Klick ins Fenster)
            core.NavigationCompleted += (_, _) => FocusGame();
            Activated += (_, _) => { LastActive = DateTime.UtcNow; FocusGame(); };
            core.Navigate(_url);
        }
        catch (Exception ex)
        {
            App.Log(ex);
            MessageBox.Show(this, "Das Spiel konnte nicht gestartet werden. Bitte die „Microsoft Edge WebView2 Runtime“ installieren (bei Windows 10/11 meist schon vorhanden).\n\n" + ex.Message,
                "easygames", MessageBoxButton.OK, MessageBoxImage.Warning);
            Close();
        }
    }

    private void FocusGame()
    {
        try { if (IsActive) _web.Focus(); } catch { }
    }

    /// <summary>Aufnahmen (Dateiname easygames-…) ohne Rückfrage nach Videos\easygames; das Spiel bekommt den Pfad zurück.</summary>
    private void OnDownload(object? sender, CoreWebView2DownloadStartingEventArgs e)
    {
        try
        {
            var name = Path.GetFileName(e.ResultFilePath);
            if (name.StartsWith("zotik-", StringComparison.OrdinalIgnoreCase) && (name.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || name.EndsWith(".png", StringComparison.OrdinalIgnoreCase)))
            {   // Zotik-Fotomodus: ohne Rückfrage nach Bilder\Zotik
                var pic = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyPictures), "Zotik");
                Directory.CreateDirectory(pic);
                e.ResultFilePath = Path.Combine(pic, name);
                e.Handled = true;
                return;
            }
            if (!name.StartsWith("easygames-", StringComparison.OrdinalIgnoreCase) || !(name.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase) || name.EndsWith(".webm", StringComparison.OrdinalIgnoreCase) || name.EndsWith(".gif", StringComparison.OrdinalIgnoreCase))) return;
            Directory.CreateDirectory(Host.ClipDir);
            var path = Path.Combine(Host.ClipDir, name);
            e.ResultFilePath = path;
            e.Handled = true;   // kein Download-Fenster
            var op = e.DownloadOperation;
            op.StateChanged += (_, _) =>
            {
                if (op.State != CoreWebView2DownloadState.Completed) return;
                try { _web.CoreWebView2?.PostWebMessageAsJson(System.Text.Json.JsonSerializer.Serialize(new { type = "egRecSaved", path })); } catch { }
            };
        }
        catch (Exception ex) { App.Log(ex); }
    }

    private void OnMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(e.WebMessageAsJson);
            var r = doc.RootElement;
            if (r.ValueKind != System.Text.Json.JsonValueKind.Object || !r.TryGetProperty("type", out var t)) return;
            if (t.GetString() == "egHome")   // Home-Taste: Spiel bleibt offen (minimiert), die Bibliothek kommt nach vorn
            {
                WindowState = WindowState.Minimized;
                if (Application.Current.MainWindow is LauncherWindow lw) lw.BringToFront();
                return;
            }
            if (t.GetString() == "egRec")   // Aufnahme läuft: im Fenstertitel anzeigen (nicht im Video)
            {
                var on = r.TryGetProperty("on", out var ov) && ov.ValueKind == System.Text.Json.JsonValueKind.True;
                Title = (on ? "● REC – " : "") + _game.Title + " – easygames";
                return;
            }
            if (t.GetString() != "egRecOpen") return;
            var p = r.TryGetProperty("path", out var pv) ? pv.GetString() ?? "" : "";
            var full = Path.GetFullPath(p);
            if (!full.StartsWith(Path.GetFullPath(Host.ClipDir), StringComparison.OrdinalIgnoreCase) || !File.Exists(full)) full = Host.ClipDir;   // nur der Aufnahme-Ordner
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("explorer.exe", File.Exists(full) ? "/select,\"" + full + "\"" : "\"" + full + "\"") { UseShellExecute = true });
        }
        catch { }
    }

    protected override void OnClosed(EventArgs e)
    {
        lock (RunningIds) RunningIds.Remove(_game.Id);
        if (!_game.Id.StartsWith("page:", StringComparison.Ordinal)) App.Store.AddPlayTime(_game.Id, DateTime.UtcNow - _started);
        try { _web.Dispose(); } catch { }
        RunningChanged?.Invoke();
        base.OnClosed(e);
        try { Application.Current.MainWindow?.Activate(); } catch { }
    }
}
