# RicoVille – Deine Stadt lebt!

Gemütliches 3D-Städtebauspiel für easygames: Straßen ziehen, Häuser bauen, Einwohner anlocken, Felder bestellen, Waren herstellen, Läden beliefern, Miete kassieren, Aufträge per Bahn, Schiff und Flugzeug, neue Gebiete erschließen. Eine eigenständige Neuentwicklung, inspiriert vom Gefühl klassischer Facebook-Städtebauspiele um 2010. Es gibt **keine** Verbindung zu Zynga, keine übernommenen Namen, Texte, Grafiken oder Klänge.

- Spielen: <https://ricorewioriginal-collab.github.io/easygames/ricoville/> (nach dem Merge)
- Technik: TypeScript (strict), Three.js, Vite, Vitest, Playwright. Keine weiteren Laufzeit-Abhängigkeiten.
- Alle Modelle entstehen per Code (Vertex-Farben, zusammengeführte Geometrien), alle Klänge per Web Audio.

## Schnellstart

```bash
cd ricoville-src
npm ci
npm run dev            # http://localhost:5173 (ohne Google-Speicher, der braucht ../cloud/)
npm test               # Unit-Tests (Regeln, Spielstand)
npm run test:e2e       # Browser-Tests (Desktop, Handy hoch, Handy quer)
npm run build:easygames  # baut und kopiert nach ../ricoville/ (wird eingecheckt)
```

## Dokumentation

| Datei | Inhalt |
|---|---|
| [docs/HANDOFF.md](docs/HANDOFF.md) | Einstieg für die nächste Person/Sitzung: Stand, offene Punkte, nächste Schritte |
| [docs/STATUS.md](docs/STATUS.md) | Funktionsstand je Bereich (fertig, teilweise, offen) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Aufbau des Codes, Datenfluss, Rendering |
| [docs/GAMEPLAY_RULES.md](docs/GAMEPLAY_RULES.md) | Alle Spielregeln und Formeln |
| [docs/CONTENT_CATALOG.md](docs/CONTENT_CATALOG.md) | Alle Gebäude, Pflanzen, Waren, Rezepte, Aufgaben (automatisch erzeugt) |
| [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) | Google-Speicher heute, Nachbarn/Server-Prüfung später |
| [docs/SECURITY.md](docs/SECURITY.md) | Sicherheitsmodell und Grenzen |
| [docs/TESTING.md](docs/TESTING.md) | Tests und wie man sie ausführt |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Bauen, einchecken, Service Worker, Cache-Versionen |
| [CHANGELOG.md](CHANGELOG.md) | Versionen |
