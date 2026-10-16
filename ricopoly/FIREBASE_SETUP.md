# Cloud-Speicher (Firebase)

RicoPoly nutzt den **bestehenden** easygames-Cloud-Speicher `../cloud/anmacha-cloud.js`. Es wird kein neues Firebase-Projekt und kein neuer Schlüssel gebraucht.

- Eingebunden in `index.html` mit `data-game="ricopoly"` und `data-prefix="ricopoly.v1."`.
- Gesichert werden alle `localStorage`-Schlüssel mit diesem Präfix: Profil (inkl. Einstellungen, Statistiken, Erfolge, Freunde) und Spielstände (`save.auto`, `save.slot1–3`, `save.host`).
- Daten liegen unter `users/<uid>/saves/ricopoly` (und `ricopoly__alt` für die ältere Sicherung). Die vorhandenen Regeln in `../cloud/firestore.rules` decken das ab: Nur der angemeldete Nutzer darf seine Daten lesen und schreiben, maximal ca. 950 KB je Spiel. Ein RicoPoly-Spielstand ist etwa 20 KB groß, alle Plätze zusammen bleiben weit darunter.
- Indizes werden nicht benötigt (nur direkte Dokumentzugriffe).

## Was ist **nicht** in Firebase

- Online-Partien laufen nicht über Firestore oder Cloud Functions, sondern direkt zwischen den Browsern (PeerJS). Der Gastgeber-Browser prüft alle Züge.
- Eine weltweite Rangliste gibt es nicht. Dafür bräuchte es eine serverseitige Prüfung der Ergebnisse (z. B. Cloud Functions im kostenpflichtigen Blaze-Tarif), sonst könnte jeder beliebige Siege eintragen.

## Einrichtung

Nur falls der gemeinsame Cloud-Speicher noch nicht eingerichtet ist: siehe `../cloud/README.md`. Für RicoPoly selbst ist nichts zusätzlich zu veröffentlichen.

## Getestet

Die Google-Anmeldung und der Cloud-Abgleich wurden für RicoPoly **nicht** live getestet (in der Testumgebung gibt es kein Google-Konto). Getestet ist nur, dass das Anmeldefeld erscheint und das Spiel ohne Anmeldung vollständig lokal funktioniert.
