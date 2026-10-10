# easygames

Minispiele für Browser und Handy – jedes Spiel in einem eigenen Verzeichnis.
Spieleliste (GitHub Pages): https://ricorewioriginal-collab.github.io/easygames/

| Spiel | Verzeichnis |
|---|---|
| AnMaCha Radio Surfer – 3D-Endless-Runner (Three.js) | [`anmacha-radio-surfer/`](anmacha-radio-surfer/) |
| AnMaCha Pinball – 3D-Flipper mit 13 Tischen (Three.js) | [`anmacha-flipper/`](anmacha-flipper/) (Ordnername bleibt) |
| AnMaCha Beat Surfer – 3D-Rhythmusspiel (Three.js, Musik wird im Browser erzeugt) | [`anmacha-beat-surfer/`](anmacha-beat-surfer/) |
| AnMaCha Memory – modernes Memory mit den Sender-Logos (reines HTML/CSS, ohne Bibliothek) | [`anmacha-memory/`](anmacha-memory/) |
| AnMaCha Quest RPG – 3D-Rollenspiel in Godot 4 (Web-Export) | [`anmacha-quest-rpg/`](anmacha-quest-rpg/) |
| AnMaCha Snake 3D – Snake mit Sender-Logos als Futter (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-snake/`](anmacha-snake/) |
| AnMaCha Tower Defense – 3D-Tower-Defense mit Sender-Logo-Türmen (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-tower-defense/`](anmacha-tower-defense/) |
| Machst du mich an? – Das Quiz! – TV-Quizshow im 3D-Studio (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-quiz/`](anmacha-quiz/) |
| AnMaCha Koffer DEALER – Dealer-Show mit 13 Flightcases (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-koffer-dealer/`](anmacha-koffer-dealer/) |
| AnMaCha Kart Rush – 3D-Arcade-Kartrennen, Splitscreen mit Handys als Lenkrad (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-kart/`](anmacha-kart/) |
| AnMaCha Gold Reels – moderner Video-Slot mit Spielgeld, 5 Walzen, 20 Linien, Freispielen (reines JavaScript/Canvas) | [`anmacha-gold-reels/`](anmacha-gold-reels/) |
| AnMaCha Markthalle 24 – Supermarkt-Simulator (Draufsicht, Handy & PC), Preise, Personal, eigener Radiosender | [`anmacha-markthalle/`](anmacha-markthalle/) |
| AnMaCha Gesucht & Gefunden – Ratestudio mit 4 Spielarten (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-gesucht/`](anmacha-gesucht/) |
| AnMaCha Showdown – Mikro-Duell mit 8 Mini-Spielen (Three.js, Sounds werden im Browser erzeugt) | [`anmacha-showdown/`](anmacha-showdown/) |
| Bunte Insel – Kinderspiel mit offener Welt: laufen, 10 Fahrzeuge inkl. Hubschrauber, Boot & Zug-Simulation, Piratenschiff, Spielzeugladen, Bauen wie bei den Sims, Spaß-Aktionen (Three.js, Touch mit festem Joystick & Tastatur, Sounds werden im Browser erzeugt) | [`bunte-insel/`](bunte-insel/) |
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

## AnMaCha Pinball: 13 Tische, Kampagne und freies Spiel

Es gibt **13 Tische**; Tisch *n* bekommt das Logo `anmacha-flipper/logos/NN.png` (auch `.jpg` / `.jpeg`, `01` … `13`, ca. 400 × 400 px, unter 200 KB).
Fehlt ein Logo, zeigt der Tisch einen Platzhalter. Jeder Tisch hat ein eigenes Layout, eigene Farben und Spielfeld-Kunst.

- **Kampagne:** startet bei Tisch 1. Pro Tisch gibt es ein Punkteziel (1500 + 700 × Tischnummer); wer es erreicht, kommt zum nächsten Tisch. Alle 3 Tische gibt es eine Extra-Kugel. Wer Tisch 13 schafft, hat gewonnen.
- **Freies Spiel:** beliebigen Tisch wählen, 5 Kugeln, so viele Punkte wie möglich.
- **Steigende Schwierigkeit:** pro Tisch stärkere Schwerkraft, kürzere Flipper und ab Tisch 5 pendelnde „Störsender“ vor den Flippern (bis zu 3).
- Steuerung: `←`/`A`, `→`/`D` Flipper, `Leertaste` halten und loslassen startet die Kugel, `P` Pause, `R` Neustart, `M` Ton. Am Handy: LINKS / RECHTS / START halten. Bei 0 Kugeln ist das Spiel vorbei; Bestwert und Kampagnen-Fortschritt werden im Browser gespeichert.

