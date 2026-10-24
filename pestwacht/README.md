# Pestwacht – Die letzte Zuflucht

Überlebens-, Aufbau- und 4X-Strategiespiel in 3D für Browser, Handy und die easygames-App. Alle Inhalte, Namen, Texte, Modelle und Klänge sind eigene Arbeiten. Die Modelle werden aus einfachen Formen erzeugt, die Klänge per WebAudio. Es gibt keine Fremdgrafiken und keine Audiodateien.

Den Spielnamen ändert man an einer Stelle: `PW.TITLE` / `PW.SUBTITLE` in `js/data.js`. Dazu kommen der Eintrag in `games.js` und `<title>` in `index.html`.

## Starten

- Online: `https://ricorewioriginal-collab.github.io/easygames/pestwacht/`
- Lokal: im Repo-Hauptordner `python3 -m http.server 8765` starten und `http://localhost:8765/pestwacht/` öffnen. Ein Build-Schritt ist nicht nötig, Three.js r128 liegt in `vendor/`.

## Umfang

- **Stadt:**
  - 34 Gebäudearten mit Stufen, Bautrupps und Arbeitskräften.
  - Bauen, Verbessern, Versetzen, Abreißen (mit Teilerstattung) und Reparieren.
  - Platzierung mit Vorschau und Drehen.
- **Bewohner:**
  - Stufen der Seuche: gesund, gefährdet, krank, isoliert, in Behandlung, genesen und immun.
  - Hygiene, Quarantäne, Betten, Arznei, Zufriedenheit, Flucht und Zuwanderung.
- **Lazarett:**
  - Einzelne Kranke mit Namen: untersuchen, mit dem passenden Mittel behandeln, geheilt entlassen. Wartende verlieren Lebenskraft.
  - Besondere Gäste mit hoher Belohnung, Personal (Empfang, Pflegerin, Träger), das Schritte selbst übernimmt.
  - Kräuterbeete zum Säen und Ernten.
- **Wirtschaft:**
  - 10 Rohstoffe mit Lagergrenzen.
  - Markt mit Kursen.
  - 3 Forschungsbäume (Heilkunst, Wirtschaft, Krieg) mit je 8 Stufen.
- **Militär:**
  - 6 Truppenarten mit Stärken und Schwächen.
  - 12 Helden mit Stufen, Talenten, Ausrüstung, Schmiede und Beförderung. In Schlachten lädt ihre Energie durch Treffer.
  - Formationen.
  - Beobachtbare Schlachten: Tempo 1/2/4, Ziel wählen, Heldenfähigkeiten, Rückzug, Sofort-Auswertung.
- **Wellen:**
  - 5 Feindarten und 3 Bosse auf bis zu 4 Laufwegen.
  - Mauer, Tor und 4 Turmarten (Pfeil, Balliste, Feuer, Rauch) mit eigener Zielwahl.
  - Garnison und Heldenfähigkeiten.
  - Überfälle durch Plünderer.
  - Nach einer Niederlage kann man wieder aufbauen.
- **Welt:**
  - Sechseck-Karte mit Kriegsnebel, Gelände, Flüssen, Fundorten, Höhlen und Ruinen.
  - Expeditionen: Erkunden, Sammeln, Kranke retten, Region heilen, Handel, Besetzen, Angreifen, Verteidigen, Bündnishilfe.
  - Märsche mit Wegfindung und Abfangen unterwegs.
- **8 Computer-Fraktionen:** siehe „Wie die Bots arbeiten“.
- **Kampagne und freies Spiel:**
  - Kampagne mit 5 Kapiteln und 19 Missionen, mit Erzähltexten.
  - Freies Spiel mit einstellbarer Karte, Fraktionszahl, Schwierigkeit, Startbedingungen und Siegbedingung.
- **Ereignisse und Aufgaben:**
  - Ereignisse mit Entscheidungen.
  - Tages- und Wochenaufgaben, 26 Erfolge (auch für die easygames-Erfolgsseite).
  - Ranglisten: abgewehrte Wellen, Bewohner und Geheilte.
- **Speichern:**
  - Autosave alle 60 s sowie beim Verlassen und Ausblenden.
  - 3 eigene Plätze, Export und Import als Datei.
  - Versioniertes Schema mit Migration.
  - Offline-Fortschritt, begrenzt und ohne Angriffe.
  - Optional über `cloud/anmacha-cloud.js` (Präfix `easygames.pestwacht`) mit Google sichern.
- **Bedienung:**
  - Touch, Maus und Tastatur (frei belegbar).
  - Gamecontroller über `gamepad.js`.
  - Einstellungen: Lautstärke, UI-Größe, Grafikqualität, Kontrast, weniger Effekte, Kamera, Zoom-Richtung.
  - Hilfe mit 12 Kapiteln und Mitwirkende.

