# Cloud-Speicher für alle Spiele

Kostenlos, ohne Server, ohne Build-Schritt. Spielstände liegen in Firebase Firestore (Spark-Tarif, 1 GB, 20k Schreibzugriffe/Tag gratis, wird nicht pausiert).
Spieler melden sich mit einem Klick auf ☁ → „Mit Google anmelden“ an; ihr Fortschritt folgt ihnen auf jedes Gerät.

## Einmalig einrichten (nur du kannst das)
1. https://console.firebase.google.com → Projekt anlegen (Analytics aus).
2. Build → Authentication → Anmeldemethode → Google aktivieren. Unter Einstellungen → Autorisierte Domains `ricorewioriginal-collab.github.io` hinzufügen.
3. Build → Firestore Database → erstellen (Produktionsmodus, Region eur3) → Reiter „Regeln“ → Inhalt von `cloud/firestore.rules` einfügen → Veröffentlichen.
4. Projekteinstellungen → Web-App (</>) hinzufügen → `projectId` und `apiKey` kopieren und oben in `cloud/anmacha-cloud.js` bei `CONFIG` eintragen (der apiKey ist öffentlich gedacht, der Schutz sind die Regeln).

## Ein Spiel anbinden (eine Zeile vor `</body>`)
```html
<script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake" defer></script>
```
`data-prefix` = Anfänge der localStorage-Schlüssel, die mitgesichert werden (kommagetrennt). Am Spielcode ändert sich nichts.
Ohne Eintrag in `CONFIG` tut das Skript nichts.

## Funktionsweise
- Pro Schlüssel zählt der neuere Zeitstempel (gewinnt der zuletzt gespielte Stand).
- Schreiben gebündelt (3 s nach Änderung, beim Verlassen), Laden beim Start. Wird beim Start etwas Neueres geladen, lädt die Seite einmal neu.
- Daten liegen unter `users/<uid>/saves/<spiel>`; die Regeln erlauben nur dem eigenen Nutzer Lesen und Schreiben.
- Das Firebase-SDK wird nur geladen, wenn sich ein Spieler angemeldet hat; sonst bleibt alles bei localStorage.

## Apps (Android/Windows)
Erkannt werden die RicoReWi-App (`appassets.local`), die easygames-App (`appassets.androidplatform.net` bzw. JS-Brücke `EasyGamesApp`) und Windows (User-Agent `RicoReWiApp/`). Nur dort gilt die Kopplung; in normalen Browsern läuft die Anmeldung direkt.

Google sperrt die Anmeldung in App-Fenstern. Deshalb koppelt sich die App über den Browser: Sie zeigt einen Link `…/#koppeln=<Code>`, auf der Seite (ricorewi-radio.de, Skript eingebunden) meldet man sich mit Google an, die App erkennt die Kopplung automatisch und nutzt danach denselben Cloud-Speicher wie im Web. Dafür muss der Block `match /pair/{code}` aus `firestore.rules` veröffentlicht sein, und `www.ricorewi-radio.de` sowie `ricorewi-radio.de` müssen unter Authentication → Einstellungen → Autorisierte Domains stehen (dort findet die Anmeldung statt).

## Ältere Sicherung (genau eine je Nutzer und Spiel)

Ersetzt beim ersten Abgleich einer Sitzung (Start oder Anmeldung) der neuere Stand einen abweichenden älteren (egal ob lokal oder in der Cloud), wird der ersetzte Eintrag im Dokument `users/<uid>/saves/<spiel>__alt` aufgehoben und überschreibt dabei die vorherige Sicherung. Im Cloud-Fenster stellt „Älteren Stand wiederherstellen“ sie zurück und tauscht sie mit dem aktuellen Stand, es bleibt also immer genau eine ältere Sicherung. Die Firestore-Regeln decken das Dokument bereits ab (`{game}` ist ein Platzhalter), es ist nichts neu zu veröffentlichen. Apps mit eigenem Abgleich (Favoriten in Android/Windows, ZOTIK-Apps) haben das noch nicht.

## Ranglisten (öffentliche Bestenlisten, nur mit Freigabe)
`cloud/anmacha-board.js` wird von `anmacha-cloud.js` automatisch nachgeladen und zeigt neben dem ☁-Knopf einen 🏆-Knopf: Top 25 je Spiel (auch ohne Anmeldung lesbar). Mitmachen:
Google-Anmeldung → Spitzname (2–20 Zeichen) wählen → „Bestwerte öffentlich zeigen“. Öffentlich sind **nur Spitzname, Bestwert und Zeitpunkt** (keine Google-Daten). „Freigabe beenden“ löscht alle eigenen Einträge in allen Spielen.
- Daten: `boards/<spiel>[__<modus>]/e/<uid>` = `{ n, s, o, t }`. Regeln: jeder schreibt nur seinen eigenen Eintrag, ein Eintrag wird nur besser (nie schlechter), Löschen jederzeit.
- Welche Spiele/Werte: Registry `REG` oben in `cloud/anmacha-board.js` (Schlüssel = `data-game`; `key`/`path` zeigen auf den localStorage-Wert, `agg: 'sum'|'max'|'min'` + `*` fasst z. B. Punkte aller Level zusammen). Neues Spiel: Eintrag ergänzen, `node tools/test-board.mjs` prüft Schlüssel, Präfix und Skriptpfad.
- Spiele mit abweichendem Skriptpfad (Kiko: `vendor/`) setzen `data-board-src`; `data-board="off"` schaltet die Rangliste eines Spiels ab.
- **Einmalig in der Firebase-Konsole:** Firestore → Regeln → den neuen Inhalt von `cloud/firestore.rules` einfügen und veröffentlichen (sonst zeigen die Ranglisten „noch nicht freigeschaltet“).
- Die Werte kommen vom Gerät des Spielers und sind **nicht manipulationssicher** (Spaß-Ranglisten). Unpassende Spitznamen/Einträge entfernst du in der Konsole unter `boards/…/e/…`.
