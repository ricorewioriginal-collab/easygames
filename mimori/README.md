# Mimori – Dein 3D-Haustier mit Spielhalle

Eigenständige, kostenlose Mobile-First-Haustier-App in EasyGames. Entwickelt für Android-Browser, installierte PWA, Tablet und Desktop.

## Was ist neu?

**3D-Grafik:** Auf mobilen Geräten waren die weißen Lichtflächen teils ausgebrannt. Die Szene verwendet jetzt warmes, deutlich zurückgenommenes Licht, eine niedrigere Belichtung (ACES Filmic Tone Mapping bei Exposure 0,83), matte/sattere Materialien und einen sichtbaren Kontakt-Schatten. Drei Zimmerstile passen die Farben an. Die vier eigenständig geformten Mimoris (Fluffi, Nubbi, Foxi, Drachi) bleiben frei drehbar und in vier Fellfarben verfügbar.

**Spielhalle:** Statt des sehr einfachen Sternfangs gibt es fünf unterschiedliche Minigames mit eigenständiger Steuerung, Punkten, Zeitlimit und Sieg-/Niederlage-Bedingungen:

1. **🍓 Beerensturm:** Fruchtfang mit horizontal bewegtem Korb und Bomben. Touch zum Bewegen oder Pfeiltasten. Drei Leben, Kombos und seltene Bonusfrüchte.
2. **🃏 Zauber-Memory:** Sechs versteckte Paare in einem 3×4-Raster. Karten aufdecken, Paare merken, in 50 Sekunden schaffen. Treffer werden belohnt.
3. **🎵 Beat-Party:** Vier Notenspuren mit Treffzone. Im richtigen Rhythmus auf die vier Touch-Flächen tippen oder D/F/J/K drücken. Kombos und Trefferwertung.
4. **☁️ Wolken-Sprint:** Ein automatisch laufender Hindernisparcours. Springe per Touch / Leertaste / Pfeil hoch, sammle Sterne und weiche Hindernissen aus.
5. **🫧 Blasenlabor:** Helle Seifenblasen einsammeln, roten Schleim vermeiden, drei Leben und Kombos. Die Blasen bewegen sich und werden schneller.

Die Spiele werden nicht als reine Dekoration ausgegeben: Jedes hat einen eigenen Spielzustand, Gameplay, Eingaben, Kollision/Zuordnung, Ende und Belohnung. Bestwerte werden im normalen Spielstand gespeichert.

**Belohnungen und Accessoires:** Für die Resultate gibt es Sterne und Erfahrung. Ein Tagesgeschenk bringt einmal pro Tag zusätzliche Sterne, Beeren und Seife. Im Shop kannst du ein Glöckchen, eine Schleife oder eine Sternkrone sowie zwei alternative Zimmerwelten freischalten. Kein Echtgeld, keine Werbung und kein Pay-to-win.

**Foto:** Über „Mimori-Foto“ kann der 3D-Inhalt, wenn der Browser es erlaubt, als PNG gespeichert werden.

## Weiterhin enthalten

- Füttern, Spielen, Baden, Schlafen, Kuscheln, Tanzen und Überraschungen
- Selbst erzeugte Sounds, einschließlich Schnurren beim Kuscheln
- Langfristiges Wachstum und Bedürfnisse basierend auf vergangener Zeit
- Vier unterschiedliche 3D-Wesen, vier Farbvarianten
- Opt-in-Erinnerungen, solange Browser/PWA laufen (keine zuverlässige Zustellung bei geschlossener App)
- Lokaler Spielstand unter `easygames.mimori.v1`
- Bestehende Google-Speicherintegration über `../cloud/anmacha-cloud.js` und `data-game="mimori"`, freiwillig. Der Google-Abgleich erfordert Internet und Anmeldung und wird nicht als offline verfügbar behauptet
- Offline-PWA mit Service Worker

## Technische Dateiliste

- `index.html` – App-Oberfläche
- `game.js` – 3D-Haustier, Pflege, Shop, Google-kompatibler Spielstand, App-Aktionen
- `model.js` – Pflegewerte, Sternkonto, Bestwerte, Belohnungen, Tagesbonus, Besitz und Shop
- `sound.js` – lokale Web-Audio-Effekte
- `arcade.js`, `arcade.css` – eigenständige Canvas-/DOM-Minispiele und responsives Spielhallen-Design
- `sw.js` – Offline-/PWA-Cache, ohne externen Push-Server
- `icon.svg`, `manifest.webmanifest`

## Tests

```sh
node tools/test-mimori.cjs
node tools/test-mimori-arcade.cjs
node tools/build-sync.js --check
```

Die automatisierten Tests decken Pflege und alte Spielstände, 3D-Modellinitialisierung im Mock, vier Arten, Farbwechsel, Sternkonto, Tagesbonus, Einkäufe, Arcade-Spielzustände, Timer, Touch-/Button-Eingaben, Ergebnis- und Einmal-Belohnungen ab. Ein echter Test auf verschiedenen Mobilgeräten bleibt erforderlich, insbesondere Farben/Belichtung, Audio, Download und Google-Login. Wenn JavaScript bei geschlossener PWA pausiert, erfolgen auch keine Benachrichtigungen.
