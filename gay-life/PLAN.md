# GayLife – Entwicklungsplan und Architektur

Ziel laut Auftrag: aus dem bestehenden „Gay Life!“ (3D-Kiez mit 14 Minispielen) wird **GayLife – Ein Leben in allen Farben**, eine 3D-Lebenssimulation mit Alltag, Dating, Beziehungen, Karriere, Wohnen, Nachtleben und eigener Hauptgeschichte in der Stadt **Rainbow City**. Zielgruppe: Erwachsene ab 18.

Der tatsächliche Stand, ausgeführte Tests und die nächsten Schritte stehen in [`FORTSCHRITT.md`](FORTSCHRITT.md). Diese Datei beschreibt die Architektur und die Meilensteine.

## Ausgangslage (Analyse vom 11.10.2026)

- `gay-life/index.html` war eine einzige Datei (≈ 200 KB): Three.js r128 per CDN, SVG-Porträts, ein 3D-Kiez („Regenbogenkiez“, 15 Gebäude, 12 NPCs, Aufträge, Nebenaufträge, Sterne, Haustiere, Parade), 14 Minispiele als HTML-Bildschirme, Kleiderschrank mit Glitzer-Käufen, Mehrspieler über PeerJS (bis 4 Geräte, Raumcode/QR, Emotes, Minispiel-Duelle, Eingaben werden geprüft: `cleanName`, `cleanLook`, `num`).
- Speicherung: ein localStorage-Schlüssel `anmachaGayLife`; `../cloud/anmacha-cloud.js` synchronisiert alle Schlüssel mit diesem Präfix per Google-Konto, pro Schlüssel gewinnt der neuere Zeitstempel, die ältere Fassung bleibt als Sicherung (`<spiel>__alt`).
- `bunte-insel/` nutzt dieselbe Technik (klassische Skripte, ein globaler Namensraum `BI`, Three.js r128, PeerJS) und Playwright-Tests mit SwiftShader. Diese Bauweise übernimmt GayLife, ohne Inhalte zu kopieren.
- ZOTIK liegt als eingebetteter Web-Build in `zotik/`; daraus wird nichts übernommen.

## Architektur

Klassische Skripte ohne Build-Schritt, genau ein globaler Namensraum `window.GL`. Reihenfolge in `index.html`:

| Datei | Aufgabe |
|---|---|
| `js/state.js` | Spielstand laden/speichern, Versionsnummer, **Migration** (v1 → v2, Sicherung des alten Stands unter `anmachaGayLife_v1backup`), Ereignisbus `GL.on/GL.emit` |
| `js/core.js` | Bisheriger Spielkern (unverändert übernommen, nur an Ereignissen angebunden): Porträts, Hub, 3D-Kiez, Steuerung, Dialoge, Aufträge, alle Minispiele, Editor, Mehrspieler. Stellt `GL.core` bereit und startet über `GL.boot()` |
| `js/ui.js` | Menü-Blatt (`GL.ui.menu`), Szenenwechsel/Abblenden (`GL.ui.fade`), Vollbild, Tastenkürzel |
| `js/life.js` | Uhrzeit, Wochentag, Tage, Bedürfnisse, Stimmung, Warnungen, Auswirkungen der Minispiele, Status-Anzeige |
| `js/economy.js` | Euro-Konto mit Buchungen, Späti Lecker, Barkeeper-Schichten |
| `js/home.js` | Betretbare Wohnung mit benutzbaren Möbeln |
| `js/furniture.js` | Möbelkauf und -platzierung, Miete, Gäste/Partner in der Wohnung |
| `js/jobs.js` | Jobs Verkäufer, Fitnesstrainer, Fotograf, DJ mit Schichten und Stufen |
| `js/nightlife.js` | Club-Abend: Themen, Eintritt, Tanzen, Getränke |
| `js/social.js` | Kontakte und Freundschaftswerte |
| `js/people.js` | NPC-Tagesabläufe nach Uhrzeit/Wochenende, Termine überschreiben den Plan |
| `js/dating.js` | Dating-Figuren, Gesprächsmenü, Flirt/Ablehnung, Dates, Beziehung, Streit, Trennung |
| `js/messages.js` | Nachrichten mit Antworten und Verzögerung |
| `js/datingapp.js` | Handy-Apps Nachrichten, Dating, Kalender |
| `js/districts.js` | Sieben weitere Viertel, Tram, Orte mit Wirkung, Passanten |
| `js/phone.js` | Handy mit Apps, Grafikqualität |
| `js/main.js` | Start |

Neue Systeme ändern sich nicht gegenseitig direkt, sondern über Ereignisse. Der Kern sendet:

