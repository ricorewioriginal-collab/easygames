# TASCHI – Die acht Lichter

Eigenständiges, browserbasiertes 3D-Sammelrollenspiel im easygames-Monorepo. Inspiriert von der **originalen Taschi-Land-Welt** in `bunte-insel/`, mit eigenen Wesen und einer separaten Speicherung. Andere Spiele werden nicht geändert.

## Spielen

Öffne `taschi/index.html` über einen lokalen HTTP-Server oder über die GitHub-Pages-Auslieferung. Beispiel im Repo-Wurzelverzeichnis:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/taschi/` aufrufen. Für `three` wird derzeit eine **externe ESM-CDN-Ressource** verwendet, d.h. zum ersten Laden ist eine Internetverbindung nötig. Vollständiger Offline-Betrieb und eine produktionsreife Asset-Pipeline sind **noch nicht implementiert**.

## Steuerung

Desktop: **WASD/Pfeiltasten** bewegen, **E** interagiert, Team und Taschidex über die Schaltflächen. Handy: linker Touch-Joystick und rechte Aktionsschaltflächen.

## Aktuell implementiert

- Begehbare 3D-Lichtung Sonnenhain mit Kamera, Bäumen, Häusern, Arenastelen und hohem Gras.
- Startauswahl: Glutzahn, Plätscherchen oder Samenling.
- 17 Arten, 8 Elementtypen, 9 Attacken, Begegnungen im hohen Gras.
- Rundenbasierte Kämpfe mit KP, Leveln, EP, Typenfaktoren und Entwicklungen einiger Arten.
- Taschibälle, Fangwahrscheinlichkeit abhängig von Rest-KP, Team bis 6, Lager, Taschidex.
- Acht aufeinanderfolgende Arena-Duelle, Licht-Siegel, Heilhaus, Fangladen, Tränke.
- Lokale Spielstandspeicherung im Browser per `localStorage`, unabhängig von Bunte Insel.

## Wichtige Grenzen

Dies ist **ein spielbarer erster Entwicklungsstand, kein vollwertiges Switch-/3DS-Konsolenspiel**. Insbesondere fehlen ausgearbeitete Charakteranimationen, hochwertige individuelle Kreaturenmodelle, Städte und Regionen, NPC-Dialogketten, vertonte Geschichte, Audio, Weltkarte, dichte Quests, Online-Modi, zeitgemäße Kamera-Kollisionslogik und automatisierte Browser-/Gerätetests. Die acht Arenen sind derzeit einzelne Herausforderungen mit jeweils einem gegnerischen Taschi; der Spielstand ist derzeit **nur lokal**, ohne Sync. Die 3D-Modelle sind einfache prozedurale Platzhalter.

Bekannte technische Grenzen: Es gibt noch kein reguläres Package-/Build-System für Taschi; die Three.js-ESM-Abhängigkeit wird über CDN geladen; Browser können lokale Module unter `file://` blockieren. Performance und vollständiges Mobilverhalten müssen auf echten Geräten geprüft werden.

## Weitere Entwicklung

Die bereits in `bunte-insel/js/taschi-data.js` vorhandenen umfassenderen Arten-/Attacken-/Trainerdaten können in einer weiteren Entwicklungsiteration in ein **geteiltes, versioniertes Datenmodul** überführt werden, statt die Originalwelt zu verändern. Dabei sollten Bunte Insel und Taschi ihre Spielstände voneinander getrennt halten. Kein Original-Pokémon-Branding, keine geschützten Figuren, Grafiken, Musik oder Spielressourcen kopieren.