## Haupt-Logo

Ein normales Logo (PNG mit Transparenz am besten, auch JPG, SVG oder WebP) als **`logo.png`** (bzw. `logo.jpg` / `logo.svg` …) ablegen:

- im **Hauptordner** (neben `index.html`): erscheint auf der Startseite und im Hauptmenü aller Spiele
- oder in einem **Spielordner** (z. B. `anmacha-flipper/logo.png`): gilt nur für dieses Spiel und hat Vorrang

Ein Logo im **Hauptordner** ersetzt im Hauptmenü der Spiele das Wort „AnMaCha“ (der Zusatz „FLIPPER“ bzw. „RADIO SURFER“ bleibt darunter).
Ein Logo im **Spielordner** gilt als kompletter Titel (z. B. „AnMaCha Radio Surfer“) und ersetzt den ganzen Text-Titel; es wird größer dargestellt und am Rand weich ausgeblendet.
Tipp: Logos auf ca. 800 px Breite verkleinern (unter ca. 500 KB), dann lädt das Menü schnell.
Auf dem dunklen Hintergrund passen helle oder farbige Logos am besten. Ohne Logo-Datei bleibt der Text-Titel.

## AnMaCha Beat Surfer: Rhythmusspiel mit 13 Songs

Noten laufen in 4 Spuren auf dich zu – triff sie im Takt der Musik. Die Musik wird komplett im Browser erzeugt (keine Audio-Dateien),
die Noten ergeben sich aus der Musik (Bass-Drum, Snare, Melodie).

- **Steuerung:** `D` `F` `J` `K` oder die Pfeiltasten (`←` `↓` `↑` `→`), `P` Pause, `R` Neustart, `M` Ton. Am Handy: 4 große Tasten unten.
- **Wertung:** Perfekt / Gut / Verpasst, Combo-Multiplikator bis x4, „Welle“ (Lebensanzeige) – wird sie leer, ist der Song verloren. Am Ende gibt es 1–3 Sterne nach Genauigkeit.
- **Genre pro Sender:** jeder Sender hat einen eigenen Song im passenden Stil (RapRadio 24 Rap, SchlagerPop 24 Schlager, ChristmasRadio 24 Weihnachten, Special-Radio Entspannung, RadioFloh! Kindermusik, Zocker-FM Chiptune usw.). Namen, Genres und Tempo stehen im Array `STATIONS` in `anmacha-beat-surfer/index.html`.
- **Kampagne:** 13 Songs von leicht nach schwer (Entspannung → … → Club/EDM, 74 → 148 BPM); Fortschritt wird gespeichert. **Freies Spiel:** beliebigen Song wählen.
- **Logos:** Song *n* nutzt `anmacha-beat-surfer/logos/NN.png|jpg|jpeg` (`01` … `13`); es erscheint als große Tafel hinter der Bahn. Das Titel-Logo (`logo.png`) im Spielordner (oder im Hauptordner) ersetzt den Text-Titel im Menü.
- **Audio-Versatz:** im Pause-Menü einstellbar (z. B. für Bluetooth-Kopfhörer).

## AnMaCha Memory: Logo-Memory mit Mischer und Duell

Gesucht werden Logo-Paare – die 13 Sender-Logos plus AnMaChaCast, SenderWelt und RicoReWi Radioportal (16 Paare). Reines HTML/CSS ohne Bibliothek, sehr ressourcenschonend, für PC und Handy.

- **Kampagne:** 10 Level (4 → 16 Paare). Ab Level 4 gibt es den **Mischer** (verdeckte Karten tauschen nach Fehlzügen die Plätze), ab Level 6 zusätzlich ein **Zeitlimit**. 1–3 Sterne nach Zügen, Fortschritt wird gespeichert.
- **Freies Spiel:** Paare (4–16), Mischer-Stufe und **Duell** für 2 Spieler an einem Gerät frei wählbar.
- **Wertung:** Combo-Multiplikator (bis x5), Zeitbonus, 3 Blicke auf alle Karten (kosten Punkte). Bestwerte lokal pro Gerät.
- **Logos:** `anmacha-memory/logos/01.png|jpg|jpeg|webp`, `02` … lückenlos nummeriert, beliebig viele – jedes weitere Logo erzeugt automatisch ein weiteres Paar. `01`–`13` sind die Sender, `14` AnMaChaCast, `15` SenderWelt, `16` RicoReWi Radioportal. Die Namen stehen im Array `NAMES` in `index.html`.
- **Titel-Logo:** `anmacha-memory/logo.png` ersetzt den Text-Titel im Menü.
- **Steuerung:** Tippen/Klicken, `P` Pause, `M` Ton.

