# Firebase und Google-Speicher

## Stand heute
- RicoVille bindet `../cloud/anmacha-cloud.js` ein: `data-game="ricoville"`, `data-prefix="ricoville.save,ricoville.profile"`, `data-mount="#cloudMount"`. Der Anmelde-Bereich erscheint im Startmenü und im Profil.
- Gesichert werden Stadt, Sandkasten und Profil. Lokale Sicherungskopien und Einstellungen bleiben auf dem Gerät.
- Getestet: Einbindung statisch (`tools/test-cloud-games.cjs`) und im Browser (Skript lädt, Knopf erscheint, Schlüssel wird erfasst, Einstellungen werden nicht erfasst). **Nicht getestet:** echte Google-Anmeldung und echte Firestore-Schreibvorgänge, denn dafür fehlt in der Entwicklungsumgebung ein Google-Konto bzw. Netzzugang zu Firebase.

## Für Nachbarn, Besuche, Geschenke (noch nicht gebaut)
1. Eigene Collections laut Entwurf `firebase/firestore.rules` (`ricoville_public`, `ricoville_neighbors`, `ricoville_gifts`).
2. Cloud Functions (Node, Admin-SDK) für alles, was fremde Daten ändert: Anfrage senden/annehmen, Besuch belohnen (Tageslimit), Geschenk senden. Funktionen prüfen Anmeldung, Limits und Werte.
3. Lokal testen mit dem Emulator: `cd ricoville-src/firebase && npx firebase-tools emulators:start` (Konfiguration `firebase.json`).
4. Ausrollen braucht Zugang zum Firebase-Projekt (Blaze-Tarif für Functions). Dieser Zugang lag bei der Entwicklung nicht vor.
