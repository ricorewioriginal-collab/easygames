# Spielmechanik

Simulation mit festen 60 Hz (Akkumulator), dadurch gleiches Verhalten bei 30, 60 und 120 Bildern pro Sekunde (getestet).

## Bewegung

- **Sprung:** Antippen springt niedrig, Halten höher (Sprunghöhe wird nach 0,08 s beim Loslassen gekappt).
- **Coyote Time:** 0,12 s nach dem Verlassen einer Kante darf noch gesprungen werden.
- **Sprungpuffer:** Ein Druck bis 0,14 s vor der Landung wird nach dem Aufsetzen ausgeführt (statt eines Flügelschlags knapp über dem Boden).
- **Gleiten (wie auf der PS1):** Springen, in der Luft nochmal Sprung – Aeru segelt ohne Flügelkraft geradeaus (11 m/s, höchstens 2,4 m/s Sinken), der Stick lenkt. Ramm in der Luft = Kopfstoß, dritter Druck = Flügelschlag/Flug.
- **Kopfstoß:** Ramm in der Luft (ab 0,8 m über Boden) – senkrechter Sturz, die Landung trifft Gegner im Umkreis von 3 m doppelt und öffnet Eisentruhen (je Gebiet eine, mit Edelstein; Rammen und Feuer prallen ab).
- **Schwimmen:** See am Ostgebiet jeder Welt (Grund 0,9 m unter dem Ufer, 5,2 m/s, Steinrand hält, Kantenhilfe zieht ans Ufer). **Klettern:** Rankenwand an der 6 m hohen Klippe am Westgebiet – auf die Ranken zu drücken, 4,2 m/s hinauf.
- **Flugprüfung:** rosa Startring über dem Hauptland (−10 | 10 | 16) jeder Welt – 60 s für 8 Ringe (Radius 41–51 m, Höhe 11–19 m) und 4 Sturmballons (Radius 38 m, Höhe 17 m); jeder Treffer füllt die Flügelkraft. Lohn: lila Edelstein (gespeichert). Sprung halten bremst wie bisher den Fall.
- **Rammstoß (Umschalt / RAMM):** Am Boden ein kurzer Schub mit Unverwundbarkeit. Wer im Schub einen Gegner trifft, schlägt ihn (Reichweite 1,7 m, nach den ersten 3 Himmelstruhen 3,2 m) und zerstreut Dornenkugeln.
- **Ansturm:** Wer die Rammtaste nach dem Stoß gedrückt hält, stürmt bis zu 3 s lenkbar mit 12,5 m/s weiter (Wendekreis 3,2 rad/s) und rammt alle 0,3 s erneut. Loslassen, Springen, Fliegen oder eine Kante (Kantenschutz) beenden ihn.
- **Landung:** Stauchung und Geräusch je nach Fallgeschwindigkeit.
- Plattformen haben echte Dicke: Man kann unter ihnen hindurchlaufen, es gibt keine unsichtbaren Wände.
- **Kantenhilfe:** Wer bis zu 1,3 m unter einer Kante gegen Insel oder Plattform stößt, zieht sich hinauf.
- **Kantenschutz:** Beim Laufen bleibt Aeru 0,45 s an einer Kante stehen; wer weiter drückt, geht bewusst hinunter.
- Bäume sind fest (Stamm und Krone); die Kamera rückt vor Baumkronen, statt im Laub zu stecken.
- Der Fels unter einer Insel ist fest und folgt ihrer sichtbaren, nach unten schmaler werdenden Form.

## Flug

- G/FLUG startet den Flug, erneut landet man. In der Luft wechselt ein Flügelschlag in den Flug.
- Sprung länger halten = steigen (kostet Flügelkraft), Umschalt/ROLLE = sinken, sonst langsames Sinken. Ohne Steigen lädt die Flügelkraft im Flug langsam nach.
- Flügelkraft lädt am Boden und in türkisen **Aufwinden**, die zusätzlich anheben. Bei wenig Kraft warnt die Anzeige.
- Optionale **Flughilfe** in den Einstellungen.

## Touch-Steuerung

Links ein großer Stick mit Totzonenring. Rechts ein Aktionsrad: SPRUNG groß unten, FLUG oben, FEUER links, ROLLE rechts. REDEN erscheint nur, wenn jemand in der Nähe ist.