## AnMaCha Snake 3D

- **Spiel:** Snake auf einem Neon-Brett in 3D. Gefressen werden die Sender-Logos (`logos/01..13`, `.png|.jpg|.jpeg`); alle 5 Logos gibt es ein neues Level mit eigener Farbwelt (13 Sender), schnellerem Tempo und ab Level 3 Hindernissen.
- **Modi:** Klassisch (Wand = Game Over) und Portal (Wände führen auf die Gegenseite).
- **Kameras:** Schräg 3D (feste Richtungen) und Verfolger (links/rechts relativ zur Schlange).
- **Power-ups:** Turbo, Chill (langsamer), Geist (durch Wände/Körper), Punkte ×3, Kürzer. Kombo bis ×6 bei schnell aufeinanderfolgenden Logos.
- **Steuerung:** Pfeile/WASD (Verfolger: links/rechts), Wischen oder Tippen am Handy, `P` Pause, `M` Ton, `C` Kamera.
- **Eigenes Logo:** `anmacha-snake/logo.png` ersetzt den Titel. Bestenliste (Top 10) lokal im Browser.

## AnMaCha Tower Defense

- **Spiel:** Das Große Rauschen marschiert über den Weg zu deinem Senderturm. Stelle Türme neben den Weg, baue sie bis Stufe 3 aus oder verkaufe sie. 25 Wellen mit Rauschen, Zippern, Brummern, Knistern und Boss-Wellen (10, 20, 25).
- **Türme (Sender-Logos):** YourTime-FM Allrounder, RapRadio Bass-Bombe (Fläche), SchlagerPop Frost-Pop (verlangsamt), ChartRadio Hit-Blitz (Kette), ClubRadio Club-Laser (durchschlägt), RockRadio Sniper (Reichweite), AnMaCha 24 Werbe-Einnahmen (Geld pro Welle), RicoReWi Verstärker (Schaden für Nachbartürme). Ziel pro Turm: Erster / Stärkster / Nächster.
- **Karten & Schwierigkeit:** Funkhafen, Frequenz-Spirale, Zickzack-Studio; Leicht / Normal / Schwer. Welle früh starten bringt Bonus-Geld.
- **Steuerung:** Turm unten wählen, Feld klicken (am Handy: erstes Tippen = Vorschau, zweites = bauen), Turm antippen = Ausbau/Ziel/Verkauf. Tasten: `1–8` Turm, `Leertaste` Welle, `U` Ausbau, `S` Verkauf, `F` Tempo ×2, `P` Pause, `M` Ton, `Esc` abwählen. Im Hochformat wird das Spielfeld automatisch gedreht.
- **Logos:** `anmacha-tower-defense/logos/01..13` (`.png|.jpg|.jpeg`), `anmacha-tower-defense/logo.png` ersetzt den Titel. Bestenliste (Top 10) lokal im Browser.

## AnMaCha Showdown – Das Mikro-Duell

- **Spiel:** Duell über 7 Mini-Spiele, das erste zählt 1 Punkt, das letzte 7. Wer zuerst 15 Punkte hat, gewinnt; bei Gleichstand entscheidet ein Stechen (Tipp-Fieber, 6 s). Gegner: der Moderator (Stärke Anfänger / Normal / Profi, mit Bilanz) oder ein zweiter Spieler am selben Gerät (abwechselnd).
- **Mini-Spiele (7 von 8 zufällig):** Reaktionstest, Schätzduell (näher dran gewinnt), Logo-Gedächtnis (Simon-Folge mit Sender-Logos), Tipp-Fieber, Zielscheibe, Farb-Verwirrung, Kopfrechnen, Sortier-Blitz – alle per Touch, Maus oder Tastatur.
- **Studio:** 3D-Showdown-Bühne mit Avataren (Logo-Shirts), Publikum, Werbeträgern mit allen Sender-Logos (`anmacha-showdown/logos/01..13`), Punkte-Leiste mit 15 Feldern, Jubel/Buzzer/Musik per WebAudio, optional Moderator-Stimme. Eigenes Titel-Logo: `anmacha-showdown/logo.png`.

## AnMaCha Koffer DEALER

