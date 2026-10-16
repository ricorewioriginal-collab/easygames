# Changelog

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