## Controller

PlayStation, Nintendo Switch und Xbox werden automatisch erkannt (`../gamepad.js`); Hinweise zeigen die passenden Symbole (✕ ○ □ △ bzw. B A Y X).
Linker Stick läuft und fliegt **analog** (Totzone 0,18, halb gedrückt = halbe Geschwindigkeit), rechter Stick dreht die Kamera (Totzone 0,2), R3 = Kamera hinter Aeru, L1/R1 drehen schrittweise.
Kreuz = Sprung, Kreis = Feueratem, Viereck = Rammstoß, Dreieck = Sprechen/Portal, R2 = Flug, L2 = Rammstoß bzw. sinken, Options = Pause, Share = Tagebuch.
Treffer und Rammstöße lassen den Controller kurz vibrieren. Im Controller-Modus ersetzt eine Symbolleiste die Tastatur- und Touch-Hinweise; Menüs bedient das Steuerkreuz.

## Spieleportale

In jeder Welt stehen neben dem Inselstart zwei Portale: links zur **Bunten Insel**, rechts nach **Zotik** (die beiden Highlight-Spiele der Sammlung).
Erstes Sprechen fragt nach, das zweite speichert und reist im selben Tab (`?from=aeru`). Die Portalsäulen sind fest. In beiden Spielen zeigt `rueckweg.js`
für diese Sitzung oben in der Mitte „🐉 Zurück zu AERU“.

## Kamera

Folgt weich, lässt sich frei drehen (Maus, Q/E, Wischen) und zoomen (Mausrad). Die Kamerahilfe dreht nach kurzer Zeit ohne manuelle Eingabe hinter Aeru (abschaltbar). Die Kamera bleibt über Boden und Plattformen. Empfindlichkeit für Maus und Touch getrennt einstellbar.

## Kampf

- **Feueratem** (F/FEUER) trifft Gegner, Laternen, Kugeln und Bossschilde in Blickrichtung.
- Gegner: **Nebelkäfer** (Sprungangriff), **Sturmfunke** (schießt Kugeln), **Stille-Schatten** (weicht aus, nur nach dem Angriff verwundbar), im Nachtgarten **Nachtmotte** (fliegt im Zickzack, 1 Treffer, schneller Sturzflug) und **Wurzelwächter** (3 Treffer, setzt drei Warnkreise, die nach 1 s einschlagen).
- Jeder Angriff wird angekündigt (roter Kristall über dem Gegner), dann Angriff, dann Erholung.
- Nach einem Treffer kurze Unverwundbarkeit. Besiegte Gegner kehren erst nach 20 s zurück und nur, wenn Aeru weit genug weg ist.
- Tod: zurück zum letzten Rastpunkt (graue Steinplatte), volle Herzen, Questfortschritt bleibt.

## Bosse

- **Vesper** (Sternenwarte, 6 Treffer, 3 Phasen): Wellen überspringen, Warnkreisen ausweichen, bei offenem Schild zuschlagen.
- **Die Nachtblüte** (Nachtgarten, 8 Treffer, 3 Phasen): Wellen überspringen, in Phase 2 Dornenkugeln mit dem Feueratem oder Rammstoß zerstreuen, in Phase 3 Doppelwellen und rote Kreise.
- **Die Stille** (Morgenruinen, 9 Treffer, 3 Phasen): In Phase 2 müssen schwebende Anker im Flug zerstört werden (temporäre Aufwinde helfen), Phase 3 mit Doppelwellen.
- Ein Bosskampf beginnt erst, wenn der Questschritt aktiv ist und Aeru die Arena betritt. Wer stirbt, beginnt am Arenaeingang; der Boss wird nur auf den Beginn der aktuellen Phase zurückgesetzt.

## Quests und Orientierung

- Zustände: gesperrt, verfügbar, aktiv, Teilziel erfüllt, bereit zur Abgabe, abgeschlossen.
- Zielfeld mit Kapitel, Ziel, Fortschritt, Begründung und **Kompass** (Pfeil + Entfernung). Goldener Lichtstrahl über dem Ziel, Marker auf der Minikarte.
- **Tagebuch** (J oder ☰): aktuelles Ziel, Kapitelübersicht, erledigte Schritte, Nebenquests. Künftige Kapitel bleiben verborgen.
- Laternen der Liedinsel müssen in der richtigen Reihenfolge geweckt werden; ein Fehler löscht sie wieder, das Lied wird erneut angezeigt.

