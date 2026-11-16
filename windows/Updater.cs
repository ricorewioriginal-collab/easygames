using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;

namespace EasyGames.Windows;

/// <summary>
/// Selbst-Update der App über GitHub: Der Workflow .github/workflows/windows.yml legt Installer, portable EXE und
/// windows-latest-easygames.json in das Release „windows“ (feste Download-Adressen, kein eigener Server nötig).
/// Neuere Version/Build-Nummer → Installer laden, Größe und SHA-256 prüfen, still installieren, neu starten.
/// </summary>
public static class Updater
{
    /// <summary>Downloads der Windows-App (Release mit festem Tag „windows“).</summary>
    public const string Downloads = "https://github.com/ricorewioriginal-collab/easygames/releases/download/windows/";
    public const string MetaUrl = Downloads + "windows-latest-easygames.json";
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromMinutes(10) };

    public sealed record Info(string Version, string Url, string Sha256, long Size);

    public static string Version { get; } = Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "1.0.0";

    public static int BuildCode { get; } = ReadBuildCode();

    private static int ReadBuildCode()
    {
        foreach (var a in Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>())
            if (a.Key == "BuildCode" && int.TryParse(a.Value, out var c) && c > 0) return c;
        return 0;
    }

    /// <summary>Neue Version auf dem Server? (null = aktuell, offline oder noch kein Installer veröffentlicht)</summary>
    public static async Task<Info?> CheckAsync() => await ReadAsync(onlyNewer: true);

    private static async Task<Info?> ReadAsync(bool onlyNewer)
    {
        try
        {
            using var doc = JsonDocument.Parse(await Http.GetStringAsync(MetaUrl + "?t=" + DateTimeOffset.UtcNow.ToUnixTimeSeconds()));
            var r = doc.RootElement;
            string S(string k) => r.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : "";
            var file = S("setup_filename");
            if (file.Length == 0 || file.Contains('/') || file.Contains('\\')) return null;
            var ver = S("version");
            var code = r.TryGetProperty("version_code", out var vc) && vc.TryGetInt32(out var c) ? c : 0;
            var newer = System.Version.TryParse(ver, out var sv) && System.Version.TryParse(Version, out var mv) && sv > mv
                        || (ver == Version && BuildCode > 0 && code > BuildCode);
            if (onlyNewer && !newer) return null;
            var size = r.TryGetProperty("setup_size_bytes", out var sz) && sz.TryGetInt64(out var l) ? l : 0;
            var sha = S("setup_sha256");
            return new Info(ver, Downloads + Uri.EscapeDataString(file), sha, size);
        }
        catch { return null; }
    }

    /// <summary>Installer laden und prüfen, dann still starten (die App beendet sich, der Installer startet sie wieder).</summary>
    public static async Task InstallAsync(Info info, IProgress<int> progress)
    {
        try { await DownloadAndRunAsync(info, progress); }
        catch (InvalidDataException)
        {
            // Meist wurde gerade eine neue Version hochgeladen (Prüfsumme gehört zur älteren Angabe): Angaben neu holen und noch einmal laden
            await Task.Delay(3000);
            var fresh = await ReadAsync(onlyNewer: false) ?? throw new InvalidDataException("Download beschädigt – bitte erneut versuchen.");
            await DownloadAndRunAsync(fresh, progress);
        }
    }

    private static async Task DownloadAndRunAsync(Info info, IProgress<int> progress)
    {
        var dir = Path.Combine(Path.GetTempPath(), "easygames-Update");
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, "easygames-Setup-x64.exe");
        var part = path + ".part";
        using (var resp = await Http.GetAsync(info.Url, HttpCompletionOption.ResponseHeadersRead))
        {
            resp.EnsureSuccessStatusCode();
            var total = resp.Content.Headers.ContentLength ?? info.Size;
            await using var input = await resp.Content.ReadAsStreamAsync();
            await using var output = File.Create(part);
            var buf = new byte[81920];
            long done = 0; int n, last = -1;
            while ((n = await input.ReadAsync(buf)) > 0)
            {
                await output.WriteAsync(buf.AsMemory(0, n));
                done += n;
                var pc = total > 0 ? (int)Math.Min(100, done * 100 / total) : 0;
                if (pc != last) { last = pc; progress.Report(pc); }
            }
        }
        string hash;
        await using (var fs = File.OpenRead(part)) hash = Convert.ToHexString(await SHA256.HashDataAsync(fs)).ToLowerInvariant();
        var okSize = info.Size <= 0 || new FileInfo(part).Length == info.Size;
        var okHash = info.Sha256.Length != 64 || hash == info.Sha256.ToLowerInvariant();
        if (!okSize || !okHash || new FileInfo(part).Length < 1_000_000) { File.Delete(part); throw new InvalidDataException("Download beschädigt – bitte erneut versuchen."); }
        if (File.Exists(path)) File.Delete(path);
        File.Move(part, path);
        Process.Start(new ProcessStartInfo(path, "/SILENT /SP- /NORESTART") { UseShellExecute = true });
    }
}
