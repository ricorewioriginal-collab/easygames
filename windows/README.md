# easygames für Windows (Spiele-Client)

Eigener kleiner Spiele-Client wie Steam: Bibliothek mit allen easygames-Spielen, jedes Spiel einzeln installieren,
aktualisieren, spielen und deinstallieren. Installierte Spiele laufen offline, Online- und Mehrspieler-Modi laufen wie
überall über easygames (`cloud/fire-peer.js`, Einladungslinks auf die easygames-Homepage).

| Datei | Inhalt |
| --- | --- |
| `Store.cs` | Spieleliste und Dateien von GitHub (`sync/manifest.json` + `sync/catalog.json`, dieselbe Quelle wie die easygames-Android-App, kein eigener Server), Basis mit Vorschaubildern, große Bibliotheken (`vendor/<name>` ab 2 MB) nur bei Bedarf, Installation je Spiel mit SHA-256-Prüfung, Updates, neue Spiele, Abhängigkeiten zwischen Spielen (`../anderes-spiel/…`), umbenannte/entfernte Spiele, Spielzeit; übernimmt beim ersten Start eine Installation aus der Zeit des eigenen Servers; ohne WPF, testbar unter Linux |
| `LauncherWindow.cs` | Hauptfenster mit der Bibliothek (`launcher/index.html`, steckt in der EXE), Nachrichten Oberfläche ↔ Store, Abgleich beim Start, alle 30 Minuten und beim Zurückkehren ins Fenster |
| `GameWindow.cs` | Eigenes Fenster je Spiel, F11 = Vollbild, „← Alle Spiele“ schließt es, Spielzeit |
| `Host.cs` | Gemeinsame WebView2-Umgebung (starke Grafikkarte, keine Drosselung im Hintergrund), Auslieferung unter `https://appassets.local`, CDN-Adressen der Spiele aus `vendor/` (offline), Service Worker der Spiele gesperrt |
| `Updater.cs` | Selbst-Update über das GitHub-Release `windows` (`windows-latest-easygames.json`, Installer); gebaut vom Workflow `.github/workflows/windows.yml` |
| `recorder/recorder.js` | Aufnahme im Spiel (steckt in der EXE): **F9** = Clip der letzten 30 s (Puffer im Hintergrund, abschaltbar: „Clips im Spiel (F9)“), **F10** = Aufnahme starten/stoppen; Export als MP4 16:9, MP4 9:16 hochkant (unscharfer Hintergrund) oder GIF (letzte 10 s) nach `Videos\easygames` |

**Home-Taste** des Controllers (PlayStation-, Switch- und viele Bluetooth-Controller; bei Xbox fängt Windows die Taste meist für die Xbox Game Bar ab) oder bei jedem Controller **Start 2 Sekunden halten** (Balken unten zeigt den Fortschritt, auch im Vollbild): im Spiel zurück in die Bibliothek (Spiel bleibt minimiert offen), in der Bibliothek zurück ins zuletzt gespielte Spiel.

**Konto, Erfolge, Ranglisten** (Bibliothek links unten): öffnen die Seiten der easygames-Homepage (`konto.html`, `erfolge.html`, `ranglisten.html` …, lokal mit den
Basisdateien) im eigenen Fenster; Anmeldung über die Kopplung mit dem Browser (`cloud/anmacha-cloud.js`), gilt danach in allen Spielen.

**Controller einrichten** (Bibliothek, links unten „🎮 Controller einrichten“): Test-Anzeige je Controller und ein Assistent zum
Neubelegen (Tasten, Steuerkreuz, Sticks). Die Belegung liegt im Zustand des Stores (`PadMaps`) und wird zusammen mit dem
Normalisierungs-Teil von `gamepad.js` (aus dem Spiele-Ordner) in jede Seite eingespielt (`Host.PadScript`). Dadurch liefert
`navigator.getGamepads()` in allen Spielen das Standard-Layout – auch in Spielen mit eigener Controller-Steuerung.
In Spielfenstern läuft `gamepad.js` im Modus „plain“ (`window.EASYGAMES_PAD = 'plain'`): Es wirken nur die Knopf-Belegung des Spiels und
die Belegung der App – kein Leuchtrahmen, keine Belegungs-Übersicht, keine Fenster-/Menü-Übernahme (Info-Seiten wie Konto und Anleitung behalten die Bedienhilfe).

