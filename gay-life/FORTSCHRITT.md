# GayLife – Fortschritt

Zentrale Fortschrittsdatei. Jede Sitzung trägt hier ein, was **tatsächlich** umgesetzt und geprüft ist, was offen ist und womit es weitergeht. Architektur und Meilensteine: [`PLAN.md`](PLAN.md).

## Stand nach Durchgang 13 (11.10.2026): Ladebildschirm, Startmenü, Konsolen-Steuerung

### Neu umgesetzt

- **Ladebildschirm** (`#boot`, `js/start.js`): Logo, Fortschrittsbalken mit echten Schritten (Spielstand geladen, Grafik erkannt, bereit) und wechselnden Tipps. Beim Start der Stadt erscheint er erneut, während die 3D-Welt gebaut wird.
- **Startmenü im Konsolen-Stil**: Spielerkarte (Figur, Level, Glitzer, Tag, Geld) und Menü Spiel starten/Weiterspielen, Charakter, Minispiele, Mehrspieler, Einstellungen (Ton, Grafik, Touch-Steuerung, Vollbild, Speichern), Info & Hilfe. Bedienung per Pfeiltasten/Enter/Esc, Maus oder Touch. Gamepad ist nicht eingebaut.
- **Pausenmenü** (Esc oder Y-Taste): Weiter, Charakter, Ton, Speichern, Startmenü. Die Stadt läuft währenddessen weiter (keine echte Pause).
- **Smartphone-Steuerung**: fester Stick links (360 Grad, analog, Totzone), vier Tasten rechts in Rautenform: A Aktion, B Orte, X Handy, Y Menü. Kamera durch Wischen auf dem Bild. Erscheint automatisch bei Fingerbedienung, in den Einstellungen erzwingbar oder abschaltbar (`settings.pad`). Der alte schwebende Joystick entfällt.
- **Fehlerbehebung**: Die Minispiel-Übersicht (`menuHub`) stürzte wegen der Sauna-Karte (Figur Torsten) ab; behoben.
- Überspringen des Startmenüs für Tests und Direktlinks: `window.__GL_SKIP_TITLE`, `?quick=1` oder `#join=PIN`.

### Geprüft

- Neuer Testabschnitt 14 (Startmenü, Einstellungen, Minispiele, Charakter, Pause, Stick in 5 Richtungen, vier Tasten, Querformat) sowie der angepasste Touch-Abschnitt 3: grün, einzeln gelaufen.
- Gesamtlauf: beim letzten Versuch brach der Mehrspieler-Teil (Besuch, Zeitüberschreitung bei langsamem Lauf) ab, ein vollständiger grüner Gesamtlauf liegt für diesen Stand nicht vor. Die Abschnitte davor liefen grün.
- Nicht auf echten Geräten getestet: Fingergefühl, Größe der Tasten, Safe-Area auf echten Handys.

### Offen

- Echter Zwei-Geräte-Test Mehrspieler, Gewitter/Schnee, LOD, Menschen-Playtest, Gamepad.

## Stand nach Durchgang 12 (11.10.2026): Club Glitzer als Innenraum

### Neu umgesetzt

- **Begehbarer Club** (`js/club.js`, `GL.club`, `W.inside = 2`; die Wohnung bleibt 1): Innenraum abseits der Stadt (x 0, z 450) mit leuchtender 6×6-Tanzfläche im Takt des Abendstils, Discokugel, zwei Strahlen, DJ-Pult mit DJ, Bar mit Bruno, Sitzecke und sechs tanzenden Gästen. Betreten über das Club-Menü („Club betreten“, Eintritt wie bisher einmal pro Nacht), nur 20–5 Uhr; um 5 Uhr schließt der Club und man steht draußen.
- **Stellen im Raum**: Tanzfläche (Tanzen), Bar (Getränke), DJ-Pult (Club-Menü inkl. Gruppentanz), Tür.
- **Eigene Musik**: Der Beat-Generator spielt im Club durchgehend im Stil des Abends (stoppt beim Verlassen, läuft nach dem Tanzen weiter).
- **Mehrspieler**: Im Club gilt der Ort „c“, Mitspieler sehen sich dort.
- Angepasst: Wohnung/Möbel/Besuch prüfen jetzt `inside === 1`; Tram/Handy-Reise verlassen auch den Club.

### Tests Durchgang 12

- e2e Abschnitt 13: tagsüber zu, Eintritt, Innenraum, Musik, Stellen im Raum, Tanzen ohne zweite Zahlung, Bar, Verlassen, Schließzeit. Bildschirmfoto angesehen (Software-WebGL). Gesamtlauf: 273 Prüfungen grün.

### Weiterhin offen

- Kein eigener Innenraum für andere Orte (Café, Gym …), Gewitter/Schnee, LOD für ferne Figuren, echte Zwei-Geräte-Tests, Playtest durch Menschen.

## Stand nach Durchgang 11 (11.10.2026): Viertel-Bewohner mit Tagesplan und Dates

