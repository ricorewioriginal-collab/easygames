using System.IO;
using System.Threading;
using System.Windows;

namespace EasyGames.Windows;

public sealed class App : Application
{
    /// <summary>Daten der App: Spiele, Spielstände (WebView2), Zustand. Liegt pro Benutzer, ohne Administratorrechte.</summary>
    public static string DataDir { get; } = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "easygames");
    public static Store Store { get; private set; } = null!;
    public static TikTok TikTok { get; private set; } = null!;
    private static Mutex? _single;

    [STAThread]
    public static void Main()
    {
        // nur einmal starten: zweite Instanz holt das offene Fenster nach vorn (gleicher Spiele-Ordner, gleiche WebView2-Daten)
        _single = new Mutex(true, @"Local\easygames-windows", out var first);
        if (!first)
        {
            try { using var ev = EventWaitHandle.OpenExisting(@"Local\easygames-windows-show"); ev.Set(); } catch { }
            return;
        }
        Directory.CreateDirectory(DataDir);
        Store = new Store(DataDir);
        TikTok = new TikTok();
        var app = new App { ShutdownMode = ShutdownMode.OnMainWindowClose };
        app.DispatcherUnhandledException += (_, e) => { Log(e.Exception); e.Handled = true; };
        AppDomain.CurrentDomain.UnhandledException += (_, e) => Log(e.ExceptionObject as Exception);
        TaskScheduler.UnobservedTaskException += (_, e) => { Log(e.Exception); e.SetObserved(); };
        var w = new LauncherWindow();
        app.MainWindow = w;
        var show = new EventWaitHandle(false, EventResetMode.AutoReset, @"Local\easygames-windows-show");
        ThreadPool.RegisterWaitForSingleObject(show, (_, _) => w.Dispatcher.BeginInvoke(w.BringToFront), null, -1, false);
        w.Show();
        app.Run();
        TikTok.Stop();   // Brücke nicht weiterlaufen lassen
        GC.KeepAlive(_single);
    }

    public static void Log(Exception? ex)
    {
        try
        {
            var f = Path.Combine(DataDir, "fehler.log");
            if (File.Exists(f) && new FileInfo(f).Length > 512 * 1024) File.Delete(f);   // klein halten
            File.AppendAllText(f, $"{DateTime.Now:O} {ex}\n");
        }
        catch { }
    }
}