**Bedienung mit dem Controller** (wie an der Konsole): Steuerkreuz/Stick wählt (am Rand des Rasters links in die Seitenleiste,
rechts in die Details), A bestätigt/startet, B zurück, LB/RB Ansicht, Y Optionen des Spiels, X Installieren/Update,
Start = TikTok LIVE, Select = Controller einrichten, rechter Stick scrollt; auch in den Fenstern. Hinweise erscheinen links, sobald ein Controller da ist.

**TikTok LIVE** (Bibliothek, „🎁 TikTok LIVE“, `TikTok.cs`): Name eintragen, „Verbinden“ – Brücke (`tools/tiktok-bridge.mjs`) und
`stream-tiktok.js` stecken in der EXE (`tiktok/`, von `scripts/sync-easygames.php` aus easygames übernommen) und liegen ab dem ersten
Start unter `%LocalAppData%\easygames\tiktok`; online holt die App beim Verbinden die neueste Fassung von easygames. Sie installiert einmalig
TikTok-Live-Connector (braucht Node.js; Knopf „Node.js installieren“ über winget) und startet die Brücke unsichtbar im Hintergrund.
Solange sie läuft, bekommt jedes Spielfenster die TikTok-Steuerung eingespielt (Geschenke-Legende, Ereignisse, virtueller
Controller); „Belegung bearbeiten“ öffnet das gewählte Spiel mit den Einstellungen. Beim Beenden der App stoppt die Brücke.

Daten liegen pro Benutzer unter `%LocalAppData%\easygames` (Spiele in `library\`, Spielstände in `WebView2\`).
Neue Spiele brauchen keinen neuen Build: Sobald sie auf `main` im Sync-Stand sind (`node tools/build-sync.js`, aktualisiert auch
der Workflow „Android offline build“), erscheinen sie in der Bibliothek mit „NEU“; geänderte Dateien werden als Update erkannt.

```
dotnet publish -c Release -r win-x64 -p:EnableWindowsTargeting=true -o publish   # Bau (auch unter Linux)
cd tests/StoreTest && dotnet run                                                  # Store gegen den echten GitHub-Stand
NODE_PATH=$(npm root -g) node tests/games-offline.cjs [spiel-id …]                # alle Spiele wie in der App offline (Dateien, vendor/, ohne Service Worker)
NODE_PATH=$(npm root -g) node tests/launcher-ui.cjs [Screenshot-Ordner]           # Bibliotheks-Oberfläche (Playwright)
NODE_PATH=$(npm root -g) node tests/launcher-pad.cjs [easygames-Ordner] [Screenshot-Ordner]   # Controller einrichten
NODE_PATH=$(npm root -g) node tests/game-pad.cjs [Spiele-Ordner] [Spiel] [Screenshot-Ordner]   # Controller im Spielfenster (plain)
NODE_PATH=$(npm root -g) node tests/launcher-tiktok.cjs [Screenshot-Ordner]       # TikTok LIVE
NODE_PATH=$(npm root -g) node tests/launcher-controller.cjs [Screenshot-Ordner]   # Bedienung mit dem Controller
```

Gebaut und veröffentlicht wird sie kostenlos auf GitHub (Workflow `.github/workflows/windows.yml`, bei Änderungen an `windows/`):
Release `windows` mit `easygames-Setup-x64.exe`, `easygames-Portable-x64.exe` und `windows-latest-easygames.json` (Selbst-Update).