- **Spiel:** 13 Flightcases, jeder trägt eines der 13 Sender-Logos und versteckt einen Betrag von 1 € bis 1.000.000 €. Wähle deinen eigenen Koffer, öffne reihum die anderen – nach jeder Runde macht der **Dealer** per „Funkspruch“ (ON AIR) ein Angebot: **Deal** (Geld nehmen, dein Koffer bleibt bis zum Finale zu) oder **Weiter**. Im Solo-Spiel gibt es am Ende die Tauschoption.
- **Eigene Zutat – Handeln:** Pro Angebot einmal +10 / +25 / +50 % fordern; der Dealer geht darauf ein oder zieht das Angebot zurück. Dealer-Typ: Freundlich, Normal, Gnadenlos.
- **Spielformen:** Solo, Reihum (2–4 Spieler, jeder mit eigenem Koffer, jeder entscheidet selbst über seinen Deal), Duell; Handys koppeln per Code/QR (PeerJS) – dort wählt jeder seine Koffer und entscheidet über Deal/Handeln.
- **Studio:** 3D-Funkhaus mit Koffer-Bühne, Dealer-Kanzel mit „ON AIR“, Frequenzskala als Wertetafel (rote Nadel zeigt das Angebot), LED-Wand, Publikum, Werbeträgern mit allen Logos (`anmacha-koffer-dealer/logos/01..13`) und Avataren mit Logo-Shirt. Töne (Latch, Funkgeräusch, Kasse, Jubel, Aww, Nachdenk-Musik) entstehen im Browser; optional Moderator-Stimme.
- **Steuerung:** Koffer unten antippen oder im Studio anklicken; Tasten `D` Deal, `W` Weiter, `T` Tauschen, `B` Behalten, `P` Pause, `M` Ton. Eigenes Titel-Logo: `anmacha-koffer-dealer/logo.png`.

## Machst du mich an? – Das Quiz!

- **Modi:** *Leiter* – 15 Fragen von leicht bis schwer, Gewinnleiter von 50 € bis 1.000.000 € mit Sicherheitsstufen (500 € / 16.000 €), „Ist das Ihre endgültige Antwort?“ und Aussteigen. *Quiznight* – Kategorie wählen (10 Kategorien), je 10 Fragen mit Zeitlimit und Zeitbonus; Länge der Show 1 / 3 / 5 / 10 Kategorien.
- **Joker (Leiter):** 50:50, Publikum, Telefon, Fragentausch.
- **Zeit-Modus:** Im Menü „Zeit pro Frage“ → 60 Sekunden pro Frage (Leiter und Quiznight); bei Zeitablauf zählt die Frage als falsch. Standard: Leiter ohne Zeit, Quiznight 20–25 s.
- **Ton:** Buzzer (heller Gong bei richtig, tiefer Summer bei falsch), Jubel mit Applaus, Johlen und Pfiff, Aww-Enttäuschung, Nachdenk-Melodie (Moll-Arpeggio, die mit der Fragenstufe spannender wird) – alles per WebAudio erzeugt.
- **Spielformen:** Solo, Reihum (2–4 Spieler an einem Gerät), Duell 1 gegen 1, Teams (Rot gegen Blau mit mehreren Mitspielern pro Team).
- **Handys koppeln:** „📱 Handys koppeln“ zeigt Code + QR-Code, Mitspieler öffnen den Link, geben Namen und Sender-Logo ein und antworten am eigenen Handy (PeerJS, bis 4 Spieler, Host-Gerät bleibt der Fernseher). Optional `?ph=host:port` für einen eigenen PeerServer.
- **Studio:** 3D-TV-Studio mit LED-Wand, Scheinwerfern, Publikum, Werbeträgern mit allen Sender-Logos (`anmacha-quiz/logos/01..13`) und Avataren mit Sender-Logo auf dem Shirt; Sounds, Musik und Applaus werden im Browser erzeugt, optional Moderator-Stimme (Sprachausgabe des Browsers).
- **Fragen:** `anmacha-quiz/questions.js` – ca. 600 Fragen in 10 Kategorien (Musik, TV & Film, Social Media, Wissen & Technik, Sport, Politik, Geschichte, Geografie, Natur & Tiere, Essen & Genuss), je Kategorie 5 Schwierigkeitsstufen; neue Fragen einfach eintragen. Eigenes Titel-Logo: `anmacha-quiz/logo.png`.

## AnMaCha Quest RPG: Das Große Rauschen (Godot 4, Web-Export)

Eigenständiges Rollenspiel im 16-Bit-Stil – eigene Helden, Welten und Monster, alle Grafiken werden beim Start per Code erzeugt (keine Bilddateien).