### Neu umgesetzt

- **14 Bewohner** (`js/residents.js`, `GL.res`), zwei pro Viertel, alle erwachsen (24–62 Jahre), mit Beruf, Charakter, Interessen, Abneigungen, Lieblingssatz und zwei Geschichtskapiteln.
- **Eigener Tagesplan** je Person, getrennt für Wochentag und Wochenende: sie gehen zwischen den vier Orten ihres Viertels, laufen sichtbar dorthin und sind nachts zu Hause (unsichtbar, nicht ansprechbar). Handy-App „Bewohner“ zeigt nach dem Kennenlernen, wo die Person gerade ist.
- **Ansprechen**: Plaudern (Freundschaft +4 pro Tag), ein Thema pro Tag (Vorlieben wirken), gemeinsam Zeit am Ort verbringen (Ortswirkung, Kosten für beide), persönliche Geschichte ab Freundschaft 25 und 55.
- **Dates**: Einladung ab Freundschaft 30, nur bei Interesse der Person und ohne eigene Beziehung; die Person entscheidet frei (Laune, Interessen, Freundschaft), höchstens eine Frage pro Tag, Absage sperrt zwei Tage, nach drei Absagen endet die Anfrage. Das Date besteht aus drei Entscheidungen (zuhören, Stille aushalten, ehrlich fragen) mit Auswirkung auf die Romantik; Ungefragtes Näherkommen wird schlecht bewertet. Intimes nur angedeutet (Umarmung, Kuss).
- Spielstand: `res` (lazy).

### Grenzen (ehrlich)

- Die Bewohner haben **keinen** Beziehungsstatus, keinen Einzug und keine Nachrichten; die ausführlichen Beziehungen gibt es weiter nur mit den fünf Kiez-Dating-Figuren.
- Ihre Laufwege sind gerade Linien (keine Wegfindung um Gebäude).

### Tests Durchgang 11

- Gesamtlauf: 262 Prüfungen grün. e2e Abschnitt 12 (Anzahl, Tagesplan, Sichtbarkeit tags/nachts, Plaudern, Thema, gemeinsam, Geschichte, Date, Absage, Beziehung, Freundschaft-nur, Handy-App).

## Stand nach Durchgang 10 (11.10.2026): Jobs und Veranstaltungen (Reste von M4/M5)

### Neu umgesetzt

- **Zwei weitere Jobs** (`js/jobs.js`): **Performer** im Karaoke Mikro-Mimosa und **Eventmanager** in der Festwagen-Werkstatt (je 4-Stunden-Schicht mit drei Situationen, Stufen und Titel, Lohn wie die anderen Jobs). Ein Gebäude kann jetzt mehrere Jobs und Zusatz-Menüpunkte (`GL.jobs.extras`) haben. Der **Stylist** ist die dritte Stufe des Verkäufers.
- **Karaoke-Wettbewerb** (`js/events.js`, `GL.events`): jeden Freitag 19–23 Uhr, drei Lieder (sicher, Ballade, Disco-Hit, Erfolg hängt von Laune und Performer-Stufe ab), gegen drei Stammgäste, Platz 1–4 mit Preis (60/30/15 €, Glitzer, Kontakte). Einmal pro Abend, freiwillig.
- **Pride-Parade**: jeder 28. Tag (Sonntag) 12–18 Uhr, Treffpunkt Regenbogen-Bühne; mitgehen bringt Konfetti, Kontakte +25, Stress −10, 40 Glitzer. Einmal pro Tag.
- Handy-App **„Events“** mit den nächsten Terminen. Spielstand: `events` (lazy).

### Tests Durchgang 10

- Gesamtlauf: 247 Prüfungen grün. Zusätzlich behoben: Mehrspieler-Besuch konnte auf langsamen Geräten zu früh enden (Wartezeit beim Szenenwechsel). e2e Abschnitt 11: Menüs, Wettbewerb mit Rangliste, einmal pro Abend, nicht samstags, Performer-Schicht bezahlt, Eventmanager möglich, Parade, Events-App.

### Weiterhin offen

- Club-Innenräume als begehbare 3D-Tanzfläche (Musik ist da, Raum nicht), Viertel-Bewohner mit eigenem Tagesplan und Dates, Gewitter/Schnee, LOD für ferne Figuren, echte Zwei-Geräte-Tests des Mehrspielers, Test von Menschen auf echten Handys.

## Stand nach Durchgang 9 (11.10.2026): Politur (M10): Wetter, Ton, Leistungswächter

### Neu umgesetzt