| Ereignis | Wann | Nutzung |
|---|---|---|
| `worldBuilt (W)` | 3D-Welt aufgebaut | Gebäude/Interaktionen ergänzen (Späti, Wohnung) |
| `enterWorld (W)` | zurück in der Stadt | – |
| `tick (dt, W)` | jedes Bild in der Stadt (nicht während Dialogen) | Uhr, Bedürfnisse |
| `sky (W)` | vor der Himmelsberechnung; `true` = übernommen | Innenraum-Licht |
| `poi (id)` | Gebäude betreten; `true` = übernommen | Wohnung, Türsteher-Prüfung |
| `talk (npcId)` | NPC angesprochen | Kontakte, Bedürfnis „Kontakte“ |
| `talkMenu (npc, talkBase)` | vor dem alten Gespräch; `true` = übernommen | Dating-Menü |
| `phoneTasks` | Aufgaben-App; Rückgabe = HTML | Termine |
| `activity (gameId)` | Minispiel gespielt und verlassen | Zeit und Bedürfnisse |
| `clubShift ({tips, served, lost})` | Schicht im Club beendet; Rückgabe = HTML-Zeile | Lohn |
| `openMap`, `blocked`, `newDay` | Karte öffnen / Eingaben gesperrt? / neuer Tag | Handy, Overlays |

Wichtige Regeln für Erweiterungen:
- Eine Wahrheit pro Sache: z. B. Termine später als ein Objekt in `S`, das Kalender, NPC und Auftrag gemeinsam lesen.
- Neue Daten immer in `def()` (state.js) eintragen; Bedeutungsänderungen bekommen eine neue Version mit Migrationsschritt in `migrate()`.
- Keine Funktion im Handy oder in der Welt anzeigen, die noch nicht wirklich funktioniert.
- Performance: Geometrien/Materialien teilen, nichts dauerhaft außerhalb der Sicht animieren, Sichtweite über die Qualitätsstufe.

### Spielstand v2 (zusätzlich zu v1)

```
life:     { day, needs:{energy,hunger,hygiene,social,stress}, boost, money, log[], food, inside, intro, warn{}, stats{meals,showers,sleeps} }
jobs:     { bar:{ xp, shifts, earned } }
rel:      { <npcId>: { met, f, talks, last } }
settings: { q }   // -1 automatisch, 0 niedrig, 1 mittel, 2 hoch
```

### Zeitmodell

`S.world.t` ist der Tagesanteil (0 = 6:00, 0,25 = 12:00, 0,75 = 0:00). Ein Spieltag dauert in der Stadt 16 echte Minuten. Aktivitäten spulen vor (Schicht 4 Std., Kochen 45 Min., Schlafen bis 7 Uhr …). Tag 1 ist ein Montag.

## Meilensteine

| # | Inhalt | Stand |
|---|---|---|
| M0 | Analyse, Aufteilung in Module, Migration, Browser-Testgerüst | erledigt |
| M1 | Alltag: Uhr, Bedürfnisse, Geld, Späti, Barjob, eigene Wohnung, Handy, Kontakte | erledigt (Grundstufe) |
| M2 | Rainbow City: Viertel Downtown, Pride District (heutiger Regenbogenkiez), Neon Nights, Rainbow Beach, Love Gardens, Fashion Boulevard, Rainbow Heights, Crystal Coast; Weltabschnitte laden/entladen, Tram zwischen Vierteln, Wetter, Instancing für Bäume/Lampen | weitgehend erledigt (Durchgang 5: sieben Viertel, Tram, Laden/Entladen, Instancing; Wetter und Bewohner offen) |
| M3 | Menschen: NPC-Tagesabläufe nach Uhrzeit/Wochentag; Dating-Kern mit Persönlichkeit, Vorlieben, Gesprächsarten (Smalltalk, tief, Flirt, Kompliment), Zustimmung und Ablehnung, Beziehungsstufen bis Partnerschaft, Erinnerungen; Nachrichten, Dating-App, Kalender mit Terminen | erledigt (Durchgang 2; Konflikte/Zusammenziehen ohne Wohnung, Zusammenziehen folgt in M6) |
| M4 | Nachtleben: Club-Innenräume mit eigenen Musikstilen (selbst erzeugt), Tanzen mit Emotes, Bar-Bestellungen, Karaoke/Tanzwettbewerb in der Welt, Themenpartys, Pride-Events | teilweise (Durchgang 4: Themenabende, Tanzen, Getränke; Innenräume, Musik, Events offen) |
| M5 | Karriere: weitere Jobs mit eigenen Abläufen (DJ, Verkäufer, Fitnesstrainer, Fotograf, Stylist, Eventmanager, Performer), Beförderungen | teilweise (Durchgang 4: Verkäufer, Fitnesstrainer, Fotograf, DJ mit Stufen) |
| M6 | Wohnen: Möbel kaufen und platzieren, Miete, Gäste und Dates zu Hause, Zusammenziehen | erledigt (Durchgang 3; größere Wohnungen offen) |
| M7 | Hauptgeschichte „Ein Leben in allen Farben“: Community-Zentrum in Gefahr, mehrere Kapitel, Entscheidungen mit Folgen, mehrere Enden, freies Weiterspielen | offen |
| M8 | Mehrspieler-Ausbau: gemeinsame Clubbesuche, Tanzen, Besuche in der Wohnung, Gruppenfotos (bestehende Prüfungen beibehalten) | offen |
| M9 | Charaktereditor: 3D-Vorschau, Körperbau, Größe, Outfits speichern, Tattoos | offen |
| M10 | Politur: Animationen, Audio, Performance (LOD), Abschlussprüfung auf echten Geräten | offen |