- **Helden:** Andrew (Held), Marco (Magier), Teresa (Heilerin, ab Bass-Keller-Sieg), Rico (Schütze, ab Glitzerwiese-Sieg), Andy (Wächter, ab Frosthöhlen-Sieg).
- **Spielablauf:** Funkhafen (Stadt mit Händlerin, Heilbrunnen) → Oberwelt „Frequenzia“ → 4 Reiche (Bass-Keller/Rap, Glitzerwiese/Schlager, Frosthöhle/Weihnachten, Vulkanbühne/Rock) → Rauschen-Turm. Jedes Reich hat Zufallskämpfe, Truhen, einen Schlüssel für das Tor zum Bossraum und einen Boss.
- **Kampf:** rundenbasiert in Ich-Ansicht; Angriff, Fertigkeit (SP), **Spezial (IP-Leiste füllt sich, wenn Helden Schaden nehmen)**, Item, Wache, Flucht. Ausrüstung beim Händler, Stufenaufstieg, Speichern (Brunnen/Menü).
- **Anleitung & Wegweiser:** [`ANLEITUNG.md`](anmacha-quest-rpg/ANLEITUNG.md) bzw. im Browser `anmacha-quest-rpg/anleitung.html` (Steuerung, Kampf, Helden, Ablauf, Wegweiser pro Reich, Boss-Tipps, Handlungen).
- **Ansicht:** komplett in 3D mit echten Low-Poly-Modellen (CC0): animierte Helden/Monster, Häuser, Bäume, Berge; Kampf als 3D-Szene mit Kreuzmenü. Touch-Steuerkreuz als gleitender Stick.
- **Steuerung:** Pfeiltasten/WASD, `Leertaste`/`Enter` bestätigen, `Esc`/`M` Menü, am Handy Touch-Steuerkreuz und Tippen.
- **Quellcode:** `anmacha-quest-rpg/godot/` ist ein normales Godot-4.3-Projekt (`main.gd` Spiel, `gfx.gd` Pixel-Grafik, `data.gd` Karten/Gegner/Werte). Neu exportieren: `godot --headless --path anmacha-quest-rpg/godot --export-release Web ../index.html` (Vorlage „Web“, ohne Threads, Renderer Compatibility). Selbsttest (Karten + Balance): `godot --headless --path anmacha-quest-rpg/godot -- --autotest`.
- **Monster:** 30 animierte 3D-Gegner (je 6 pro Reich, passend zu Rap, Schlager, Weihnachten, Rock und Rausch-Turm) plus 5 große Bosse. Gegner laufen **sichtbar auf der Karte** herum, jagen dich bei Nähe und lösen bei Berührung den Kampf aus (zusätzlich seltene Zufallskämpfe). Flüchten ist möglich, besiegte Gegner verschwinden bis zum nächsten Betreten.
- Credits (alle CC0): 3D-Modelle von Quaternius (RPG Characters, Cute Animated Monsters, Animated Monster Pack, Ultimate Textured Building Pack) und Kenney (Fantasy Town Kit, Mini Dungeon, Mini Forest, Graveyard Kit, Tiny Dungeon); Schrift Pixelify Sans (SIL OFL). Details: `anmacha-quest-rpg/godot/assets/LIZENZEN.md`.

## AnMaCha Gesucht & Gefunden

- **Spiel:** Ratestudio mit vier Spielarten, 1–4 Spieler an einem Gerät. Hinter dem Vorhang wartet die Geheimnis-Karte; wer richtig liegt, öffnet ihn (Konfetti, LED-Wand, Jubel).
- **Hinweis-Raten:** 5 Hinweise nacheinander; wer früher richtig antwortet (Auswahl aus 4), bekommt mehr Punkte (5…1). Falsch = raus für die Runde.
- **Fragen-Raten:** Ja/Nein-Fragen aus einem Menü (bis 15), Lösung aus der Liste raten; Punkte = 15 − Fragen, falscher Tipp −3.
- **Gesichter-Radar:** 20 selbst gezeichnete Gesichter mit Merkmalen; allein gegen den Moderator (3 Stärken) – wer das geheime Gesicht des anderen zuerst findet, gewinnt.
- **Stirnband-Party:** Gerät an die Stirn, die Gruppe erklärt das Wort – 60 s, ✅ Richtig / ⏭ Weiter, Runden pro Spieler/Team.
- **Daten:** 174 Begriffe in 6 Themen (Tiere, Berufe, Länder, Persönlichkeiten, Gegenstände, Radio & Musik) in `anmacha-gesucht/data.js`. Sender-Logos: `anmacha-gesucht/logos/01..13`, Titel-Logo `logo.png`. Bestenliste (Top 10 je Spielart) lokal im Browser. Tasten: `M` Ton, `←/→` im Stirnband-Modus.

