# Changelog

## 0.3.0 – 2026-10-17

- Jahreszeiten nach Kalender: Frühling mit Blüten, Herbstlaub, Schnee im Winter (Boden, Umland, Wald). Nur Optik, ändert keine Regeln.
- Wetter: zeitweise Regen oder Schneefall, Himmel und Licht passen sich an. Auf Grafik „Niedrig“ ohne Teilchen. Schalter „Wetter & Jahreszeiten“ in den Einstellungen.
- Tag und Nacht: längerer Tag mit Abendrot, dunklere Nacht; Fenster, Laternen, Festtagsbaum und Ladesäulen leuchten. Für neue Spieler standardmäßig an.
- Baumenü zeigt für jedes Gebäude ein aus dem 3D-Modell gerendertes Vorschaubild (nur sichtbare Karten, zwischengespeichert).
- Vier moderne Deko-Objekte: E-Ladesäule, E-Roller-Station, Windrad, Solarfeld.
- Konfetti bei Levelaufstieg und Erfolgen (aus bei „Animationen“ aus oder reduzierter Bewegung). Leisten im Glas-Look, Karten mit sanfter Hover-Bewegung.

## 0.2.1 – 2026-10-16

- Rangliste „Höchstes Level“ und „Meiste Einwohner“ (easygames-Ranglisten, nur mit Freigabe). Knopf 🏆 im Menü und im Profil öffnet die zentrale easygames-Ranglisten-Seite (`ranglisten.html`) eingebettet, mit RicoVille vorgewählt.
- Einladungslink zeigt in den Apps auf die öffentliche Seite.

## 0.2.0 – 2026-10-16

- Nachbarn ohne Server (Firebase Spark): eigene Stadt wird als Kurzansicht veröffentlicht, Nachbarn finden und per Link einladen, Städte besuchen, je Nachbar und Tag 5× helfen und ein Geschenk schicken, Post mit „Alles annehmen".
- Firestore-Regeln für RicoVille in `cloud/firestore.rules` mit Emulator-Tests (`firebase/`).

## 0.1.0 – 2026-10-16

Erste spielbare Fassung.

- 3D-Iso-Stadt (48×48 Felder, 36 Gebiete), Kamera ziehen, zoomen, drehen; Tag und Nacht, Wasser, Wolken, Vögel, Autos und Fußgänger auf dem Straßennetz, Zug, Schiff, Flugzeug.
- Bauen, Versetzen, Drehen, Abreißen; Straßen malen mit Rückgängig; Baustellen mit Material.
- Wirtschaft: Einwohner und Einwohnergrenze, Miete, Zufriedenheit, Ausstrahlung von Deko, Felder, 15 Rezepte in 12 Produktionsgebäuden, Läden mit Warenvorrat, Lager, Markt für Baumaterial, Aufträge per Bahn, Schiff, Flugzeug.
- 84 Aufgaben mit sechs Figuren, Tages- und Wochenziele, 18 Erfolge, Level mit Freischaltungen, Gebietserweiterung.
- Modi: Nostalgisch (Energie), Entspannt (keine Energie, halbe Zeiten), Kreativ (frei, eigener Speicherplatz).
- Spielstand lokal mit Prüfsumme, Sicherung, Versionierung/Migration, Schutz vor zwei offenen Tabs; optional Google-Speicher über das easygames-Cloud-Skript.
- PWA mit eigenem Service Worker und Update-Hinweis.
