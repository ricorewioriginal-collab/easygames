# Spielmechanik

Simulation mit festen 60 Hz (Akkumulator), dadurch gleiches Verhalten bei 30, 60 und 120 Bildern pro Sekunde (getestet).

## Bewegung

- **Sprung:** Antippen springt niedrig, Halten höher (Sprunghöhe wird nach 0,08 s beim Loslassen gekappt).
- **Coyote Time:** 0,12 s nach dem Verlassen einer Kante darf noch gesprungen werden.
- **Sprungpuffer:** Ein Druck bis 0,14 s vor der Landung wird nach dem Aufsetzen ausgeführt (statt eines Flügelschlags knapp über dem Boden).
- **Gleiten:** In der Luft Sprung halten – deutlich langsamerer Fall.
- **Ausweichen:** Umschalt am Boden – kurzer Schub mit Unverwundbarkeit.
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

Links ein großer Stick mit Totzonenring. Rechts ein Aktionsrad: SPRUNG groß unten, FLUG oben, WIND links, ROLLE rechts. REDEN erscheint nur, wenn jemand in der Nähe ist.

## Kamera

Folgt weich, lässt sich frei drehen (Maus, Q/E, Wischen) und zoomen (Mausrad). Die Kamerahilfe dreht nach kurzer Zeit ohne manuelle Eingabe hinter Aeru (abschaltbar). Die Kamera bleibt über Boden und Plattformen. Empfindlichkeit für Maus und Touch getrennt einstellbar.

## Kampf

- **Windstoß** (F/WIND) trifft Gegner, Laternen, Kugeln und Bossschilde in Blickrichtung.
- Gegner: **Nebelkäfer** (Sprungangriff), **Sturmfunke** (schießt Kugeln), **Stille-Schatten** (weicht aus, nur nach dem Angriff verwundbar).
- Jeder Angriff wird angekündigt (roter Kristall über dem Gegner), dann Angriff, dann Erholung.
- Nach einem Treffer kurze Unverwundbarkeit. Besiegte Gegner kehren erst nach 20 s zurück und nur, wenn Aeru weit genug weg ist.
- Tod: zurück zum letzten Rastpunkt (graue Steinplatte), volle Herzen, Questfortschritt bleibt.

## Bosse

- **Vesper** (Sternenwarte, 6 Treffer, 3 Phasen): Wellen überspringen, Warnkreisen ausweichen, bei offenem Schild zuschlagen.
- **Die Stille** (Morgenruinen, 9 Treffer, 3 Phasen): In Phase 2 müssen schwebende Anker im Flug zerstört werden (temporäre Aufwinde helfen), Phase 3 mit Doppelwellen.
- Ein Bosskampf beginnt erst, wenn der Questschritt aktiv ist und Aeru die Arena betritt. Wer stirbt, beginnt am Arenaeingang; der Boss wird nur auf den Beginn der aktuellen Phase zurückgesetzt.

## Quests und Orientierung

- Zustände: gesperrt, verfügbar, aktiv, Teilziel erfüllt, bereit zur Abgabe, abgeschlossen.
- Zielfeld mit Kapitel, Ziel, Fortschritt, Begründung und **Kompass** (Pfeil + Entfernung). Goldener Lichtstrahl über dem Ziel, Marker auf der Minikarte.
- **Tagebuch** (J oder ☰): aktuelles Ziel, Kapitelübersicht, erledigte Schritte, Nebenquests. Künftige Kapitel bleiben verborgen.
- Laternen der Liedinsel müssen in der richtigen Reihenfolge geweckt werden; ein Fehler löscht sie wieder, das Lied wird erneut angezeigt.

## Sammelobjekte und Upgrades

144 Himmelssplitter (24 pro Insel), optional. Gesammelte Splitter bleiben nach dem Laden gesammelt.

| Splitter | Belohnung |
|---|---|
| 24 | Flügelkraft +25 |
| 48 | zusätzliches Herz |
| 72 | größere Windstoß-Reichweite |
| 96 | zusätzliches Herz |
| 120 | 12 % schnellerer Flug |
| 144 | Sternenglanz: unbegrenzte Flügelkraft (Steigen, Gleiten, Flügelschlag) und goldene Flugspur |

## Einstellungen (Pause → Einstellungen)

Lautstärke, Musik, Grafikqualität, Kamera- und Touchempfindlichkeit, Kamerahilfe, Flughilfe, Zielhilfe (Lichtstrahl/Kompass), reduzierte Bewegung, Textgeschwindigkeit, große Schrift, Leistungsanzeige, Vollbild. Gespeichert unter `aeru-settings`.

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
