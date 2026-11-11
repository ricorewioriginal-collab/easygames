# Zotik 2.0 (Browser, Three.js)

Moderne 3D-Neuaufbau-Variante von **Zotik – Die Splitter der Welten**: eine Datei (`index.html`), kein Build-Schritt, Three.js per CDN, Handy und PC.

- **Alle 10 Kapitel**: Lunaris, Elaris, Valdoria, Solmera, Aqualis, Frosthain, Ignara, Noctaris, Astralis und Elyndra (siehe unten).
- **Kapitel 1 Lunaris**: Dorf am Mondblick, Mondwald, Risshöhle mit Mondwolf-Alpha (Boss), Haupt- und Nebenquest, Händler, Truhen, Stufenaufstieg.
- **Figuren nach den Master-Sheets** (`reference/approved/`): Zotik als aufrecht gehender oranger Fuchs mit grünem Schal, Weste, Reiseklinge mit Kristall und buschigem Schwanz mit heller Spitze; Mira (blaue Haare, Mondschmuck), Professorium (Fliegerbrille, Technikrucksack), Felli.
- **Steuerung**: WASD/Stick bewegen, rechte Maustaste bzw. Wischen = Kamera, J/Klick = Angriff (3er-Kombo), Shift = Ausweichen, 1/2/3 = Funkenwirbel / Lichtstoß / Heiltrank, E = Sprechen, Esc = Menü.
- **Handy-Steuerung** (Gay-Life-Stil): runder Stick links, rechts max. 4 Tasten – Angriff (groß), Ausweichen (im Nautilux „Turbo"), Fähigkeit (Tippen = gewählte, Halten = Funkenwirbel/Lichtstoß/Heiltrank wählen) und Aktion (Sprechen/Öffnen bzw. Einsteigen/Aussteigen; Halten = Nautilux-Form wählen). Begleiter kämpfen automatisch.
- **Leistung**: Props werden in Raster-Zellen gezeichnet (nur was im Bild bzw. im Schattenbereich liegt), die Qualität passt sich automatisch an die Bildrate an (Auflösung und Schatten-Takt sinken schrittweise und kehren zurück, wenn es wieder rund läuft).
- **Speicherstand**: `localStorage`, Schlüssel `zotik2_save_slot1` (Autosave). Das Cloud-Skript aus easygames (`anmacha-cloud.js`, Spielname `zotik2`) hängt sich dort ein; das Godot-Zotik bleibt unberührt.

Ordner: Dieses Spiel liegt jetzt in `zotik/` und ist die Startseite der Pages-Seite. Das alte Godot-Zotik liegt komplett in `zotik-old/` (Web-Build unter `/zotik-old/`).

## Titelscreen, HUD und Handy-Ansicht
- Konsolen-Titelscreen nach dem Key-Art-Vorbild: Logo, Menü mit Leuchtbalken (Pfeiltasten/Enter oder Tippen), Untermenü „Steuerung".
- HUD und Dialoge zeigen die Originalfiguren (Gesichter aus den Master-Sheets: Zotik, Mira, Professorium, Felli).
- Menü, Aufgaben und Steuerung sind für Hoch- und Querformat kompakt (Tabs, scrollbar); Handy zeigt Touch-Steuerung statt Tastaturliste.
- Ablauf: Startscreen („Tippen oder Taste drücken") → Ladebalken → Menü (Neues Spiel / Spiel laden / Steuerung) → Speicherplatz (3 Slots) → „Mein Zotik" (Fellton, Schal, Kleidung; nur bei neuem Spiel) → Spawn im Dorf.
- Speicherstände: `zotik2_save_slot1` bis `zotik2_save_slot3`; die Auswahl wird im Spielstand (`cos`) gespeichert.
- Häuser sind begehbar: Tür vorn, Innenraum mit Möbeln (Taverne, Schmiede, drei Wohnhäuser), Wandkollision, Dach und Wände blenden beim Betreten aus; in drei Häusern liegt eine Truhe. Jedes Gebäude hat eine Funktion (`zotik-src/src/town.js`): ⛪ Kirche (Segen = Heilung und Wiederbelebung, Sternensegen +25 % Erfahrung, Speichern), ⚔️ Waffenladen & Schmiede (Ausrüstung, Schärfen, Verstärken bis +3 aus Fell/Rissstaub/Kernsplittern), ✨ Magieladen (Schmuck, Äther, Zauberkunde), 🧪 Tränke & Extras (Heiltränke, Phönix-Trank, Kristallfrucht, Kräuter), 🍺 Wirtshaus (Rasten, Gerüchte), Wohnhäuser (Truhen, Bücherregale). Die Bauplätze von Kirche, Wirtshaus und Casino sind eingeebnet (`bflat`).

## Kapitel 2 bis 10 (Welten-Baukasten)
- Nach Kapitel 1 öffnet das **Weltentor** (Standbild mit Ring im Dorf, `E`) das Menü „Weltreise". Jede Welt öffnet erst, wenn die vorige geschafft ist; man kann jederzeit zurückreisen.
- Jede Welt hat eigene Palette, Himmel, Nebel, Bäume/Props, Wahrzeichen am Horizont, Dorf mit Ältester/Ältestem und drei Bewohnern (der erste handelt), vier Gegnerarten (Fernkämpfer, Nahkämpfer, Wächter, Boss) und Truhen.
- Ablauf je Kapitel: mit der Ältesten sprechen → ins Umland gehen → 5 Gegner vertreiben → das Rätsel der Welt lösen → Wächter besiegen (Siegel bricht) → Boss in der Arena → Bericht und Belohnung.
- Namen, Gegner, Bosse und Aufgaben stammen aus dem alten Spiel (`zotik-old/data/*.json`): Wurzelkönigin, Kanalwächter, Kharos, Neryx, Avarn, Magmarion, Erinnerungshüter, Solyra, Elyon.
- Fortschritt je Kapitel im Spielstand (`ch`, `cd`), alte Spielstände laden unverändert. Daten der Kapitel: `CHP` im Skript, Aufbau in `buildWorld`.

## Begleiter, Rätsel und Zwischensequenzen (aus der alten Version)
- **Begleiter:** Lyra (Heilerin, schließt sich beim ersten Besuch von Elaris an), Nia (Bogenschützin, im Forschungsviertel ansprechen) und Rovan (Nahkämpfer, im Wald von Elaris). Sie folgen, kämpfen mit, Lyra heilt bei wenig Leben; Symbole neben dem Porträt, Liste im Inventar. Gespeichert in `party`.
- **Rätsel** (neue Oberfläche mit Hinweisen, Esc schließt): Lunaris hat Mondtor-Scheiben und Resonanzkristalle, die das Risstor öffnen; jede Welt hat ein eigenes Rätsel (Scheiben, Reihenfolge oder Ventile) vor dem Wächter. Daten `PZD` im Skript, Lösungen in `pz`.
- **Zwischensequenzen** (Kinobalken, Sprecher mit Porträt): Traum zum Spielstart, Orun-Begegnung und Riss-Vision in Lunaris, Lyras Ankunft, je Welt Ankunft, Rätsel/Ruinen, Boss und Abschluss. Daten `CUT`.
- **Orun** ist der zweite Boss in Lunaris (nach dem Mondwolf) und gibt die Weltenklinge (+8 Angriff).

## Endspiel: Weltenriss (Kapitel 11)
- Öffnet im Weltentor, sobald Elyndra geschafft ist (Ankunfts-Zwischensequenz, Hub mit Veyra, Kael, Eryn, Toren).
- **Sieben Siegel** im Norden, je mit Zwischensequenz: Weltenbrecher (Der erste Wächter, Die Wurzel ohne Ende, Der Goldene Koloss, Der Sandkönig, Der Abyss, Das Frostherz, Der Feuerkern) → Wächter des Dungeons → Siegel-Rätsel (Scheiben) → Schatzkammer mit Splittern und Tränken. Fortschritt in `end`.
- **Drei Enden** bei Veyra, wenn alle Siegel gebrochen sind: Getrennt bewahren, Vereinen, Verweben (jeweils mit Zwischensequenz, später änderbar). Gewählt wird in `ending`.
- Vereinfacht gegenüber dem alten Spiel: Die Dungeons sind Siegel-Stationen mit Wächterkampf statt begehbarer Räume.

## Casino, Nautilux, Nebenaufträge, Halle der 100, NG+
- **Golden Star Casino** in Valdoria (Kapitel 3): begehbarer Saal mit drei Spielen als 3D-Geräte – Kristallslots (echte Walzen), Sternenrad und Höher oder Tiefer am Kartentisch. Einsätze 10/50/100, nur virtuelle Splitter, Auszahlung 92–97 %. Stella am Eingang schaltet die Geräte ein und aus (Familienoption). Test: `node tools/test-zotik/stadt.cjs`.
- **Nebenquest-Ketten** (`zotik-src/src/quests.js`): 19 mehrstufige Aufträge mit eigener Geschichte (Lunaris 1, Welt 2–10 je 2), Auftraggeber sind die Leute in den Stadtgebäuden. Schritte: Fundstück, Gegner besiegen, benannter Zwischengegner, jemanden aufsuchen, Material abgeben. Stand in `S.nq`, Anzeige im Menü unter Aufgaben. Test: `node tools/test-zotik/nebenquests.cjs`.
- **Springen und Plattformen**: Leertaste / Controller B / Knopf ⤴ / Kommandomenü (Fernbedienung). `PLAT` = schwebende Platten (von oben landen, seitlich Wand, hohe unterlaufen), `jumpPath(n)` baut je Welt einen Sprungpfad mit Schatzplattform (ab Welt 4 mit beweglicher Platte). Controller: B springt, X weicht aus. Test: `node tools/test-zotik/springen.cjs`.
- **Vorhallen** (Dungeon vor jedem Weltenboss, `buildDungeon` in `main.js`): Welt 2–4 zwei, ab Welt 5 drei Ebenen aus dem Labyrinth-Generator der Uralten Höhle (`mazeGen`). Je Ebene verschlossene Treppe am Start, Schlüsseltruhe in der Halle am Ende (Rätsel aus `rooms.js`, Sprungraum oder Jagd-Siegel), Runentor als Abkürzung; letzte Ebene: Zwischengegner, danach Tor nach draußen (setzt Schritt 5 wie bisher der Sieg auf dem Weg). Zustand nur zur Laufzeit (`X.dun`), gespeichert wird die Position vor dem Eingang. Im Koop wie bisher Zwischengegner auf dem Weg. Test: `node tools/test-zotik/dungeon.cjs`.
- **Fähigkeitenbaum** (`SKT`, `S.sk`): je Stufe ein Punkt, Rang r kostet r Punkte, kostenlos neu verteilbar; Stärke, Zähigkeit, Geist, Präzision, Zauberkraft, Sprungkraft (ab Rang 3 Doppelsprung). **Bestiarium-Belohnungen** (`BST_R` in `extra.js`) bei 5/10/20/30/40 Arten. **Neues Spiel+**: mehr Gegner, ein Teil als Sturm-/Fels-/Wut-Variante (`e.ngx`). **Ruinen**: zehn verschiedene Rätsel (`RUIN_PZ`), fünf neue Arten in `rooms.js` (colors, order, dark, sum, pattern) mit Lösungsweg `sol` für die Tests. Tests: `ausbau.cjs`, `raetsel.cjs`.
- **Nautilux** (Professorium schenkt sie nach Kapitel 1, `fl.naut`; Vorlage: Master-Sheet „Professoriums modulares Fahrzeug, U-Boot und spätere Transformationen“): V (am Handy 🚤) steigt ein und aus, B (🔄) wechselt die Form. Sie verwandelt sich im Spielverlauf:
  - **Gleiter** 🚤 (ab Kapitel 1): schnell, rammt Gegner.
  - **U-Boot** 🛥️ (nach Kapitel 4): taucht in die blauen **Tiefsee-Becken** jeder Welt (zwei Truhen darin); Shift = Turbo.
  - **Luftschiff** 🎈 (nach Kapitel 7): fliegt über Klippen zu **Himmelstruhen** auf hohen Felsen, nimmt wenig Schaden; Landen nur auf flachem Boden.
  - **Riss-Form** 🔮 (nach Kapitel 10): am schnellsten, Rammen mit 2,6-fachem Schaden.
  Steigt bei Dialog, Reise und Tod automatisch ab.
- **Kollision**: Spielerbewegung läuft in Teilschritten (kein Durchtunneln bei Dash, Turbo oder niedriger Bildrate), Hindernisse werden in zwei Durchgängen aufgelöst, alle Felsen, Rissscherben, Risstor-Pfeiler und Hochhäuser sind fest, und auch das Luftschiff stößt an Häuser, Bäume und Felsen (es fliegt nur über Gelände und Klippen).
- **Nebenaufträge** im Weltenriss-Hub (Sela, Nerea, Professorium, Kael, Eryn, Toren): zählen Gegner in Lunaris, Elaris, Aqualis, Elyndra, Erinnerungssplitter und Rissessenz; Belohnung sind Splitter und ein Andenken (+1,5 Angriff). Stand im Menü unter „Nebenaufträge“.
- **Halle der 100**: 100 Prüfungen in Wellen, jede zehnte ein Bosskampf, Rang-Belohnungen (`hall`). Vereinfacht gegenüber dem alten Spiel (Wellen statt Arena-Rängen).
- **Neues Spiel+**: nach einem Ende bei Veyra wählbar. Behält Stufe, Splitter, Waffen, Andenken, Nautilux, Gefährten, Halle und Nebenaufträge; Gegner mit +50 % Leben und +35 % Angriff je Stufe, Bosse mit Raserei-Phase.

## Grafikupdate (Oktober 2026)
- Terrain: kleine prozedurale, gekachelte Bodenstruktur sowie feinere Farbvariation; Weg nach Lunaris mit flachen Randsteinen.
- Mondwald: vollere Baumkronen mit hellen Blattspitzen. Zusätzliche Kronenteile und Wegsteine nutzen Instancing für geringe Draw-Call-Kosten.
- Dorf: steinerne Sockel und Türstufen, helle Eckleisten, gefasste Fenster mit Sprossen und Fensterbänken, Dachkanten und Dachspitzen. Dachdetails werden beim Betreten zusammen mit den Dächern ausgeblendet.
- Etwas klareres Mondlicht und weniger dichter Fernnebel. Speicherformat, Kollisionen und Weltpositionen bleiben gleich.

Prüfung: Inline-JavaScript syntaktisch geprüft; vollständiger Weltaufbau mit Three.js r128 und simuliertem Renderer geprüft. Alle zehn Instancing-Gruppen bleiben innerhalb ihrer Kapazität, und die 592 Kollisionskreise entsprechen exakt dem vorherigen Stand. Ein echter Browser- oder Handytest war in dieser Umgebung nicht möglich.

## Koop: zu zweit spielen
- Gastgeber: Pause-Menü → Reiter „Koop“ → „Raum öffnen“. Es erscheinen ein 4-stelliger Code, ein QR-Code und ein Link (`#join=CODE`).
- Mitspieler: Titelmenü → „Mitspielen“ → Code eintippen (oder QR-Code scannen / Link öffnen). Der zweite Zotik hat andere Fell-, Schal- und Kleidungsfarben und ein Namensschild.
- Beide sind in derselben Welt: Gegner, Bosse, Truhen, Rätsel, Begleiter und der Geschichtsstand (Stufen, Kapitel, Aufgaben) werden gemeinsam abgeglichen. Leben, Mana, Erfahrung, Splitter und Tränke behält jeder für sich.
- Der Gastgeber rechnet die Gegner, der Gast schickt seine Treffer. Weltwechsel (Weltentor), Halle der 100 und Neues Spiel+ löst nur der Gastgeber aus; der Gast folgt automatisch.
- Gespeichert wird nur beim Gastgeber (der Gast schreibt keinen Spielstand; Geschichtsfortschritt landet im Spielstand des Gastgebers).
- Technik: PeerJS (WebRTC) über cdnjs, kein eigener Server, kein TURN. Hinter manchen Mobilfunk- oder Firmennetzen kommt keine direkte Verbindung zustande.

## Wartung (Oktober 2026)
- Rätsel zeigen ihren Hinweis sofort (📜), Scheiben sind beschriftet (z. B. Himmelsrichtung, Jahreszeit), Säulen benannt, Resonanzkristalle hörbar (🔊).
- Gesprächsantworten per Tastatur: 1–9 oder Pfeiltasten + Enter/E.
- Casino ist bei neuen Spielständen aus; ein-/ausschalten im Menü „Steuerung“ → Optionen.
- Gefährten laufen seitlich neben Zotik statt zwischen Kamera und Spieler.
- Weniger Draw-Calls (statische Teile von Häusern, Figuren, Inseln und Wahrzeichen werden verschmolzen); Weltwechsel gibt Grafikspeicher wieder frei.
- `window.__zotik` (Test-Zugang) gibt es nur noch auf localhost oder mit `?debug` in der Adresse.

## Kingdom-Hearts- und Lufia-Elemente (Oktober 2026)
Plan, Annahmen und Testergebnisse: `docs/WEB_KH_LUFIA_PLAN.md`.
- **Befehlsleiste** (PC, links unten): Angriff, Magie, Items, Spezial, Werkzeug – ↑ ↓ Enter, ⌫ zurück, oder klicken.
- **Zielerfassung** Q / 🎯, **Reaktionsbefehle** F / Aktion-Taste (Konter, Mondsprung, Reflektor, Finisher).
- **Team-Angriffe** (T) mit Lyra, Nia, Rovan; **Rissform/Sternform** (G) über die Rissleiste.
- **Ausrüstung** (Waffe, Rüstung, Schmuck) mit **IP-Techniken** (4/5/6); IP füllt sich bei Treffern auf Zotik. Menüseite „Ausrüstung“.
- **Felli als Kapselmonster**: kämpft mit, frisst Heiltrank/Äther/Kristallfrucht/Splitter, entwickelt sich (Blütling, Dornling, Waldgeist). Menüseite „Felli“.
- **Werkzeuge** (Enterhaken, Bombe, Feuerstab, Eisstab) als Belohnung für Kapitel 2–5; in jeder Welt eine **Werkzeug-Ruine** mit Schatz (C benutzen, X wechseln).
- **Uralte Höhle** (Eingang in Lunaris nach Kapitel 1): 50 Zufallsebenen, Start mit Stufe 1, blaue Truhen bleiben, Rekord im Inventar.

## Projektunterlagen (aus dem früheren Repo `zotik`)
Das eigenständige Repo `ricorewioriginal-collab/zotik` ist aufgelöst; Zotik läuft nur noch hier über easygames.
Die wichtigen Unterlagen liegen in `docs/`: Spielkonzept und Story (`01_MASTER` … `22_GIFTCODES`), Entwicklungs-Doku und
Phasenpläne (`docs/docs/`), freigegebene Master-Sheets (`docs/reference/approved/`), Projekt-Manifeste, `mcp/` und `status/`.
Nicht übernommen: das alte Godot-Projekt (`zotik-old/`, Godot-Starter), Konzept-/Screenshot-Bilder und der eigene Server-Deploy.
`docs/` gehört nicht zum Spiel und wird nicht in die App gepackt.
