# Cloud-Speicher für alle Spiele

Kostenlos, ohne Server, ohne Build-Schritt. Spielstände liegen in Firebase Firestore (Spark-Tarif, 1 GB, 20k Schreibzugriffe/Tag gratis, wird nicht pausiert).
Spieler brauchen kein Konto: Sie bekommen einen geheimen 12-stelligen Code und geben ihn auf anderen Geräten ein.

## Einmalig einrichten (nur du kannst das)
1. https://console.firebase.google.com → Projekt anlegen (Analytics aus).
2. Build → Firestore Database → Datenbank erstellen (Produktionsmodus, Region eur3).
3. Reiter „Regeln“ → Inhalt von `cloud/firestore.rules` einfügen → Veröffentlichen.
4. Projekteinstellungen → „Web-App“ (</>) hinzufügen → `projectId` und `apiKey` kopieren.
5. In `cloud/anmacha-cloud.js` oben bei `CONFIG` eintragen (der apiKey ist öffentlich gedacht, der Schutz sind die Regeln).

## Ein Spiel anbinden (eine Zeile vor `</body>`)
```html
<script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake" defer></script>
```
`data-prefix` = Anfänge der localStorage-Schlüssel, die mitgesichert werden (kommagetrennt). Am Spielcode ändert sich nichts.
Ohne Eintrag in `CONFIG` tut das Skript nichts.

## Funktionsweise
- Pro Schlüssel zählt der neuere Zeitstempel (gewinnt der zuletzt gespielte Stand).
- Schreiben gebündelt (3 s nach Änderung, beim Verlassen), Laden beim Start. Wird beim Start etwas Neueres geladen, lädt die Seite einmal neu.
- Dokument-ID = SHA-256(Spiel + Code); Auflisten und Löschen sind per Regel gesperrt.
- Grenze: wer den Code kennt, hat Zugriff. Keine sensiblen Daten speichern.