- **Wetter** (`js/weather.js`, `GL.weather`): ein Wetter pro Spieltag (sonnig, bewölkt, Regen, Nebel), aus der Tageszahl berechnet (kein Spielstand nötig, auf allen Geräten gleich). Draußen ändert es Licht, Nebelweite, Himmel und Wolken, Regentropfen (260 Linien um die Figur) und die Laune (Sonne +2, Regen −3); in Wohnungen ohne Wirkung. Handy-App „Wetter“ mit heute und den nächsten drei Tagen. Hinweis zum neuen Tag.
- **Ton ohne Dateien** (`js/audio.js`, `GL.audio`): Club-Musik aus einem kleinen Beat-Generator je Tanzstil (Kick, Hi-Hat, Bass, Melodie), läuft nur solange das Tanz-Menü offen ist; Regenrauschen draußen bei Regen. Beides folgt dem Ton-Schalter.
- **Leistungswächter** (`js/perf.js`, `GL.perf`): Im Qualitäts-Modus „Auto“ senkt er die Auflösung stufenweise, wenn die Bildrate zweimal in Folge unter 24 liegt; hebt nie von selbst an; feste Qualität bleibt unangetastet.
- Neues Ereignis `skyAfter` (nach der Himmelsberechnung), `muted` (Ton-Schalter).

### Tests Durchgang 9

- e2e Abschnitt 10: Wetterverteilung, Laune, Regen sichtbar/Nebel näher/Rauschen, drinnen nichts, Handy-App, Club-Musik beginnt und endet, Ton aus, Leistungswächter. Regen per Bildschirmfoto angesehen. Gesamtlauf: 236 Prüfungen grün.
- **Ehrlich**: Hörbarkeit und Klang der Musik und des Regens wurden nicht von Menschen geprüft (nur, dass die Töne geplant werden). Echte Bildraten auf Handys nicht gemessen.

### Offen

- Club-Innenräume mit Tanzfläche in 3D, Stylist/Eventmanager/Performer, Viertel-Bewohner mit Dates, Pride-Event, Gewitter/Schnee, LOD für ferne Figuren.

## Stand nach Durchgang 8 (11.10.2026): 3D-Charaktereditor (M9)

### Neu umgesetzt

- **3D-Vorschau** im Editor („Dein Look“): drehbare Figur (Ziehen mit Maus/Finger, sonst langsame Drehung) auf eigener Zeichenfläche; wird beim Schließen freigegeben. Ohne WebGL bleibt die 2D-Vorschau. Die Welt pausiert, solange der Editor offen ist (spart Rechenzeit).
- **Körperbau** (schlank, normal, kräftig), **Größe** (klein, mittel, groß) und **Tattoos** (Armband, Regenbogen-Armband, Herz, Stern) als neue Look-Felder `build`, `h`, `tat`; wirken auch auf NPC-gleiche Figuren, Mehrspieler-Mitspieler und die Wohnung (alle nutzen `makePerson`). Alte Spielstände bekommen die Standardwerte (normal, mittel, kein Tattoo).
- **Outfits speichern**: 3 Plätze (Frisur, Haarfarbe, Bart, Extra, Oberteil, Farbe, Tattoo); Anziehen prüft, ob die Teile gekauft sind. Spielstand: `outfits`.
- Mehrspieler-Prüfung (`cleanLook`) kennt die neuen Felder; fehlende Werte werden zu „normal“.

### Tests Durchgang 8

- e2e: Vorschau-Zeichenfläche, Standardwerte, Auswahl, Outfit speichern/anziehen, Freigabe der Vorschau; Gesamtlauf 225 Prüfungen grün. Ein Bildschirmfoto der Vorschau wurde angesehen (Software-WebGL). Nicht von Menschen getestet.

### Offen

- Kein Gesichts-Feinschliff (Nase, Mund), keine Schuhe/Hosen zur Wahl, Tattoos nur an Arm und Gesicht.

## Stand nach Durchgang 7 (11.10.2026): Mehrspieler per PIN und QR-Code (M8)

### Neu umgesetzt

- **Beitritt nur über PIN oder QR-Code**: Raum öffnen zeigt eine 6-stellige PIN und einen QR-Code (Link `#join=PIN`); wer den Link scannt oder die PIN tippt, kommt in den Raum (bis 4 Leute, direkt von Gerät zu Gerät über PeerJS).
- **Ort-Filter** (`GL.core`): Du siehst nur Leute am selben Ort (Pride District, Viertel, Wohnung); Positionen werden relativ zum Ort gesendet.
- **Erweiterungs-Umschlag** `{t:'x', k, d, to}` (`GL.mp.send`): Art, Größe und Ziel werden geprüft; der Gastgeber leitet weiter.
- **Besuch in der Wohnung** (`js/multi.js`, `GL.multi`): nur mit Zustimmung des Gastgebers; Ablehnen wird höflich respektiert; der Gast sieht dessen Einrichtung, der Besuch endet beim Verlassen.
- **Gruppentanz im Club**: alle tanzen dieselben drei Songs (gleicher Zufallswert), gemeinsame Rangliste; Bonus (Kontakte +10, Laune +4, +5 Glitzer), wenn alle mindestens 3 Punkte haben.
- **Gruppenfoto und Foto-App**: Countdown für alle am Ort, Bild nur lokal (Download-Knopf), nicht hochgeladen, nicht gespeichert. Handy-Apps „Zusammen“ und „Fotos“.
- Fehler behoben: `GL.emit` gab nur zwei Argumente weiter; jetzt drei.

