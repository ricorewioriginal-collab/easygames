using System.Security.Cryptography;
using System.Text.Json.Nodes;
using EasyGames.Windows;

// Prüft den Spiel-Store der easygames-Windows-App: echter Spielestand auf GitHub (sync/manifest.json + sync/catalog.json) und
// nachgebaute Fälle (Umbenennen/Entfernen, Übernahme einer Installation aus der Zeit des eigenen Servers).
//   cd windows/tests/StoreTest && dotnet run
var dir = Path.Combine(Path.GetTempPath(), "easygames-storetest-" + Guid.NewGuid().ToString("N")[..8]);
var fails = 0;
void Check(bool ok, string what) { Console.WriteLine((ok ? "ok   " : "FEHL ") + what); if (!ok) fails++; }
bool FilesOk(Store s, string d, string folder)
{
    var state = JsonNode.Parse(File.ReadAllText(Path.Combine(d, "state.json")))!["files"]!.AsObject();
    var mine = state.Where(k => k.Key.StartsWith(folder + "/")).ToList();
    if (mine.Count == 0) return false;
    foreach (var (p, v) in mine)
    {
        var f = Path.Combine(s.Root, p.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(f)) return false;
        if (Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(f))).ToLowerInvariant() != v!["h"]!.GetValue<string>()) return false;
    }
    return true;
}
const string Bingo = "radio-bingo", Parcours = "anmacha-funkparcours", Groove = "groove-arena";
try
{
    var s = new Store(dir);
    await s.RefreshAsync();
    Check(s.Online, "GitHub erreichbar");
    Check(s.Games.Count >= 80, $"Spieleliste von GitHub geladen ({s.Games.Count} Spiele)");
    Check(s.Games.Any(g => g.Id == "schatzfieber") && s.Games.All(g => g.Url.StartsWith(Store.Public)), "Katalog mit easygames-Adressen");
    Check(s.BaseReady && File.Exists(Path.Combine(s.Root, "cloud", "fire-peer.js")) && File.Exists(Path.Combine(s.Root, "gamepad.js")), "Basis geladen (fire-peer.js, gamepad.js, Vorschaubilder)");
    Check(s.Games.All(g => File.Exists(Path.Combine(s.Root, g.Cover.Replace('/', Path.DirectorySeparatorChar)))), "Vorschaubild jedes Spiels liegt in der Basis");
    Check(!Directory.Exists(Path.Combine(s.Root, "vendor", "mediapipe-pose")), "Große Bibliothek (MediaPipe) nicht in der Basis");
    Check(s.VendorFile("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js") is { } tf && File.Exists(tf), "CDN-Adresse (three.js) wird lokal aus vendor/ beantwortet");
    Check(s.Games.All(g => !s.Status(g).New), "Erster Start: nichts als „neu“ markiert");

    await s.InstallAsync(Bingo);
    var st = s.Status(s.Find(Bingo)!);
    Check(st.Installed && !st.Update && FilesOk(s, dir, Bingo), "RADIO-BINGO installiert, Dateien vollständig (SHA-256)");
    Check(!s.Status(s.Find("schatzfieber")!).Installed, "Andere Spiele bleiben uninstalliert");

    await s.InstallAsync(Parcours);
    var fp = s.Status(s.Find(Parcours)!);
    Check(fp.Installed && fp.Needs.Contains("easyclash") && s.Status(s.Find("easyclash")!).Installed, "Funkparcours installiert, braucht easyclash – automatisch mitgeladen");
    var users = s.Uninstall("easyclash");
    Check(users.Length > 0 && s.Status(s.Find("easyclash")!).Installed, "easyclash bleibt, solange Funkparcours es braucht (" + string.Join(", ", users) + ")");

    await s.InstallAsync(Groove);
    Check(s.Status(s.Find(Groove)!).Needs.Contains("vendor/mediapipe-pose") && File.Exists(Path.Combine(s.Root, "vendor", "mediapipe-pose", "pose.js")), "Groove Arena lädt die große Bibliothek MediaPipe mit");

    // Update erkennen und einspielen
    var stateFile = Path.Combine(dir, "state.json");
    var j = JsonNode.Parse(File.ReadAllText(stateFile))!;
    var key = j["files"]!.AsObject().First(k => k.Key.StartsWith(Bingo + "/")).Key;
    j["files"]![key]!["h"] = new string('0', 64);
    j["firstSeen"]!.AsObject().Remove("schatzfieber");
    File.WriteAllText(stateFile, j.ToJsonString());
    var s2 = new Store(dir) { AutoUpdate = false };
    await s2.RefreshAsync();
    Check(s2.Status(s2.Find(Bingo)!).Update, "Update für RADIO-BINGO erkannt");
    Check(s2.Status(s2.Find("schatzfieber")!).New, "Neues Spiel als „NEU“ erkannt");
    await s2.InstallAsync(Bingo);
    Check(!s2.Status(s2.Find(Bingo)!).Update && FilesOk(s2, dir, Bingo), "Update eingespielt, Dateien geprüft");

    var off = new Store(dir, new Offline());
    await off.RefreshAsync();
    Check(!off.Online && off.Games.Count == s.Games.Count && off.Status(off.Find(Bingo)!).Installed, "Offline: Spieleliste und installierte Spiele bleiben");

    s2.AddPlayTime(Bingo, TimeSpan.FromSeconds(5));
    var gone = s2.Uninstall(Bingo);
    Check(gone.Length == 0 && !Directory.Exists(Path.Combine(s2.Root, Bingo)) && s2.Status(s2.Find(Bingo)!).PlaySeconds == 5, "Deinstalliert, Ordner entfernt, Spielzeit bleibt");
}
catch (Exception ex) { Console.WriteLine("FEHL Ausnahme: " + ex); fails++; }
finally { try { Directory.Delete(dir, true); } catch { } }