## Wie die Bots arbeiten (Utility-KI)

Jede Fraktion hat einen Archetyp: Händler, Eroberer, Verteidiger, Heiler, Opportunist und andere. Der Archetyp gewichtet die Entscheidungen. Je nach Schwierigkeit etwa alle 16–40 Spielsekunden bewertet `PW.AI.think` mögliche Aktionen und führt die beste aus. Fraktionen weit weg vom Spieler denken etwas seltener, das spart Rechenzeit.

- **Bauen und Forschen:** Bewertet werden Mangel an Nahrung, Wasser und Unterkünften, Seuchenlast, Bedrohung durch Nachbarn und das langfristige Ziel.
- **Ausbilden:** Truppen werden nach Bedrohung und Kriegslage ausgebildet.
- **Expandieren:** Bots besetzen freie Nachbarfelder.
- **Angreifen:** Ein Angriff kommt erst, wenn die geschätzte Stärke deutlich überlegen ist.

Bots spielen nach denselben Regeln und Kosten wie der Spieler. Jede Einnahme und Ausgabe wird in `f.ledger` gebucht, Bots erzeugen nichts aus dem Nichts. Der Test `tests/ai.test.js` prüft für 4 Spielstunden: Bestand ≤ Start + erzeugt − ausgegeben.

Diplomatie (`js/diplo.js`):

- Die Beziehung besteht aus Beziehung, Vertrauen und einer Erinnerung an Taten: Geschenke, Hilfe, Handel, Angriffe, Vertragsbrüche.
- Verträge: Handel, Nichtangriff, Verteidigungspakt, Bündnis, Waffenstillstand, Vasallentum.
- Vorschläge werden mit Begründung bewertet. `PW.Diplo.evaluate` liefert die Gründe, die Oberfläche zeigt sie an.
- Bots erklären einander Kriege, schließen Frieden aus Kriegsmüdigkeit und bilden Blöcke gegen Übermächtige.
- Paktpartner treten einem Krieg nur bei, wenn ihr Vertrauen reicht.

## Dateien

| Datei | Inhalt |
|---|---|
| `js/data.js` | alle Spieldaten: Gebäude, Rohstoffe, Truppen, Helden, Feinde, Bosse, Forschung, Fraktionen, Ereignisse, Erfolge, Balance |
| `js/core.js` | Zufall mit Startwert, Bezahlen und Hinzufügen von Rohstoffen, Zeitformate, Chronik |
| `js/world.js`, `js/march.js` | Weltkarte, Wegfindung, Nebel, Fundorte, Expeditionen, Eroberung |
| `js/city.js`, `js/econ.js`, `js/ward.js` | Stadt, Bauaufträge, Produktion, Bevölkerung und Seuche, Forschung, Rekrutierung, Markt, Lazarett und Kräuterbeete |
| `js/heroes.js`, `js/battle.js`, `js/waves.js` | Helden, Schlachtsimulation, Wellenverteidigung |
| `js/ai.js`, `js/diplo.js` | Computer-Fraktionen und Diplomatie |
| `js/campaign.js`, `js/game.js`, `js/save.js` | Kampagne, Spielablauf (fester 0,5-s-Takt), Ereignisse, Aufgaben, Speichern |
| `js/render.js`, `js/input.js`, `js/audio.js` | 3D-Darstellung (Three.js), Eingabe, Klang |
| `js/ui.js`, `js/panels.js`, `js/main.js` | Oberfläche, Fachfenster, Start und Hauptschleife |

Die Simulationsdateien laufen ohne DOM. Die Tests laden sie direkt in Node (`tests/load.js`).

## Tests

```bash
node --test pestwacht/tests/*.test.js      # 44 Prüfungen der Simulation (Stadt, Seuche, Lazarett, Forschung, Bots, Diplomatie, Kampf, Wellen, Karte, Speichern)
python3 -m http.server 8765 &              # im Repo-Hauptordner
node pestwacht/tests/smoke.cjs             # Browser-Klicktest mit Playwright: alle Fenster, Bauen, Schlacht, Welle, Speichern/Laden, freies Spiel
```

`tests/preview.html?v=city|wave|world|battle|battle2|night|models` zeigt einzelne Szenen ohne Oberfläche, für Screenshots.

## Grenzen

- Kein Online-Mehrspieler: Das Spiel ist bewusst nur für eine Person.
- Die Figuren sind Low-Poly aus Grundformen und nicht animiert. Gehen ist nur als Wippen und Schwanken angedeutet.
- In der Stadt werden Truppen nur als Stellvertreter angezeigt, nicht jeder Soldat einzeln.
- Die Balance ist mit automatischen Langläufen grob geprüft, aber nicht mit vielen Spielenden ausgiebig getestet.