### Tests Durchgang 7

- `tests/e2e.mjs` Abschnitt 9 (Mehrspieler) mit `tests/fakepeer.js` (nachgebautes PeerJS über BroadcastChannel); QR-Bibliothek per Umgebungsvariable `QRCODE`. Gesamtlauf: 220 Prüfungen grün.
- **Ehrlich**: Der echte PeerJS-Vermittlungsserver und echte zwei Geräte wurden **nicht** getestet (Sandbox ohne Zugang). Ein Test mit zwei echten Geräten steht aus.

### Offen

- M9 Charaktereditor 3D, M10 Politur/Wetter/Audio, Club-Innenräume mit eigener Musik, Stylist/Eventmanager/Performer, Viertel-Bewohner mit Dates, Pride-Event.

## Stand nach Durchgang 6 (11.10.2026): Hauptgeschichte

### Neu umgesetzt (M7)

- **„Ein Leben in allen Farben“ (`js/story.js`, `GL.story`)**: Das Regenbogen-Zentrum von Tante Gerda soll einem Investor weichen. Ab Tag 3 spricht Gerda dich an (freiwillig). Fünf Kapitel mit messbaren Zielen: (1) drei Unterstützer (Freundschaft ab 30), (2) 200 € Spenden (bei Gerda oder Benefiz-Tanzabend im Club), (3) Auftritt vor dem Stadtrat (laut / ruhig / Medien, Wirkung hängt von deiner Lage ab), (4) vier Viertel per Tram besuchen und das Straßenfest planen (Musik, Essen oder selbstgemacht), (5) Abstimmung.
  - **Drei Enden** (Zentrum gerettet, Kompromiss, Zentrum verloren), abhängig von Unterstützern, Spenden, Partner, Auftritt und Fest. Vor der Abstimmung zeigt Gerda deine Chancen, du kannst weiter vorbereiten. Das Ende gibt Belohnung und dauerhaft Stimmungsbonus (+4 / +2 / 0).
  - **Freies Weiterspielen**: Nach dem Ende gibt es täglich einen Kaffee mit Gerda (Kontakte +12, Stress −8). Handy-App „Geschichte“ zeigt Kapitel, Ziele und Entscheidungen.
- Neue Ereignisse `district` (Tram-Fahrt) und `danced` (Tanzabend). Spielstand: `story`.

### Tests Durchgang 6

`gay-life/tests/e2e.mjs`: **197 Prüfungen, alle bestanden**, keine Konsolenfehler. Neu: Einstieg erst ab Tag 3, alle fünf Kapitel mit Zielprüfung, Spenden, Benefiz, Entscheidungen, Tram-Besuche, Abstimmung mit Punktzahl, Ende Kompromiss, Stimmungsbonus, Kaffee-Limit, Geschichte-App, Speichern/Laden. Die Enden „gerettet“ und „verloren“ sind über die Punktzahl berechnet, aber nicht einzeln durchgespielt.

Einschränkungen: Die Geschichte wird in Dialogen und Menüs erzählt, ohne Filmsequenzen oder eigene Orte; Wortlaut und Balance nicht von Menschen probegespielt. Nur eine Hauptgeschichte, keine zweite Handlungslinie.

### Weiterhin offen

M2-Rest (Wetter, Bewohner), M4-Rest, M5-Rest, M8, M9, M10.

---

## Stand nach Durchgang 5 (11.10.2026): Rainbow City – sieben Viertel

### Neu umgesetzt (M2 weitgehend)

- **Viertel (`js/districts.js`, `GL.dist`)**: Neben dem Pride District (dem bisherigen Regenbogenkiez) gibt es **Downtown, Neon Nights, Rainbow Beach, Love Gardens, Fashion Boulevard, Rainbow Heights und Crystal Coast**. Jedes hat eigenen Boden, drei Gebäude und einen Kiosk mit je einem Ort mit echter Wirkung (Zeit, Geld, Bedürfnisse, Öffnungszeiten), eine Tramhaltestelle und zwei ansprechbare Passanten.
  - **Laden/Entladen**: Ein Viertel wird erst beim ersten Besuch gebaut (eine Gruppe) und ist nur sichtbar, solange man dort ist. Bäume, Palmen, Blumen, Neonmasten und Laternen sind instanziert; Laternen/Fenster leuchten nachts.
  - **Tram**: Haltestelle am Brunnenplatz und in jedem Viertel, außerdem Handy-App „Tram“. 3 €, 20 Minuten. Die Handy-Karte bringt auch aus einem Viertel zum Ziel im Pride District.
  - **Orte mit Wirkung**: u. a. Kino, Streetfood, Bibliothek; Ramen, Spielhalle, Straßentanz; Schwimmen, Sonnenliege, Beachvolleyball, Eis; Picknick, Blumenhändlerin, Rosenlaube; Anprobe (Kleiderschrank), Friseur; Dachterrasse, Sky-Lounge, Dach-Yoga; Angeln (Fisch fürs Kochen), Leuchtturm (einmalig +10 Glitzer), Strandcafé.
  - **Blumenstrauß**: Von der Blumenhändlerin (6 €, höchstens 5) und beim Entschuldigen in der Dating-Menü kostenlos nutzbar.
