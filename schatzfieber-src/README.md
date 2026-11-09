# Schatzfieber – Die Insel der Herzen (Quelle)

3D-Open-World-Abenteuer mit Schatzsuche, Rätseln und Romanzen. Vite + TypeScript + Three.js, keine externen Bilder oder Modelle – Insel, Pflanzen, Häuser, Menschen, Texturen und Klang entstehen im Code.

```
npm install            # einmalig
npm run dev            # Entwicklung (http://localhost:5173)
npm test               # Unit-Tests (Spiellogik, Rätsel-Lösbarkeit, Orientierungs-Regeln, Insel)
npm run build:easygames  # baut nach ../schatzfieber und erzeugt PWA-Dateien
node tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]   # Browser-Test gegen den gebauten Ordner (Server im easygames-Ordner, Port 8766)
```

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/core/` | Typen, Daten (Gegenstände, Laden, Museum, Ausbau, Rätselorte, Hauptgeschichte), zehn Figuren mit Dialogen (`npcs.ts`), Spielstand und Regeln (`state.ts`), Rasterrätsel (`puzzle.ts`) |
| `src/world/` | Höhenfunktion der Insel (`island.ts`), Gelände mit Textur-Mischung, Himmel/Meer/Licht (`env.ts`), Pflanzen (instanziert, Wind), Bauten (`town.ts`, statisch je Material zusammengeführt), Kollision, Rätselort-Darstellung, Welt mit Sammelstellen und Tagesablauf |
| `src/char/human.ts` | Prozedurale Menschen (gerundete Querschnitte, Gesicht mit Lidern, Frisuren, Kleidung als Stoffschicht, Bade-Outfits), Animation per Code |
| `src/game/` | Eingabe (Tastatur/Maus, Controller analog, Touch), Spielfigur und Kamera, Gespräche/Szenen/Enden (`talk.ts`) |
| `src/ui/` | Dialogbox, Fenster, Fokus-Navigation, Handy/Laden/Museum/Haus/Schloss/Einstellungen |
| `src/audio/` | Meer, Natur, generative Musik, Effekte (Web Audio) |

## Regeln für Inhalte

Alle Figuren sind erwachsen (21+). Romanzen nur bei passender Orientierung (Figur fühlt sich zum Geschlecht der Spielfigur hingezogen und die Spielfigur datet das Geschlecht der Figur), sonst Freundschaft. Keine Nacktheit, keine expliziten Szenen: Küsse werden gezeigt, Nächte blenden ins Schwarze über.
