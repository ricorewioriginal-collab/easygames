# Firebase und Google-Speicher

## Stand heute
- RicoVille bindet `../cloud/anmacha-cloud.js` ein: `data-game="ricoville"`, `data-prefix="ricoville.save,ricoville.profile"`, `data-mount="#cloudMount"`. Der Anmelde-Bereich erscheint im Startmenü und im Profil.
- Gesichert werden Stadt, Sandkasten und Profil. Lokale Sicherungskopien und Einstellungen bleiben auf dem Gerät.
- Getestet: Einbindung statisch (`tools/test-cloud-games.cjs`) und im Browser (Skript lädt, Knopf erscheint, Schlüssel wird erfasst, Einstellungen werden nicht erfasst). **Nicht getestet:** echte Google-Anmeldung und echte Firestore-Schreibvorgänge, denn dafür fehlt in der Entwicklungsumgebung ein Google-Konto bzw. Netzzugang zu Firebase.

## Nachbarn, Besuche, Geschenke (Spark-Tarif, ohne Cloud Functions)
Alles läuft direkt zwischen Spiel und Firestore. Die Sicherheit kommt allein aus den Regeln im RicoVille-Block von `cloud/firestore.rules`:
- `ricoville_cities/{uid}`: öffentliche Kurzansicht (Name, Wappen, Motto, Level, Einwohner, Grundriss; keine Münzen, kein Lager). Lesen dürfen Angemeldete, Listen höchstens 30 auf einmal, schreiben nur der Besitzer mit geprüften Feldern und Größen.
- `…/neighbors/{nid}`: eigene Nachbarliste, nur der Besitzer.
- `…/inbox/{id}`: Post von anderen. Anlegen nur mit fester ID `absender_tag_art`, also höchstens eine Nachricht je Absender, Art und UTC-Tag; Tag = heute laut Server-Uhr; Geschenke nur Bretter, Ziegel, Glas, Stahl oder Holz; Besuch höchstens 5 Hilfen. Der Besitzer darf nur `done` setzen und alte Nachrichten löschen.

**Einmal einrichten (nur du):** Firebase-Konsole → Firestore Database → Regeln → den ganzen Inhalt von `cloud/firestore.rules` einfügen → Veröffentlichen. Die Datei enthält weiter alle bisherigen Regeln, es geht nichts verloren. Ohne diesen Schritt zeigt das Nachbarn-Fenster „Nicht erlaubt. Sind die Nachbar-Regeln in Firebase veröffentlicht?".

**Regeln testen (lokal, Java 11+ nötig):** `cd ricoville-src/firebase && npm ci && npm test` startet den Firestore-Emulator und prüft die Regeln mit 10 Tests, darunter, dass die bisherigen Spielstand-Regeln unverändert gelten.

**Grenzen:** Ohne Server kann ein Spieler seinen eigenen Stand verändern (wie bisher). Anderen schicken kann er nur, was die Regeln zulassen: je Nachbar und Tag ein kleines Geschenk und einen Besuch mit höchstens 5 Hilfen. Das Spiel prüft fremde Daten zusätzlich (`src/social/codec.ts`).
