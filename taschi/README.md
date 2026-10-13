# TASCHI – Die 16 Lichter

Eigenständiges 3D-Sammelrollenspiel im [easygames-Repository](https://github.com/ricorewioriginal-collab/easygames) nach der eigens entwickelten Taschi-Land-Idee aus Bunte Insel. Die Dateien liegen ausschließlich unter `taschi/`. Das Originalspiel wird nicht verändert.

## Spiel starten

Im GitHub-Pages-Repository: `https://ricorewioriginal-collab.github.io/easygames/taschi/`

Alternativ aus dem Repository-Hauptverzeichnis:

```bash
python3 -m http.server 8080
# Im Browser: http://localhost:8080/taschi/
```

Die Three.js-Version wird **lokal aus `../bunte-insel/vendor/three.min.js`** eingebunden. Beim Deployment muss daher die entsprechende Verzeichnisstruktur samt dieser Vendor-Datei bestehen bleiben. Kein externes Three.js-CDN notwendig; die Spielstanddaten liegen im Browser.

## Steuerung und Menüs

- PC: WASD/Pfeiltasten bewegen, E = Interaktion, Escape = Pause.
- Handy: Touch-Joystick und Aktionsschaltflächen.
- **Team**, **Taschidex**, **Karte**, **Pause** als sichtbare Schaltflächen.
- Pause: Reisekarte, Abenteuerbuch, Geschichte, Spielstand als JSON exportieren oder importieren.
- Automatisches lokales Speichern im Browser, unabhängiger Schlüssel `easygames.taschi.eight-lights.v1`.
- Import prüft Dateigröße und Spielstandsformat; beschädigte Eingaben werden abgewiesen.

## Spielsysteme

- 17 grundlegende Taschi-Arten plus **192 deterministisch generierte Regionalformen**, zusammen 209 Art-/Formeinträge im Taschidex. Die Regionalformen variieren Farbe, Werte und prozedurale 3D-Details, nutzen aber gemeinsame Grundkörper. Das sind **keine 209 einzeln modellierten Original-Kreaturen**.
- Acht Elementtypen und elementbasierte Wirksamkeiten, Angriffs- und Verteidigungswerte, EP, Levelaufstiege und einige Entwicklungen.
- Starterwahl, Wildbegegnungen, Fangchance abhängig von restlichen KP, Team mit sechs Plätzen, Lagerverwaltung, Heilung und Tränke.
- 16 aufeinanderfolgende Arenen; spätere Arena-Meister besitzen Teams aus mehreren Taschis. Nach jeder bestandenen Arena folgen Licht-Siegel und Belohnungen.
- Eigenständige 3D-Kampfplattform mit sichtbaren Modellen beider Taschis.
- 6 Dörfer mit Begegnungen und Rastaktionen; 4 Höhlen mit **begehbarem einfachem 3D-Interieur**, Kristallsuche, Wildbegegnungen und Ausgang.
- Fünf Story-Kapitel, Abenteuerbuch, Richtungsanzeige zur nächsten Arena, freies Erkunden nach der 16. Herausforderung.
- Mobile Rendering-Auflösung begrenzt und Blüten per InstancedMesh zusammengefasst.

## Aktuelle Qualitätsgrenzen

Die komplette **Kernfortschrittskette vom Starter bis zum 16. Arena-Siegel ist im Code angelegt**, wurde aber noch nicht mit einem automatisierten End-to-End-Browserlauf auf einem realen Smartphone verifiziert. Das Produkt erreicht derzeit **noch nicht die Qualität und den Umfang eines kommerziellen Konsolen-RPGs**. Noch fehlen insbesondere handmodellierte individuelle Monster, echte begehbare Häuser und umfangreiche Innenräume, hunderte individuelle Attacken, Status-Effekte und taktische Gegner-KI, umfangreiche Cutscenes, professionelle Musik/Soundeffekte, große zusammenhängende Routen, mehrstufige Haupt- und Nebenquests, Multiplayer/Handel und Cross-Device-Synchronisierung.

Die Welt nutzt eigene Kunst-/Figurenansätze. Keine Pokémon-Assets oder markenrechtlich geschützten Grafiken, Sounds, Charaktere oder konkreten Spieltexte übernehmen.

## Entwicklung

Die Spielmechanik ist aktuell in `game.js` gebündelt und sollte mittelfristig modularisiert und mit Browser- und Gerätetests abgesichert werden. Bunte Insel darf dabei nicht überschrieben werden. Ein zusätzliches Vite-Build-System ist **noch nicht** eingerichtet; die vorhandenen Dateien sind direkt statisch auslieferbar.
