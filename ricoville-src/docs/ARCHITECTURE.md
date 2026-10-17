# Architektur

```
src/
  core/types.ts      Datentypen (Kataloge, Spielstand, Ereignisse)
  core/city.ts       Alle Spielregeln (City-Klasse), reine Logik, Uhr injiziert
  core/season.ts     Jahreszeit nach Kalender und Saison-Schlüssel (für Saison-Events)
  core/save.ts       Speichern: Prüfsumme, Sicherung, Versionen/Migration, Mehr-Tab-Schutz
  catalogs/*.ts      Inhalte: Gebäude, Pflanzen, Waren, Rezepte, Aufträge, Aufgaben, Figuren, Erfolge
  rendering/models.ts  Prozedurale Modelle (Vertex-Farben, zu einer Geometrie verschmolzen, gecacht); animSpec() liefert drehende Teile und Rauch-Punkte
  rendering/world.ts   Three.js-Szene: Kamera, Licht, Boden, Wasser, Wald, Verkehr, Transport, Tag/Nacht, Wetter, Vorschaubilder
  rendering/season.ts  Jahreszeit (Kalender), Wetter je 6-Minuten-Abschnitt, Tageslichtkurve – reine Funktionen, nur Optik
  world/traffic.ts     Autos und Fußgänger auf dem Straßengraphen
  input/controls.ts    Maus/Touch/Tastatur: Tippen, Ziehen, Malen, Pinch, Mausrad
  audio/audio.ts       Klänge und generative Musik per Web Audio
  ui/dom.ts            Mini-DOM-Helfer (kein Framework)
  app.ts               Menü, HUD, Werkzeuge, Fenster, Speichern, Rückmeldungen
  main.ts              Start, Ladebalken, Fehleranzeige, Service Worker
```

## Datenfluss
1. Nutzeraktion (Tippen, Knopf) → `App` ruft eine Regel der `City` (z. B. `place`, `collect`).
2. `City` prüft, ändert `CityState` und sendet `GameEvent`s (Münzen, Erfahrung, Level, Aufgabe).
3. `App` zeigt Rückmeldungen (fliegende Zahlen, Toasts, Klänge) und speichert gebündelt (1,2 s).
4. `World.sync()` vergleicht Spielstand und Szene und baut nur Geändertes neu.

Die Regeln kennen weder DOM noch Three.js. Dadurch laufen die Unit-Tests in Node.

## Rendering und Leistung
- Ein Material für alle Gebäude (Vertex-Farben), Geometrien pro Gebäudetyp einmal gebaut und geteilt.
- Nachtlichter ohne Lichtquellen: Modelle tragen ein Attribut `glow` (Fenster, Lampen), das Material addiert es nachts als Eigenleuchten (`onBeforeCompile`, eine Uniform).
- Wald-Kronen sind weiß modelliert und werden je Baum über Instanzfarben eingefärbt (Jahreszeit ohne neue Geometrie).
- Vorschaubilder im Baumenü: Hauptrenderer rendert das Modell in ein 192²-Renderziel, Umrechnung nach sRGB, verkleinert als PNG; nur sichtbare Karten, gecacht.
- Straßen und Wald als `InstancedMesh` (wenige Draw Calls), Straßenmuster über 16 Masken-Texturen.
- Orthografische Iso-Kamera mit 90°-Drehung, Zoom und weicher Zielfahrt.
- Qualitätsstufen (Schatten, Pixelverhältnis, Verkehrsmenge); bei niedriger Bildrate wird automatisch heruntergeschaltet. Unsichtbarer Tab: Ton aus, Ticks pausiert.
- Three.js liegt in einem eigenen Chunk (Cache über Updates hinweg).

## Speichern
- `localStorage`-Schlüssel `ricoville.save.main` (Stadt), `ricoville.save.creative` (Sandkasten), `ricoville.profile`, `ricoville.settings` (nur lokal).
- Format `{ sum, city }` mit FNV-Prüfsumme; vor jedem Schreiben bleibt die vorige Fassung lokal unter `ricoville.backup.<platz>`. Defekter Stand → Sicherung.
- `rev` zählt jede Speicherung. Hat ein anderer Tab neuer gespeichert, fragt das Spiel, welche Fassung gelten soll, statt sie zu überschreiben.
- `localStorage` statt IndexedDB, weil das easygames-Cloud-Skript `localStorage`-Präfixe synchronisiert.