## AnMaCha Kart Rush

- **Spiel:** Eigenes Arcade-Kartrennen (keine fremden Figuren/Strecken/Namen): 8 Karts, 2/3/5 Runden. Modi: Einzelrennen, Cup (3 Strecken, Punkte 15–1; Sonnen-Cup und Spuk-Cup), Zeitfahren (allein, Bestrunde wird lokal gespeichert).
- **5 Strecken, 5 Welten:** Funkturm-Wiese (Bäume, gestreifte Türme), Sonnen-Strand (Meer, Palmen, Strandhütten, Segelboote), Geistergruft (Grabsteine, tote Bäume, Krypten, Geister, Fledermäuse, Nebel, Vollmond), Fantasia-Land (Riesenpilze, Regenbogen-Tore, schwebende Inseln, Lollis, Kristalle, Schloss), Neon-City (Nacht, Neonschilder).
- **Karts zur Wahl (6 Bauarten mit Werten):** Allrounder, Flitzer (Tempo), Buggy (Gelände & Kurven), Cruiser (schwer), Dragster (Beschleunigung), Wolkenflitzer (wendig, schneller Drift-Turbo).
- **Figuren:** 12 selbst gebaute 3D-Fahrer – Mensch (Mia), Tiere (Fuchs, Bär, Katze, Frosch, Pinguin, Panda, Hase) und Fantasiewesen (Drache, Einhorn, Roboter, Alien). Sender-Logos sitzen auf Heckplatte und Seiten der Karts.
- **Items (11):** Bass-Boost und Turbo-Trio, Bananenschale und Bananen-Trio (hinter dem Kart mitgeführt, einzeln fallen lassen), Felsbrocken und Stein-Trio (kreisen ums Kart, prallen von Wänden ab), Störsignal-Falle, zielsuchende Jingle-Rakete, Frequenz-Schild (blockt Treffer), Funk-Blitz (wirft alle vor dir aus der Bahn, nur für hintere Plätze) und Nebelbombe (Sichtblock für alle vor dir). Items hängen vom Platz ab; dazu Funken, Sterne, Explosionen und Blitze.
- **Fahren:** Gas automatisch, lenken, bremsen, **Driften** mit Mini-/Super-/Ultra-Turbo, Boost-Felder, **Lenkhilfe** (Aus/Leicht/Stark).
- **Steuerung:** *Handy:* links Daumen ziehen = analog lenken, rechts Drift / Item / Bremse, optional Kippen. *PC:* ←/→ lenken, ↓ bremsen, Shift driften, Leertaste Item, `M` Ton, `Esc` Pause. *Gamepad* (PC oder am Handy gekoppelt): Stick/Steuerkreuz lenken, A/X/RB/RT driften, Y/LB Item, B/LT bremsen.
- **Mehrspieler (2–4):** Der große Bildschirm zeigt das Rennen im Splitscreen, die Handys koppeln per Code/QR (PeerJS) und sind Lenkrad (inkl. Figur- und Kartwahl). Am Host zusätzlich Tastatur- und Gamepad-Spieler. Bots füllen auf 8 Karts auf (3 Stärken, Gummiband).
- **Technik:** Simulation (`sim.js`) und Strecken (`track.js`) ohne Grafik-Abhängigkeit, Sounds per WebAudio, Logos `anmacha-kart/logos/01..13`, Titel-Logo `anmacha-kart/logo.png`.

## Wobbel – Das Schiebe-Puzzle (RicoReWi)

- **Spiel:** Eigenständiges 3D-Puzzle im Sokoban-Prinzip (ohne AnMaCha-Branding): Wobbel schiebt Kisten auf Zielfelder. Fünf Welten mit neuen Elementen – Wasser (Brücken bauen), Farben und Kleckse, Eis, Schlüssel und Türen.
- **Level:** handentworfen und von einem Löser (Breitensuche) auf Lösbarkeit geprüft; 55 Level in 5 Welten, nur bestätigte Level kommen ins Spiel. Sterne nach Zügen im Vergleich zur kürzesten Lösung.
- **Steuerung:** Pfeile/WASD, Wischen oder Tippen auf ein Feld (läuft hin), Rückgängig, Neustart, Kamera drehen; Fortschritt wird gespeichert.
- Ausführliche Doku, Projektstruktur und Tests: [`wobbel/README.md`](wobbel/README.md).
## AnMaCha Gold Reels