- Nach dem Neuladen steht man immer im Pride District. Spielstand: `life.flowers`.

### Tests Durchgang 5

`gay-life/tests/e2e.mjs`: **177 Prüfungen, alle bestanden**, keine Konsolenfehler. Neu: Katalog, Haltestelle, Fahrt (Preis, Zeit, Grenzen), Laden/Entladen, Orte nutzen und Öffnungszeiten, zu wenig Geld, alle sieben Viertel erreichbar, Angeln, Leuchtturm, Blumen, Tram-App, Karte aus dem Viertel, Neuladen.

Einschränkungen: Viertel sind schlicht aufgebaut (Quader, ein Layout-Schema), ohne eigene Bewohner im Tagesablauf, ohne Dating-Orte und ohne Wetter. Nicht probegespielt und nicht auf echten Geräten geprüft.

### Weiterhin offen

M2-Rest (Wetter, Bewohner mit Tagesplänen in den Vierteln, Dates dort), M4-Rest, M5-Rest, M7, M8, M9, M10.

---

## Stand nach Durchgang 4 (11.10.2026): Jobs und Nachtleben

### Neu umgesetzt (M5 teilweise, M4 teilweise)

- **Jobs (`js/jobs.js`, `GL.jobs`)**: Neben dem Barkeeper vier Jobs mit eigener Schicht: **Verkäufer** (Boutique Fabelhaft), **Fitnesstrainer** (Muckibude), **Fotograf** (Studio Klappe Auf), **DJ** (Regenbogen-Bühne, nachts, ab Barkeeper-Stufe 2). Beim Betreten des Gebäudes: „Arbeiten“ oder das alte Minispiel. Eine Schicht = 4 Stunden, drei Situationen mit je drei Antworten (0–2 Punkte, 5 Situationen pro Job zufällig gezogen). Lohn = Stundenlohn nach Stufe + Leistungsbonus × Laune; Erfahrung → Stufe 1–8 und Titel (z. B. Aushilfe → Filialleiter). Öffnungszeiten, höchstens 2 Schichten pro Tag, nicht bei Erschöpfung. Anzeige in der Finanz-App.
- **Nachtleben (`js/nightlife.js`, `GL.night`)**: Club Glitzer ist 20–5 Uhr offen, Eintritt je nach Themenabend (Ruhige Bar … Rainbow Night/Glitzer-Nacht am Wochenende, einmal pro Nacht bezahlt). Beim Betreten: Barkeeper-Minispiel, **Tanzen** (3 Songs, passende Bewegung zum Musikstil wählen → Kontakte, Stress, Energie), **Bestellen** (Cocktail 8 €, höchstens 3 pro Nacht, Wasser gratis).
- Spielstand: `jobs.<id>`, `jobs.day`, `jobs.night` (lazy angelegt, alte Stände unverändert).

### Tests Durchgang 4

`gay-life/tests/e2e.mjs`: **155 Prüfungen, alle bestanden**, keine Konsolenfehler. Neu: Job-Menü, Schicht mit Lohn und Zeit, Tageslimit, Öffnungszeiten, Erschöpfung, DJ-Voraussetzung, Stufen, Club-Themenabend, Tanzen, Eintritt einmal pro Nacht, Cocktail-Limit, Türsteher, Speichern/Laden.

Einschränkungen: Keine selbst erzeugte Musik und keine Club-Innenräume (bleibt in M4 offen), keine Themenparty-Dekoration, Pride-Event, Karaoke-Wettbewerb. Weitere Jobs (Stylist, Eventmanager, Performer) und Beförderungen mit Gehaltsverhandlung fehlen. Texte und Balance nicht von Menschen probegespielt.

### Weiterhin offen

M2, M4-Rest, M5-Rest, M7, M8, M9, M10.

---

## Stand nach Durchgang 3 (11.10.2026): Wohnen

### Neu umgesetzt (M6)

- **Möbel (`js/furniture.js`, `GL.furn`)**: Am Laptop in der Wohnung: Speichern, **Möbel kaufen** (9 Stücke, 30–150 €), **Einrichten** (8 feste Stellflächen, Möbel verschieben oder Platz leeren), **Miete & Vermieter**. Gekaufte Möbel stehen als 3D-Modelle aus einfachen Quadern im Raum und haben Kollision.
  - Benutzbar: Bücherregal (Lesen), Hantelbank (Trainieren, nur wenn nicht erschöpft), Plattenspieler, Kaffeemaschine (höchstens 3 Tassen pro Tag), Aquarium, Zocker-Sessel, Yogamatte. Jede Nutzung kostet Spielzeit und verändert Bedürfnisse.
  - Dekoration (Aquarium, Regenbogenlampe, Skulptur) hebt die Stimmung (Bonus höchstens +6).
