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
Google sperrt die Anmeldung in App-Fenstern. Deshalb koppelt sich die App über den Browser: Sie zeigt einen Link `…/#koppeln=<Code>`, auf der Seite (ricorewi-radio.de, Skript eingebunden) meldet man sich mit Google an, die App erkennt die Kopplung automatisch und nutzt danach denselben Cloud-Speicher wie im Web. Dafür muss der Block `match /pair/{code}` aus `firestore.rules` veröffentlicht sein.
