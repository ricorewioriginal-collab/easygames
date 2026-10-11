# GayLife – Fortschritt

Zentrale Fortschrittsdatei. Jede Sitzung trägt hier ein, was **tatsächlich** umgesetzt und geprüft ist, was offen ist und womit es weitergeht. Architektur und Meilensteine: [`PLAN.md`](PLAN.md).

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
