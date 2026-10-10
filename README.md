# easygames

Minispiele für Browser und Handy – jedes Spiel in einem eigenen Verzeichnis.
Spieleliste (GitHub Pages): https://ricorewioriginal-collab.github.io/easygames/

| Spiel | Verzeichnis |
|---|---|
| AnMaCha Radio Surfer – 3D-Endless-Runner (Three.js) | [`anmacha-radio-surfer/`](anmacha-radio-surfer/) |
| AnMaCha Flipper – 3D-Flipper mit eigenen Tischen (Three.js) | [`anmacha-flipper/`](anmacha-flipper/) |
| ZOTIK – Die Splitter der Welten (eigenes Repo, eingebettet) | https://ricorewioriginal-collab.github.io/zotik/ |

## Spieleliste, Vollbild und Teilen

Die Seite zeigt alle Spiele als App-Kacheln. Ein Klick öffnet das Spiel in einem App-Fenster, oben gibt es
◀ ▶ (nächstes/voriges Spiel), **⛶ Vollbild** (echtes Browser-Vollbild; wo das nicht geht, z. B. iPhone, öffnet sich das Spiel als ganze Seite)
und **⤴ Teilen**. Dort stehen für jedes Spiel der **direkte Link** und der **iframe-Code** zum Kopieren (bzw. das Teilen-Menü des Handys).

- Direktlink zu einem Spiel: `https://ricorewioriginal-collab.github.io/easygames/anmacha-flipper/`
- Spieleliste mit sofort geöffnetem Spiel: `https://ricorewioriginal-collab.github.io/easygames/#anmacha-flipper`
- Spiel einbetten:

```html
<iframe src="https://ricorewioriginal-collab.github.io/easygames/anmacha-radio-surfer/" title="AnMaCha Radio Surfer"
  allow="fullscreen; autoplay" loading="lazy"
  style="width:100%;max-width:960px;aspect-ratio:16/10;border:0;border-radius:12px"></iframe>
```

- Komplette Bibliothek einbetten (Kacheln zum Einbetten, auch über den Knopf „Alle Spiele einbetten“ erreichbar):

```html
<iframe src="https://ricorewioriginal-collab.github.io/easygames/?embed=1" title="easygames"
  allow="fullscreen; autoplay" loading="lazy"
  style="width:100%;max-width:960px;aspect-ratio:16/10;border:0;border-radius:12px"></iframe>
```

## Neues Spiel hinzufügen

1. Eigenes Verzeichnis anlegen (`mein-spiel/index.html`).
2. In `index.html` im Array `GAMES` einen Eintrag ergänzen (`id`, Titel, Icon, Farbverlauf, `path`, Kurzbeschreibung). Die Kachel erscheint automatisch.

## AnMaCha Radio Surfer: eigene Hindernisse

Bilder (JPG, JPEG oder PNG, quadratisch oder quer; Größe wird automatisch angepasst) als
`anmacha-radio-surfer/hindernisse/01.jpg` bis `20.jpg` (auch `.jpeg` oder `.png`) ablegen. Es werden nur vorhandene Dateien
verwendet; ohne Bilder läuft das Spiel mit Platzhaltern. Jedes Bild erscheint mal niedrig (springen),
mal hoch (ausweichen), mal hängend (rutschen).

Die hochgeladenen Bilder erscheinen außerdem als **Poster an den Rack-Wänden** (nur wenn Bilder vorhanden sind).

### Level, Räume und neue Hindernisse

Jedes Level hat einen eigenen Raum (Licht, Nebel, Akzentfarbe) und ab Level 2 kommen neue Hindernisse dazu:
Kabelsalat (L2), Firewall (L3), Pop-up (L4), Server-Rack + Funkmast (L5), Glasfaser-Laser (L6), Datenwolke (L7),
Computer-Virus (L8), Satellitenschüssel (L9), Paketflut + Mikrofon (L10). Die Form verrät die Aktion:
gelber Rahmen = springen, pinker Rahmen = rutschen, blauer Rahmen = ausweichen.

### Bestenliste (Top 10)

Wer es in die Top 10 schafft, kann nach dem Spiel seinen Namen eingeben (max. 12 Zeichen). Standardmäßig wird die Liste
**im Browser des Spielers** gespeichert (localStorage), sie gilt also pro Gerät.

Für eine **gemeinsame Liste aller Spieler** braucht es einen kleinen Online-Speicher, GitHub Pages allein kann keine Daten speichern.
Im Spiel (`anmacha-radio-surfer/index.html`) die URL bei `LEADERBOARD_URL` eintragen. Erwartet wird:
`GET` liefert `[{"n":"Name","s":123}, …]`, `POST` (Body als Text-JSON `{"n":"Name","s":123}`) speichert einen Eintrag.
Beispiel mit Google Apps Script (Tabelle mit den Spalten Name und Score, als Web-App mit Zugriff „Jeder“ bereitstellen):

```js
function doGet() {
  const rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues().slice(1)
    .map(r => ({ n: String(r[0]), s: +r[1] })).sort((a, b) => b.s - a.s).slice(0, 10);
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([String(d.n).slice(0, 12), Math.floor(+d.s) || 0]);
  return ContentService.createTextOutput('ok');
}
```

Hinweis: Ohne Server-Prüfung können Spieler ihren Score manipulieren – für ein Hobby-Ranking meist ausreichend.

## AnMaCha Flipper: eigene Tische und Logos

Jedes Logo ergibt einen eigenen Tisch (anderes Layout und andere Farben, das Logo erscheint oben auf der Backglass).
Bilder als `anmacha-flipper/logos/01.jpg` bis `13.jpg` ablegen (auch `.jpeg` oder `.png`, ca. 400 × 400 px, unter 200 KB).
Ohne Logos gibt es 3 Platzhalter-Tische. Steuerung: `←`/`A` und `→`/`D` Flipper, `Leertaste` halten und loslassen startet die Kugel,
`P` Pause, `R` Neustart, `M` Ton. Am Handy: LINKS / RECHTS / START halten. Bei 5 verlorenen Kugeln ist das Spiel vorbei; der Bestwert wird im Browser gespeichert.