- **Miete**: 70 € pro Woche, montags abgebucht (erste Abbuchung Tag 8). Fehlt das Geld, wird sie zur Schuld mit Stress; die Schuld wird beim nächsten Montag mitbezahlt, sobald das Geld reicht, oder am Laptop. Anzeige in der Finanz-App.
- **Gäste und Partner**: Ein Date „Bei dir zu Hause“ lässt die Figur zur Termin­zeit in der Wohnung stehen (ansprechbar, Date-Menü). **Zusammenziehen** (Partner, Romantik ≥ 75, ≥ 3 Dates; Zusage ab Romantik 80): Partner ist abends und morgens in der Wohnung, schläft mit, Miete halbiert (40 €). Trennung lässt ihn ausziehen.
- Spielstand: `home: { own, placed, partner, rentDay, debt }` (alte Stände werden ergänzt).

### Tests Durchgang 3

`gay-life/tests/e2e.mjs`: **135 Prüfungen, alle bestanden**, keine Konsolenfehler. Neu: Katalog, Kaufen (Doppelkauf, zu wenig Geld), Aufstellen/Verschieben/Leeren samt Kollisionen, Benutzen (Lesen, Kaffee-Limit, Erschöpfung), Dekorationsbonus, Miete (Montag, keine Doppelbuchung, Schuld, Nachzahlung), Finanz-App, Date zu Hause mit Gast, Zusammenziehen, Trennung, Speichern/Laden.

Einschränkungen: Optik der Möbel ist schlicht (Quader), nicht von Menschen probegespielt; keine größeren Wohnungen und keine Räumung bei hohen Schulden (nur Stress).

### Weiterhin offen

M2, M4, M5, M7, M8, M9, M10 wie unten. Nächster Schritt: Nachtleben (M4) und Jobs (M5).

---

## Stand nach Durchgang 2 (11.10.2026): Dating, Tagesabläufe, Nachrichten

### Neu umgesetzt

- **Tagesabläufe (`js/people.js`)**: Alle 12 Figuren haben einen Plan nach Uhrzeit und Werktag/Wochenende (z. B. Jonas werktags 8–13 Uhr im Café, abends im Park, nachts im Club; Torsten im Strandbad). Wer „zu Hause“ ist, ist unsichtbar und nicht ansprechbar. Kai und Dennis (Auftraggeber) stehen tagsüber am Brunnen. Termine überschreiben den Plan.
- **Dating (`js/dating.js`)**: Fünf Dating-Figuren (Jonas, Mehmet, Luca, Kai, Dennis) mit Beruf, Charakter, Ziel, Vorlieben/Abneigungen, Lieblingssätzen und einer Geschichte in drei Kapiteln (freigeschaltet über Tiefes Gespräch ab Freundschaft 20/45/70). Beim Ansprechen öffnet sich ein Menü: Quatschen (Thema wählen, Reaktion nach Vorlieben), Tiefes Gespräch, Kompliment, Flirten, Zum Date einladen, Beziehung ansprechen, Entschuldigen/Blumen, Beziehung beenden, „Anliegen und Aufträge“ (die alten Aufträge bleiben).
  - **Zustimmung und Grenzen**: Flirt wird von der Figur entschieden (Freundschaft, Romantik, Passung, Stimmung, Tageswert). Ablehnung wird respektiert: Abstand von 2 Tagen, nach drei Absagen bleibt Flirten gesperrt. Dennis ist anfangs nicht bereit und sagt sanft ab, nach seiner Geschichte ist er offen. Küssen und „gemeinsam nach Hause“ gibt es nur mit Zustimmung (Romantik ab 45 bzw. feste Beziehung ab 70, nur angedeutet per Szenenwechsel).
  - **Dates**: Einladung mit Ort (Café, Park, Karaoke, Strandbad, Club) und Zeit, Termin im Kalender, Figur wartet zur Zeit am Ort, drei Gesprächsszenen mit Wahlmöglichkeiten, Kosten, Ergebnis, Abendabschluss, Nachricht danach. Verpasste Dates senken Romantik/Freundschaft.
  - **Beziehung**: Partnerschaft ab Romantik 65 und zwei Dates. Wer fünf Tage keinen Kontakt hält, bekommt Streit (Nachricht mit Antwortmöglichkeiten); ohne Versöhnung innerhalb von vier Tagen trennt sich die Figur. Ex-Status mit 14 Tagen Abkühlzeit. Erinnerungen an wichtige Ereignisse werden gespeichert und in den Kontakten gezeigt.
- **Nachrichten (`js/messages.js`)**: Nachrichten mit Antwortmöglichkeiten, zeitverzögerte Antworten, Abzeichen am Handy.
- **Handy-Apps** (`js/datingapp.js`): Nachrichten, Dating (fiktiv, nur im Spiel: eigenes Interessenprofil, fünf Profile mit Passung, Nachricht schreiben, Treffen vorschlagen), Kalender (Termine, Absagen, Verlauf). Aufgaben zeigen das nächste Date, Kontakte zeigen Status, Aufenthaltsort und Erinnerungen.
- Neues Ereignis `talkMenu`, `phoneTasks`; Spielstand um `msgs`, `cal`, `dating` erweitert (alte Stände werden beim Laden ergänzt).