// Umbenannte und entfernte Spiele (nachgebauter GitHub-Stand)
var dir2 = Path.Combine(Path.GetTempPath(), "easygames-storetest-ren-" + Guid.NewGuid().ToString("N")[..8]);
try
{
    var fake = new Fake();
    fake.Set(new() { ["base.js"] = "b", ["thumbs/kart.webp"] = "t", ["kart/index.html"] = "alt", ["kart/a.js"] = "x", ["weg/index.html"] = "w", ["bleibt/index.html"] = "1" },
             Game("kart", "AnMaCha Kart Rush", "kart") + "," + Game("weg", "Weg", "weg") + "," + Game("bleibt", "Bleibt", "bleibt"));
    var r1 = new Store(dir2, fake);
    await r1.RefreshAsync();
    await r1.InstallAsync("kart"); await r1.InstallAsync("weg"); await r1.InstallAsync("bleibt");
    r1.AddPlayTime("kart", TimeSpan.FromSeconds(42));
    Check(r1.Status(r1.Find("kart")!).Installed && r1.Find("kart")!.Cover == "thumbs/kart.webp", "Umbenennen: alter Stand installiert, kleines Vorschaubild");
    fake.Set(new() { ["base.js"] = "b", ["anmacha-kart/index.html"] = "neu", ["bleibt/index.html"] = "1" },
             Game("anmacha-kart", "AnMaCha Kart Rush", "anmacha-kart") + "," + Game("bleibt", "Bleibt", "bleibt"));   // neuer Ordner, gleicher Titel
    var r2 = new Store(dir2, fake);
    await r2.RefreshAsync();
    for (var i = 0; i < 100 && (r2.BusyId != null || r2.Queued.Count > 0); i++) await Task.Delay(50);
    var k = r2.Status(r2.Find("anmacha-kart")!);
    Check(k.Installed && File.ReadAllText(Path.Combine(r2.Root, "anmacha-kart", "index.html")) == "neu" && k.PlaySeconds == 42 && !k.New, "Umbenanntes Spiel unter neuem Namen installiert, Spielzeit übernommen");
    Check(!Directory.Exists(Path.Combine(r2.Root, "kart")) && !Directory.Exists(Path.Combine(r2.Root, "weg")) && r2.Status(r2.Find("bleibt")!).Installed, "Alte und entfernte Ordner aufgeräumt, unverändertes Spiel bleibt");
}
catch (Exception ex) { Console.WriteLine("FEHL Ausnahme (Umbenennen): " + ex); fails++; }
finally { try { Directory.Delete(dir2, true); } catch { } }

