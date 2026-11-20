# Pride City – Quellcode

Relaunch von **Gay Life!** als „Pride City – Ein Leben in allen Farben“. Queere 3D-Lebenssimulation in Rainbow City.
Technik: Vite, TypeScript, Babylon.js (seit 20.11.2026, vorher three.js), eigene kleine Engine; alle Menschen sind Microsoft-Rocketbox-Avatare (MIT). Ausgabe nach `../pride-city/` (wird mit eingecheckt, die Apps laden diesen Ordner).

```
npm install              # KayKit-Modelle (Stadt, Wohnung) lädt `npm run build` selbst (scripts/fetch-assets.mjs); Rocketbox-Figuren liegen in public/assets/rb (neu erzeugen: `node scripts/rocketbox.mjs`, nur Animationen: `… anim`)
npm run dev               # Entwicklung (http://localhost:5173, Pfade zu ../gamepad.js usw. fehlen dort)
npm test                  # Unit-Tests (Spielstand, Migration, Story)
npm run build:easygames   # Typprüfung, Build, Kopie nach ../pride-city (Manifest/Service Worker/card.jpg bleiben)
```
Danach im Repo: `python3 tools/make-pwa.py pride-city`, `node tools/build-sync.js`, `node tools/check-games.js`.
E2E-Test (Browser, SwiftShader): Server im Repo starten (`python3 -m http.server 8080`), dann `node pride-city-src/tests/e2e.mjs`.

## Aufbau

| Ordner/Datei | Aufgabe |
|---|---|
| `src/engine/bjs.ts`, `geo.ts` | Babylon-Importe (tiefe Pfade, kleines Paket) und Grundformen/Materialien (`planeZ`, `box`, `pbr`, `glow`, `canvasTex`) |
| `src/engine/Engine.ts` | Babylon-Engine, eine Szene je Spielszene, Nachbearbeitung (ACES, Farbkurven, Vignette, Bloom/MSAA nur auf „hoch“), Schatten, Spielschleife, Szenenwechsel, automatische Grafikstufe (Auflösung, Schatten, Bloom nur auf „hoch“) |
| `src/engine/Input.ts` | Ein Eingabe-System für Tastatur, Maus, Touch und Gamecontroller → Aktionen (`confirm`, `back`, `menu`, Richtungen, `sprint` …) mit Wiederholung für Menüs |
| `src/engine/Assets.ts` | glTF als AssetContainer je Szene laden (mit Fortschritt); statische Teile als Instanzen, Figuren mit eigenem Skelett |
| `src/engine/Audio.ts` | Musik und Effekte live per WebAudio erzeugt (keine Audiodateien) |
| `src/engine/Save.ts` | Spielstand `prideCity.save` (Cloud-Präfix `prideCity.`), Migration, Übernahme aus Gay Life! (`anmachaGayLife`) |
| `src/ui/` | Konsolen-Menü (`Menu`), Ladebildschirm, Dialog mit Antworten, HUD mit Zielmarkern, Touch-Stick und -Tasten, Kapitelkarten |
| `src/game/Actor.ts`, `avatars.ts` | Menschen: 33 Microsoft-Rocketbox-Avatare (Alltag, Party, Polizei, Feuerwehr, Sanitäterin, Security, Köchin, Sport, Business, Kurier) mit gemeinsamen Animationen (`rb/anim`, per Knotenname übertragen), weiche Übergänge; alte Spielstände bekommen über `avatarFor()` eine passende Figur |
| `src/game/World.ts` | Rainbow City aus City-Builder-Bits plus Pride-Deko, Hafenviertel (Kai, Strand, Steg, Leuchtturm, Club), Polizei- und Feuerwache, Tag/Nacht, Verkehr, Kollision (`walkable`) |
| `src/game/Street.ts` | Belebte Straßen: Passant*innen, Streife, Feuerwehr, Löschzug und Blaulicht, Sexarbeiter*innen vor Haus Rosa (18+), geparkte Autos zum Fahren |
| `src/game/CityScene.ts` | Laufen, Kamera, Figuren, Interaktion, Sticker, Titel-Kamerafahrt |
| `src/game/gigs.ts`, `empire.ts` | Aufträge per Anruf, Regenbogen-Taxi (Fahrgäste in Serie), Imperium (Läden, Bars, Clubs kaufen, Tageseinnahmen) |
| `src/game/crime.ts`, `Combat.ts` | Gesetze und Fahndungssterne, Spaßwaffen (Poolnudel, Glitzer-Dildo ab 18, Gleitgel), Polizei-Verfolgung und Festnahme |
| `src/game/family.ts` | Antrag, Hochzeit, Adoption; Partner*in und Kind wohnen zu Hause |
| `src/game/uptown.ts` | Hochstadt: prozedurale Hochhäuser, Brownstones, Hochbahn, Brücke, Skyline (ein Mesh je Material) |
| `src/engine/Radio.ts` | Autoradio: 13 echte Sender (laut.fm, Stream und „Jetzt läuft“), vier Stadt-Sender als Ersatz ohne Netz |
| `src/game/saga.ts` | Akt II „Die Lichter der Hochstadt“: acht Missionen, sechs Figuren, baut auf den Aufträgen (`gigs.ts`) auf |
| `src/game/vehicles.ts` | Fuhrpark (Fahrwerte je Auto), Garage (Kauf, Lack, Turbo), Rennen mit Medaillen, Paketdienst |
| `src/game/kerb.ts` | Laternenmeile: Hupen im Auto, Einsteigen, ruhige Ecke, Abblende (ab 18) |
| `src/game/story.ts` | Figuren, fünf Kapitel bis zum Ende, Ziele (`goal`), automatische Fortschritte (`storyTick`), Gespräche, Entscheidungen (`save.flags`), Ende (`ending`) |
| `src/game/life.ts` | Bedürfnisse, Stimmung, Uhrzeit und Tageswechsel, Tagesziele (aus Gay Life! übernommen) |
| `src/game/jobs.ts` | Fünf Jobs mit Situationen, Lohn, Stufen und Beförderung |
| `src/game/social.ts` | Dating-Profile, Dates, Gesundheit (Checkpoint, PrEP, Tests), Feed, Gerüchte, Glossar, 18+-Regeln, Nachtleben (Videothek Kopfkino, Haus Rosa, Cruising im Park; nur angedeutet, Zustimmung und Kondom Pflicht) |
| `src/game/Photo.ts` | Fotostudio: rendert Profilbilder der Figuren (Outfit, Pose) für die Dating-App |
| `src/game/HomeScene.ts` | Begehbare Wohnung (KayKit Furniture und Restaurant Bits): Bett, Dusche, Herd, TV, Kleiderschrank |
| `src/game/CreatorScene.ts` | Charakter-Editor |
| `src/game/minigames/DanceScene.ts` | Tanz-Battle in 3D |
| `src/game/Game.ts` | Ablauf, alle Menüs (Titel, Pause, Optionen, Story, Minispiele, Orte, Handy mit Apps, Schichten, Wohnungsaktionen), Barkeeper-Minispiel, Party-Nächte, Abspann |