### Tests Durchgang 2

`gay-life/tests/e2e.mjs`: jetzt **109 Prüfungen, alle bestanden**, keine Konsolenfehler. Neu geprüft: Tagesplan und Unsichtbarkeit nachts, Dating-App (Profil, Passung, Nachricht, verzögerte Antwort, Treffen), Kalender und Aufgaben, Termin und Anwesenheit am Ort, Date mit drei Szenen und Kuss, Themenreaktionen, Kapitel der Geschichte, Flirt mit Ablehnung/Sperre/Tageslimit, Dennis, Einladung, verpasstes Date, Beziehung, Streit, Versöhnung, Trennung, Schlussmachen, Absagen, alte Aufträge über das Menü, Speichern/Laden.

Einschränkungen: Wortlaut und Balance (Schwellen, Punkte) sind nicht von Menschen probegespielt; die Tests prüfen Mechanik, nicht Spielspaß. Der 3D-Darstellung der Dates (z. B. gemeinsames Sitzen im Café) fehlen Animationen.

### Weiterhin offen

M2 (weitere Viertel), M4 (Club-Innenräume, Tanzen, Bestellsystem, Themenpartys), M5 (weitere Jobs), M6 (Möbel, größere Wohnungen, Zusammenziehen, Gäste/Dates zu Hause, Miete), M7 (Hauptgeschichte), M8 (Mehrspieler-Ausbau), M9 (3D-Editor, Körperbau, Outfits speichern), M10 (Politur, Fotos-App, Wetter, LOD). Weitere Dating-Figuren und Geschichten über Kapitel 3 hinaus fehlen.

---

## Stand nach Durchgang 1 (11.10.2026)

### Umgesetzt

**Technik**
- Das Spiel ist aus der Einzeldatei in Module unter `js/` aufgeteilt (siehe PLAN.md). Der alte Kern liegt fast unverändert in `js/core.js` und ist an einen Ereignisbus angebunden.
- Spielstand Version 2 mit Migration: alte Stände (v1) behalten Name, Look, Glitzer, Käufe, Aufträge, Sterne, Dates, Club und Einstellungen. Vor der Umstellung wird der alte Stand einmalig unter `anmachaGayLife_v1backup` gesichert. Cloud-Speicher funktioniert unverändert über denselben Schlüssel.
- Grafikqualität im Handy (Automatisch/Niedrig/Mittel/Hoch: Auflösung und Sichtweite). Automatisch wählt auf Touch-Geräten „Mittel“ (höchstens Pixelverhältnis 1).
- Vollbild-Knopf (⛶, Taste F), Tastenkürzel P/Tab (Handy), M (Karte), Esc (schließen).

**Alltag**
- Uhrzeit, Wochentag und Tageszähler; ein Tag dauert 16 Minuten in der Stadt.
- Bedürfnisse Energie, Satt, Hygiene, Kontakte, Stress und daraus die Stimmung. Werte sinken langsam; Warnungen kommen einmal und erst wieder, wenn sich der Wert erholt hat. Folgen: sehr müde = langsamer laufen, Türsteher lässt nicht zur Schicht; Stimmung beeinflusst das Trinkgeld.
- Alle 14 alten Minispiele zählen als Aktivität (Zeit vergeht, Bedürfnisse ändern sich, z. B. Sauna: Hygiene +25, Stress −20).

**Geld und Arbeit**
- Euro-Konto (Start 150 €, alte Stände bekommen bis zu 250 € Bonus aus bisherigem Club-Trinkgeld) mit Buchungsliste.
- Späti Lecker (neues Gebäude südöstlich vom Platz): Brezel, Kaffee, Smoothie, Nudelbox, Lebensmittel zum Kochen.
- Barkeeper-Job: Jede Schicht im Club Glitzer (bestehendes Minispiel) zahlt Stundenlohn × 4 plus Trinkgeldanteil × Laune, kostet 4 Stunden und Energie, bringt Erfahrung und Beförderungen (mehr Stundenlohn).

**Wohnen**
- „Dein Apartment“ ist betretbar (Innenraum mit Bett, Nachttisch, Kleiderschrank, Schreibtisch mit Laptop, Dusche, Küche mit Herd und Kühlschrank, Sofa, Fernseher, Teppich, Pflanzen, Fenster mit Tag-/Nachtbild).
- Benutzbar: Schlafen (nachts bis 7 Uhr, tagsüber Nickerchen), Duschen, Kochen (verbraucht Lebensmittel), Fernsehen, Kleiderschrank (Editor), Laptop (speichern), Tür (verlassen). Darstellung als Szenenwechsel mit Abblenden; Dampf in der Dusche, glühende Herdplatten, laufender Fernseher.
- Wer in der Wohnung speichert, startet beim nächsten Mal wieder dort.

