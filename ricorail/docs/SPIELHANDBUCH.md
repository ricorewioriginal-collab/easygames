# Spielhandbuch – RicoRail Simulator 3D

*Deine Eisenbahn. Deine Strecken. Deine Welt.*

## Hauptmenü
| Eintrag | Inhalt |
|---|---|
| ▶ Jetzt fahren | startet sofort eine Fahrplanfahrt (Regionalexpress auf der ersten Strecke, leichte Schwierigkeit) |
| Weiterfahren | startet die letzte Fahrt neu (ein Zwischenstand mitten in der Fahrt wird nicht gespeichert) |
| Fahren | Untermenü: Freies Fahren, Fahrplanfahrt, Güterverkehr & Rangieren |
| Karriere | 7 Ränge, Erfahrungspunkte, 5 Prüfungsfahrten |
| Aufgaben | alle 64 Szenarien in 6 Kategorien |
| Stellwerk | Stellwerksszenarien und freies Stellwerk für jeden Bahnhof |
| Bahngesellschaft | Fahrzeuge kaufen, Strecken erwerben, Linien betreiben, Tage simulieren |
| Zuschauen | freie Eisenbahnwelt: Kameras, Zeitraffer, freie Kamera |
| Editor | eigene Strecken bauen, prüfen, speichern, exportieren, probefahren |
| Online | **in Entwicklung**, nicht verfügbar |

Unten: Einstellungen, Handbuch, Mitwirkende & Lizenzen, Zurück zu Easygames.

## Fahren
**Einfache Bedienung (Standard, Einstellungen → Bedienung):** nur der Hebel. Nach oben (W) = fahren, nach unten (S) = bremsen.
Richtungswender, Bremse lösen, Stromabnehmer/Hauptschalter/Motor, Türen am Bahnsteig sowie Wachsam/Sifa übernimmt das Spiel.
Auf dem Handy bleiben nur Hebel, Horn und Schnellbremsung sichtbar; am Gleisende erscheint „Zug wenden“.

**Realistische Bedienung:**
1. Richtungswender vor (R), Bremse lösen (Q).
2. Fahrhebel nach vorn (W) – auf dem Handy den Hebel am Rand nach oben ziehen.
3. Bremsen: Hebel zurück (S, Kombihebel) oder Führerbremsventil (E). Schnellbremsung: Leertaste.
4. Am Bahnsteig im Stillstand Türen freigeben (T) – sie öffnen auf der Bahnsteigseite – und vor der Abfahrt schließen (⇧T).
5. Elektrisch: Stromabnehmer (P) und Hauptschalter (U); Diesel: Motor (U); Dampf: Regler, Steuerung (, .), Feuern (B), Injektor (⇧I).

## Signale, PZB, Sifa (Spielmodell)
- Schwierigkeit: **Leicht** – ein Bremsassistent hält vor Halt zeigenden Signalen und überschreitet keine Höchstgeschwindigkeit. **Normal** – Zwangsbremsung bei mehr als 10 km/h zu schnell. **Experte** – zusätzlich das PZB-Spielmodell.
- Rot = Halt, Gelb = Halt erwarten / Langsamfahrt, Grün = Fahrt. Überfahren eines Halt zeigenden Signals führt zur Zwangsbremsung und kostet das Szenario.
- PZB-Nachbildung (nur Experte): am Vorsignal Wachsam drücken (V), danach Geschwindigkeitsüberwachung.
- Sifa: regelmäßig bestätigen (V), sonst Zwangsbremsung.
- Ersatzsignal (Z): nur bei gestörtem Signal im Stillstand, danach höchstens 40 km/h bis zum nächsten Signal.

## Güterverkehr und Rangieren
Beladen (N) / Entladen (⇧N) an Ladestellen im Stillstand, Kuppeln (K) beim langsamen Heranfahren, Entkuppeln (J) mit Auswahl der Trennstelle, Rangierfahrt (A, höchstens 25 km/h).

## Stellwerk
Startsignal antippen, dann Zielsignal. Fahrstraße wird nur eingestellt, wenn Weichen und Gleise frei sind. Startsignal erneut antippen = zurücknehmen. Weiche antippen = umstellen (nur wenn frei und nicht verschlossen).

## Kameras
1 Führerstand · 2 Verfolger · 3 Front · 4 Heck · 5 Fahrgast · 6 Streckenrand · 7 frei (nur Welt/Stellwerk/Editor). Umsehen mit Maus/Finger, Zoom mit Mausrad/zwei Fingern, Doppelklick setzt zurück.

## Weitere Tasten
M Gleisplan · Tab Zeitraffer · F8 Wiederholung der letzten Minute · F9 Bildschirmfoto · F2 Anzeige ein/aus · L Licht · ⇧L Führerstandslicht · O Wischer · X Feststellbremse · F Führerstand wechseln · Esc Pause · F1 Hilfe.

## Gamepad
Rechter Trigger fahren, linker Trigger bremsen, A Türen, B Schnellbremsung, X Horn, Y Kamera, LB Wachsam, RB Richtungswender, Start Pause, Steuerkreuz Fahr-/Bremsstufen, rechter Stick umsehen.

## Karriere
Ränge: Lokführer-Anwärter → Triebfahrzeugführer Rangier/Nebenbahn → Regionalverkehr → Güterverkehr → Fernverkehr → Hochgeschwindigkeits-Lokführer → Meister-Lokführer. Für einen Aufstieg braucht es Erfahrung und die zugehörige Prüfungsfahrt. Ränge sind Spielelemente, keine echte Qualifikation.

## Bahngesellschaft
Start mit 600.000 RicoTalern (fiktiv) und Nutzungsrecht für den Sonnenland-Express. Züge kaufen, einer Linie zuweisen (passende Traktion und Wagen nötig), Tage simulieren. Einnahmen aus Fahrgästen und Gütern, Kosten für Energie, Trassen, Wartung, Abstellung; zufällige Störungen und Sonderverkehre. Keine Echtgeld-Käufe.

## Spielstände
Drei Profile, automatische Speicherung mit Prüfung und Sicherungskopie, Export/Import als JSON. Optional über die Easygames-Cloud (Präfix `ricorail.`).

## Einstellungen
Qualität (Automatisch/Niedrig/Mittel/Hoch), Bildrate 30/60/unbegrenzt, fünf Lautstärken, Ansagen, Schwierigkeit, Touch-Hebel links/rechts, reduzierte Anzeige, Umsehen umkehren, Textgröße, Untertitel, Farbenblind-Modus, weniger Bewegung, Sprache (Englisch teilweise).

*Simulation, kein offizielles Produkt der Deutschen Bahn.*