## Himmelsinseln, Truhen und Schwung-Ringe

Jede der 7 Welten hat drei kleine **Himmelsinseln** (Ost-Nord, West-Nord, Süd). Man erreicht sie über einen Aufwind der Hauptinsel und fliegt hinaus; eine Ringstraße aus **Schwung-Ringen** (hellblau) liegt auf dem Weg. Durchfliegen gibt 2,4 s lang 50 % mehr Flugtempo und füllt die Flügelkraft. Die Landehilfe über Inseln hilft beim Aufsetzen. Jede Himmelsinsel trägt eine **Himmelstruhe** (füllt Herzen und Flügelkraft) und einen Rastpunkt.

| Truhen (von 21) | Belohnung |
|---|---|
| 3 | stärkerer Rammstoß |
| 9 | zusätzliches Herz |
| 15 | Flügelkraft +25 |
| 21 | Himmelskrone (alle gefunden) |

## Sammelobjekte und Upgrades

168 Himmelssplitter (24 pro Insel, 7 Inseln), optional. Gesammelte Splitter bleiben nach dem Laden gesammelt.

| Splitter | Belohnung |
|---|---|
| 24 | Flügelkraft +25 |
| 48 | zusätzliches Herz |
| 72 | größere Feueratem-Reichweite |
| 96 | zusätzliches Herz |
| 120 | 12 % schnellerer Flug |
| 144 | Sternenglanz: unbegrenzte Flügelkraft (Steigen, Gleiten, Flügelschlag) und goldene Flugspur |

## Einstellungen (Pause → Einstellungen)

Lautstärke, Musik, Grafikqualität, Kamera- und Touchempfindlichkeit, Kamerahilfe, Flughilfe, Zielhilfe (Lichtstrahl/Kompass), reduzierte Bewegung, Textgeschwindigkeit, große Schrift, Leistungsanzeige, Vollbild. Gespeichert unter `aeru-settings`.

## Modelle

Bäume, Felsen und Gras (Wizp, CC0) werden je Welt als InstancedMesh gezeichnet (wenige Draw Calls); die Gegner (Quaternius, CC0) haben eigene Skelette mit Bewegungen für Schweben, Anlauf, Kopfstoß und Treffer. Die Modelle ändern nur das Aussehen – Kollision und Verhalten bleiben gleich. Auf „Sparsam“, ohne WebGL oder wenn die Dateien nicht laden, bleiben die eigenen Formen. Das Ladebild wartet höchstens 7 s auf die Modelle.

## Grafikstufen

| Stufe | Auflösung | Schatten | Partikel | Wolken | Vögel |
|---|---|---|---|---|---|
| Sparsam | ×0,8, max. 1 | aus | 40 % | 6 | 0 |
| Ausgewogen | ×1, max. 1,25 | 512 px | 70 % | 10 | 4 |
| Hoch | ×1, max. 2 | 1024 px | 100 % | 14 | 8 |
| Automatisch | startet Ausgewogen (Touch) bzw. Hoch; misst die Bildzeit in 0,5-s-Fenstern und senkt bei > 24 ms erst die Auflösung, dann die Stufe; erhöht wieder nach drei guten Messungen (< 14,5 ms) |

Ohne WebGL zeichnet ein **2D-Ersatzmodus** eine vereinfachte Karte; Simulation, Quests und Spielstände bleiben gleich, ein Hinweis zeigt den Modus an. Bei verlorenem WebGL-Kontext lädt die Seite neu (Spielstand bleibt erhalten).

## Audio

Ein einziger AudioContext, erst nach der ersten Eingabe. Musik pro Insel (Grundton, Tonleiter, Tempo), Windrauschen abhängig von der Geschwindigkeit, Effekte. Lautstärke und Musik schaltbar; im Hintergrund wird der Ton angehalten.

## Pause und Fokus

Fensterwechsel oder verdeckter Tab pausiert das Spiel und löst alle gedrückten Tasten und Touchpunkte.