Regeln: Ein Bedienkonzept für alle Geräte (Richtungen wählen, A bestätigt, B zurück, Y/Start Menü). Neue Daten in `defaults()` (Save.ts) eintragen.
Assets nur mit freier Lizenz, jede Quelle in `public/CREDITS.md`.

## Open-World-Ausbau (20.11.2026)

- Die Romane und Gay Life! sind keine eigenen Menüpunkte mehr: Gay-Life-Minispiele stehen an ihren Orten in der Stadt, die Minispiele aus „Leuchtfeuer“ (Leuchtturm, Plakat, Deich, Räucherei, Pias Fall) spielt man direkt in Finns Rückblenden (`romane/leuchtfeuer/index.html?pc=<spiel>` springt hinein und schließt danach).
- Kollision mit Laternen, Flaggenmasten, Bänken, Palmen und Figuren (`World.props`), Autos halten Abstand und lassen Vorfahrt; Requisiten zwischen Kamera und Figur werden ausgeblendet.
- Look: Umgebungskarte (Spiegelungen), Sonnenscheibe und Dunst, lange Abendröte in Pink/Violett, Palmen, nachts warme Fenster, feuchte Straßen und mitwandernde Laternenlichter, Farblook-Pass (Stufe „hoch“).
- Radar-Minikarte unten links (Handy: oben rechts) und Lichtsäule über dem Missionsziel.

## Stand und Fahrplan

Siehe [`FAHRPLAN.md`](FAHRPLAN.md).