- **Spiel:** Video-Slot mit 5 Walzen × 3 Reihen und 20 Gewinnlinien. **Nur Spielgeld** (Start 10.000, Neustart bei leerem Konto), kein echtes Glücksspiel.
- **Symbole:** Selbst gezeichnete Casino-Klassiker (Sieben, Diamant, Krone, Glocke, Kirschen, Kleeblatt, Hufeisen) plus zwei Sender-Logos, Wild und Bonus-Stern. Keine fremden Marken oder Namen.
- **Features:** Wild ersetzt alle außer Bonus, 3+ Bonus-Sterne geben 10 Freispiele mit doppeltem Gewinn (Retrigger +5), Big/Mega/Super-Mega-Win-Anzeige, Auto-Spin, Turbo, 7 Einsatzstufen, Gewinntabelle, Sounds per WebAudio.
- **Technik:** Logik in `slot.js` (ohne Grafik, Auszahlungsquote ca. 95 % simuliert), Darstellung per Canvas in `index.html`, Guthaben lokal gespeichert.

## AnMaCha Markthalle 24

- **Spiel:** Supermarkt-Simulator in 3D (Ego-Ansicht mit Three.js, Vogelperspektive zum Bauen; ohne WebGL gibt es eine 2D-Notansicht). Du bestellst Ware im Großhandel (Lieferung am nächsten Morgen), räumst Kartons von der Rampe in Regale, kassierst und baust den Laden aus. Alle Marken, Waren und Namen sind selbst erfunden.
- **Umfang:** 55 Waren in 12 Warengruppen (Lizenzen), Regale, Kühlung, Tiefkühltruhen, Quengelzone, Kassen & Selbstbedienungskassen, freies Layout mit Anbau (4 Ladengrößen), Personal (Kasse, Regalauffüller, Reinigung, Wachmann, Regalbot), 10 Ausbauten, Kredit, Tagesziele, 20 Stufen, Haltbarkeit & Reduzieren, Diebe, Pfützen, Stromausfälle, Hygiene-Kontrolle.
- **Besonderheiten:** eigener Radiosender „Markt-Funk 24“ (Musikstil lockt Kundentypen, Werbespots machen Waren zum Tageshit), Preis-Duell mit dem Konkurrenten „Billigo“ (Preisradar), Kunden mit Rezept-Einkäufen (Bonus bei vollständigem Set), Stammkunden mit Namen und Treue, Laufweg-Heatmap, Wetter-Vorhersage, Wunschzettel der Kunden.
- **Marktradio:** Ein 3D-Radio im Laden spielt den Live-Stream von laut.fm (Standard: `stream.laut.fm/ricorewi`). Die Lautstärke hängt von der Entfernung zum Radio ab (E am Radio = an/aus). Weitere laut.fm-Sender lassen sich im Radio-Fenster per Sendernamen hinzufügen (wird über die laut.fm-Schnittstelle geprüft), mit Anzeige des laufenden Titels. Der Stream läuft nur, solange ein Radio im Laden steht und der Tab sichtbar ist.
- **Waren einzeln einräumen:** Kartons werden Stück für Stück ins Regal geräumt (die Stücke fliegen sichtbar ins Regal), von selbst am markierten Regal oder mit E (halten = schneller). Leere Kartons verschwinden.
- **Bestell-PC:** Ein 3D-PC im Laden (E). Großhandel mit Suche und Warengruppen, **Warenkorb**, **Lagerübersicht** (Regal, Rampe, unterwegs), Lieferungen und **Nachbestell-Regeln** (Ausbau „Nachbestell-Regeln“: Grenze und Kartonzahl je Ware, der PC bestellt jeden Morgen nach). Bestellen geht nur am PC – oder mit der Bestell-App (Ausbau).
- **Sortiment:** 98 Waren in 18 Warengruppen, neu u. a. Backwaren (Brezel, Donut, Torte …), Konserven & Gewürze, Bio & Regional, Presse & Hefte, Elektro & Technik, Spielzeug & Hobby, Garten & Heimwerken.
- **Regale:** Mini-Regal, Großes Regal (3 Felder), Wandregal, Palettenaufsteller (2×2), Kühltheke, Tiefkühlinsel, Backwaren-Theke, Zeitschriftenständer. Die **Bäckerin** backt tagsüber in der Backstation nach.
- **Kassieren:** Artikel scannen und danach bei Barzahlung das **Rückgeld** selbst herausgeben (zu viel = Verlust, zu wenig = Beschwerde, passend = Trinkgeld). Das Kassensystem (Ausbau) rechnet automatisch. Karten- und Selbstbedienungskassen zahlen ohne Rückgeld.
- **Mein Laden:** Eigener Ladenname, Slogan und Schildfarbe (am Eingang und im Laden), 6 Ausbaustufen (Kiosk bis Hypermarkt), Boden (Fliesen, Parkett, Marmor), Wandfarben, Automatik-Schiebetür und Parkplatz.
- **Jahreszeiten & Feiertage:** Alle 28 Tage wechselt die Jahreszeit (Wetter, Nachfrage, Landschaft, Schnee/Regen). Dazu Osterwoche, Grillfest, Halloween und Weihnachtszeit mit besonderer Nachfrage und 3D-Deko im Laden (Weihnachtsbaum, Kürbisse, Eier, Grill). **Tagesangebote** (🔥 −20 %, max. 2) locken Kunden an, **Mitarbeiter-Schulung** (5 Stufen) macht das Personal schneller. Familien schieben **Einkaufswagen** (teils mit Kind), auf der Straße fahren Autos und laufen Passanten. **Grafik-Stufen** (Sparsam/Normal/Schön) schonen Akku und Rechner, am Handy startet Sparsam.
- **Einfaches Einräumen:** Ein Wegweiser oben nennt immer den nächsten Schritt und markiert das Ziel im Laden (gelber Pfeil). Wer an der Warenannahme steht, holt automatisch den passenden Karton, am markierten Regal räumt er sich selbst ein (Einräum-Hilfe, im Menü abschaltbar). Auch Klick/Tippen auf Rampe, Regal oder Kasse löst die Aktion aus; Reste gehen zurück an die Warenannahme. Weiche Bewegung mit Beschleunigung, Shift = rennen, Mausziehen oder Daumen zum Umsehen, dynamischer Joystick links am Handy.
- **Ladendiebe (Cartoon-Slapstick):** Diebe rennen sichtbar mit der Beute zum Ausgang (🚨/🏃). Schubse sie mit E (💥, Sternchen, Beute fällt zurück ins Regal), halte sie fest und die Polizei holt sie am Eingang ab (Fangprämie). Wachmänner jagen Diebe selbst, Kameras markieren sie schon aus der Ferne. Entkommt einer, kostet es Ware und etwas Ruf.
- **Müll & Altkarton:** Leere Kartons bleiben in der Hand, bis du sie in den ♻️ Altpapier-Container wirfst (einfach hinlaufen). Der Container fasst 40 Kartons und wird jeden Abend gegen 5 € Gebühr geleert; ist er voll, landet der Müll auf dem Boden. Kunden lassen gelegentlich Müll fallen (🧹 aufheben).
- **Preisschilder:** Jedes Regal braucht ein Schild (E am Regal, der Einräum-Helfer steckt beim ersten Befüllen automatisch eines auf). Fehlt es, finden Kunden die Ware schwerer; ist es nach einer Preisänderung veraltet (rot) und der Kassenpreis höher, sind sie sauer.
- **Altersnachweis:** Bier, Wein (ab 16), Sekt, Likör, Korn (ab 18) – junge Kunden müssen am Band den Ausweis zeigen: Alter nachrechnen, Hologramm/Foto/Druck prüfen, Verkaufen oder Ablehnen. Verkauf an Minderjährige kostet 500 € Bußgeld und Ruf; der Alterscheck-Scanner (Ausbau) erledigt es automatisch. Neue Erfolge: Jugendschützer, Recycling-Profi.
- **Kasse & Menschen:** Artikel liegen sichtbar auf dem Band und werden einzeln gescannt (E, halten = schnell). Kunden haben Frisuren, Brillen, Bärte, Rucksäcke, Krawatten; Familien kommen teils mit Kind, das den Eltern folgt.
- **Steuerung:** PC: ins Bild klicken, Maus = umsehen, WASD laufen, E = Karton nehmen/Regal füllen, F oder Klick = Preise & Infos, V = Vogelperspektive. Handy: Joystick, rechts ziehen = umsehen, antippen = Info, Aktionsknopf. Zeit pausiert, solange ein Fenster offen ist.
- **Erweiterung:** Backstation (backt jeden Morgen frische Backwaren, lockt mit Duft), Lager-Regale (mehr Platz für Kartons), Online-Bewertungen mit Hype-Effekt und Influencerinnen, 15 Erfolge mit Belohnung.
- **Technik:** Spielkern `sim.js` (ohne Grafik, per Skript getestet), Daten `data.js`, 3D-Ansicht `view3d.js` (selbstgebaute Menschen, Regale, Kassen), Oberfläche `game.js`, Spielstand lokal im Browser.