## Drachenkunst

- **Schatzkörbe:** bis zu fünf je Welt an festen Stellen (nur auf ebenem Boden, frei von Splittern, Laternen, Figuren, Teichen, Portalen und Bäumen; Bäume meiden diese Stellen). Fest wie Felsen; Feueratem, Rammstoß und Ansturm zerbrechen sie. Nicht gespeichert – beim nächsten Besuch stehen sie wieder.
- **Lichtfalter:** aus jedem zerbrochenen Korb und jedem besiegten Gegner (Pool von 6). Flattern umher, weichen leicht aus, fliegen nach 12 s davon. Fangen heilt ein Herz, bei vollen Herzen füllt er die Flügelkraft.
- **Funkel:** Begleiter-Glühwürmchen hinter Aerus Schulter. Farbe = Lebensenergie (Gold über 60 %, Blau über 30 %, sonst Rot; bei einem Herz blinkt er). Holt Splitter und Falter aus 2,4 m heran (vorher 1,2 m). Splitter-Kette: innerhalb von 1,4 s gesammelte Splitter steigen im Ton.

## Weite Welten

- **Gebiete:** Jede Welt hat vier zusätzliche Gebiete (Nord r 20, Ost r 19, West r 19, Süd r 20) auf Bodenhöhe, verbunden durch 4 m breite Brücken mit 1,5 m Überlappung. Der Brückenzugang auf der Hauptinsel bleibt frei von Bäumen und Felsen; Kantenschutz gilt auf den Brücken.
- **Edelsteine:** Rot 1, Grün 2, Blau 5, Gold 10, Lila 25; 208–235 Wert je Welt, gespeichert je Welt (`save.jewels`). Gezeichnet als ein InstancedMesh je Farbe (5 Draw Calls). Funkel holt sie aus 2,4 m heran; Ton steigt mit Wert und Kette.
- **Kristalldrachen:** eine Statue je Gebiet (eine Geometrie, ein Draw Call), Berühren befreit (Dialog, Rastpunkt), gespeichert in `save.dragons`.
- **Eierdieb:** im Ostgebiet, flieht mit 9 m/s (Laufen 7,4, Ansturm 12,5), bleibt im Gebiet und weicht am Rand entlang aus. Gefangen per Rammstoß/Ansturm oder Feueratem aus der Nähe; gespeichert in `save.eggs`.
- **Weltentore:** Nordgebiet → nächste Welt (erst mit Leuchtkern), Südgebiet → vorige Welt. Hineinlaufen reist sofort; Ankunft 5 m vor dem passenden Tor der Zielwelt.
- Gegner der Gebiete bleiben auf ihrem Gebiet. Wolken liegen weiter draußen (120–150 m), Nebel 85–215 m, Sichtweite 320 m.
- **Heimathain (Heimatwelt):** nur in Welt 1, Insel (70, 36) r 22 östlich, Brücke auf z = 20. In der Mitte die Statue des Ältesten Ormun (Dialog beim ersten Besuch je Sitzung), im Halbkreis (r 14) sechs Levelportale zu den Welten 2–7; ein Portal ist offen, sobald `save.cores[Welt − 1]` gesetzt ist, sonst grau. Ankunft vor dem Heimtor der Zielwelt.
- **Heimtor:** in den Welten 2–7 im Südgebiet bei (−36, 70), führt in den Heimathain vor das Portal dieser Welt. Bäume, Körbe und Edelsteine halten Abstand zu allen Toren.
- **Wächter:** im Westgebiet jeder Welt ein vergrößerter Gegner der Welt (6 Treffer, größere Reichweite), gibt beim Sieg einen lila Edelstein frei; danach erscheint er nicht mehr (am Edelstein gespeichert).
- **Feueratem:** ersetzt den Windstoß optisch und klanglich (Flammenringe, Funken, Knistern); Reichweite und Treffer bleiben gleich, Laternen werden damit entzündet.
- **Sprachausgabe:** Dialogzeilen werden mit der deutschen Gerätestimme vorgelesen (Drachen tiefer, Pip höher); Einstellung „Sprachausgabe“, eingebettet über `cloud/anmacha-cloud.js`.