// Übernahme einer Installation aus der Zeit des eigenen Servers (feed.json im alten Format, Ordner „kart-rush“)
var dir3 = Path.Combine(Path.GetTempPath(), "easygames-storetest-alt-" + Guid.NewGuid().ToString("N")[..8]);
try
{
    Directory.CreateDirectory(Path.Combine(dir3, "library", "kart-rush"));
    File.WriteAllText(Path.Combine(dir3, "library", "kart-rush", "index.html"), "alt");
    File.WriteAllText(Path.Combine(dir3, "library", "games.json"), "{}");
    var oldMan = "{\"version\":1,\"files\":{\"kart-rush/index.html\":[3,\"" + Hex("alt") + "\"],\"games.json\":[2,\"" + Hex("{}") + "\"]}}";
    var oldGames = "{\"games\":[{\"id\":\"kart-rush\",\"title\":\"AnMaCha Kart Rush\",\"kind\":\"bundled\",\"entry\":\"kart-rush/index.html\",\"url\":\"" + Store.Public + "anmacha-kart/\"}]}";
    File.WriteAllText(Path.Combine(dir3, "feed.json"), new JsonObject { ["baseUrl"] = "https://www.ricorewi-radio.de/games-live/", ["manifest"] = oldMan, ["games"] = oldGames }.ToJsonString());
    File.WriteAllText(Path.Combine(dir3, "state.json"), "{\"files\":{\"kart-rush/index.html\":{\"s\":3,\"h\":\"" + Hex("alt") + "\"},\"games.json\":{\"s\":2,\"h\":\"" + Hex("{}") + "\"}},\"installed\":[\"kart-rush\"],\"play\":{\"kart-rush\":{\"seconds\":600}},\"firstSeen\":{\"kart-rush\":\"0001-01-01T00:00:00\"},\"autoUpdate\":true}");
    var fake = new Fake();
    fake.Set(new() { ["gamepad.js"] = "g", ["anmacha-kart/index.html"] = "neu" }, Game("anmacha-kart", "Kart Rush: Weltentour", "anmacha-kart"));
    var a = new Store(dir3, fake);
    Check(a.Games.Any(g => g.Id == "kart-rush"), "Alte Spieleliste (eigener Server) wird noch gelesen");
    await a.RefreshAsync();
    for (var i = 0; i < 100 && (a.BusyId != null || a.Queued.Count > 0); i++) await Task.Delay(50);
    var n = a.Status(a.Find("anmacha-kart")!);
    Check(n.Installed && n.PlaySeconds == 600 && File.ReadAllText(Path.Combine(a.Root, "anmacha-kart", "index.html")) == "neu", "Installiertes Spiel kommt jetzt von GitHub, Spielzeit (10 Min.) übernommen");
    Check(!Directory.Exists(Path.Combine(a.Root, "kart-rush")) && !File.Exists(Path.Combine(a.Root, "games.json")) && File.Exists(Path.Combine(a.Root, "gamepad.js")), "Alte Dateien vom Server aufgeräumt, neue Basis da");
}
catch (Exception ex) { Console.WriteLine("FEHL Ausnahme (Übernahme): " + ex); fails++; }
finally { try { Directory.Delete(dir3, true); } catch { } }

Console.WriteLine(fails == 0 ? "\nalles ok" : $"\n{fails} Fehler");
return fails == 0 ? 0 : 1;

static string Hex(string t) => Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(t))).ToLowerInvariant();
static string Game(string id, string title, string path) =>
    "{\"id\":\"" + id + "\",\"title\":\"" + title + "\",\"path\":\"" + path + "/\",\"img\":\"" + path + "/card.jpg\",\"modes\":{\"pad\":true}}";

sealed class Offline : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct) => throw new HttpRequestException("offline");
}

/// <summary>Nachgebauter GitHub-Stand (raw.githubusercontent.com/…/main/): sync/manifest.json, sync/catalog.json und Dateien.</summary>
sealed class Fake : HttpMessageHandler
{
    private const string Pre = "/ricorewioriginal-collab/easygames/main/";
    private Dictionary<string, byte[]> _files = new(); private string _man = "", _cat = "";
    public void Set(Dictionary<string, string> files, string games)
    {
        _files = files.ToDictionary(f => f.Key, f => System.Text.Encoding.UTF8.GetBytes(f.Value));
        var arr = new JsonArray(_files.Select(f => (JsonNode?)new JsonObject { ["p"] = f.Key, ["s"] = f.Value.Length, ["h"] = Convert.ToHexString(SHA256.HashData(f.Value)).ToLowerInvariant() }).ToArray());
        _man = new JsonObject { ["schema"] = 1, ["version"] = "test", ["entry"] = "index.html", ["catalog"] = "sync/catalog.json", ["files"] = arr }.ToJsonString();
        _cat = "{\"schema\":1,\"games\":[" + games + "]}";
    }
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct)
    {
        var p = Uri.UnescapeDataString(r.RequestUri!.AbsolutePath);
        byte[]? body = null;
        if (p.StartsWith(Pre)) { var f = p[Pre.Length..]; body = f == "sync/manifest.json" ? System.Text.Encoding.UTF8.GetBytes(_man) : f == "sync/catalog.json" ? System.Text.Encoding.UTF8.GetBytes(_cat) : _files.GetValueOrDefault(f); }
        return Task.FromResult(body == null ? new HttpResponseMessage(System.Net.HttpStatusCode.NotFound) : new HttpResponseMessage(System.Net.HttpStatusCode.OK) { Content = new ByteArrayContent(body) });
    }
}