**Soziales und Handy**
- Kontakte: Jedes Gespräch mit einem NPC legt einen Kontakt an; das erste Gespräch pro Tag erhöht die Freundschaft (Stufen: neu, bekannt, befreundet, eng).
- Handy (📱): Status, Aufgaben (Hauptauftrag, Nebenaufträge, Haustiere, Alltagstipps, Sterne), Karte (Draufsicht mit Standort, Tram zu jedem Ort für 10 Spielminuten; ersetzt die alte Ortsliste), Kontakte, Finanzen, Einstellungen (Qualität, Ton, Vollbild, Speichern, Minispiel-Übersicht, Steuerungshilfe).
- Status-Leiste in der Stadt: Wochentag, Uhrzeit, Kontostand, Bedürfnisse, Stimmung (antippen öffnet den Status).

### Ausgeführte Tests

`gay-life/tests/e2e.mjs` (Playwright, Chromium headless mit SwiftShader-WebGL, Three.js r128 lokal eingespielt), Lauf vom 11.10.2026: **63 von 63 Prüfungen bestanden**, keine Konsolenfehler. Geprüft werden:
- Neustart, Status-Anzeige, Einführung
- Laufen mit W, Kamera mit Q, Uhr läuft, Tageswechsel, Bedürfnisse sinken, Hunger-Warnung
- Späti: Menü, Kauf, Geld reicht nicht
- Wohnung betreten, Schlafen, Duschen, Kochen, Fernsehen, Kleiderschrank, Laptop, Verlassen
- Türsteher-Sperre bei Erschöpfung, Lohnberechnung einer Schicht
- alle 14 Minispiele öffnen und kehren zurück, Quiz zählt als Aktivität
- Gespräch legt Kontakt an
- alle Handy-Apps, Qualitätsstufe, Tram-Reise, Tasten M/Esc, Vollbild-Knopf
- Speichern und Neuladen (auch in der Wohnung)
- Migration eines v1-Spielstands inklusive Sicherung
- Smartphone-Ansicht 390×780 mit Touch: Bedienelemente im Bild, Joystick bewegt die Figur, Handy füllt den Schirm, Aktionsknopf

Ehrliche Einschränkungen der Tests:
- Die Schicht im Club wurde über das Ereignis `clubShift` geprüft, nicht durch 90 Sekunden echtes Spielen. Der Club-Bildschirm selbst wird geöffnet.
- Nicht getestet: echte Android-/iOS-Geräte, echte GPU-Leistung, Google-Cloud-Abgleich (braucht Anmeldung), Mehrspieler zwischen zwei Geräten (Code unverändert).

Aufruf:
```
cd easygames && python3 -m http.server 8080 &
BASE=http://localhost:8080 node gay-life/tests/e2e.mjs
# ohne Internetzugang zu cdnjs zusätzlich THREE=/pfad/zu/three.min.js (r128, z. B. aus `npm pack three@0.128.0`)
```

### Bekannte Lücken (bewusst noch nicht eingebaut)

- Die Welt ist weiterhin nur der Regenbogenkiez; die übrigen Viertel von Rainbow City fehlen (M2).
- NPCs laufen zufällig herum, noch ohne Tagesablauf (M3).
- Dating, Beziehungen über Freundschaft hinaus, Nachrichten, Dating-App, Kalender, Fotos: noch nicht vorhanden und deshalb auch nicht im Handy angezeigt (M3).
- Schlafen, Duschen, Kochen sind Szenenwechsel, noch keine eigenen Figuren-Animationen (M10).
- Keine Miete, keine Möbel zum Kaufen/Verschieben (M6). Keine Hauptgeschichte über die alten Aufträge hinaus (M7).
- Im Mehrspieler läuft die Uhr auf jedem Gerät für sich.

## Nächste Schritte (Einstieg für die nächste Sitzung)

Nach Durchgang 2 ist M3 erledigt. Weiter mit M2/M4 (Viertel und Nachtleben), danach M6 und M7. Die folgende Liste stammt noch aus Durchgang 1:

1. `FORTSCHRITT.md` und `PLAN.md` lesen, Tests einmal laufen lassen (siehe oben).
2. (erledigt) M3: 
   - `js/people.js`: Tagesabläufe für die 12 vorhandenen NPCs (Orte je Uhrzeit/Wochentag, nur nahe NPCs voll simulieren).
   - `js/dating.js`: Dating-NPCs aus `DATES` (Jonas, Mehmet, Luca, Kai, Dennis) mit Persönlichkeit, Vorlieben, Gesprächsarten und Ablehnung; Werte in `S.rel` erweitern (neue Version v3 mit Migration).
   - Handy: Nachrichten und Kalender erst, wenn Termine als gemeinsames Objekt in `S` existieren.
3. Danach M2 (Viertel) und M4 (Club-Innenräume).
