# Tests

| Befehl | Was | Wo |
|---|---|---|
| `npm test` | 41 Unit-Tests (davon 11 Nachbarn: Tageslimits, Kurzansicht ohne Münzen, Größengrenze, Prüfen fremder Daten und Post): Kataloge (Mindestinhalte, Verweise), Platzieren, Drehen, Versetzen, Abriss, Straßen, Einwohnergrenze, Miete einmalig, Mietfaktor, Ernte, volles Lager, Produktionskette Weizen→Mehl→Brot→Bäckerei, Ausstrahlung, Energie, Entspannt-Modus, Offline und Uhr-Rückstellung, Baustellen, Level, Aufgabe einmal einlösen, Erweiterung, Tagesziele, Bahnauftrag, Hafen; Speichern (Hin und zurück, Prüfsumme → Sicherung, zwei Tabs, getrennter Kreativ-Platz, Migration) | `tests/` |
| `npm run test:e2e` | Browser-Tests mit echtem WebGL (SwiftShader) auf Desktop 1280×720, Pixel 7 hochkant und quer: Startmenü ohne Fehler und ohne fremde Markennamen, kein seitliches Scrollen; neue Stadt, Haus bauen per Klick/Tippen, Bauzeit, Miete kassieren, Neuladen mit Weiterspielen; Straße malen, Acker säen und ernten; langer Ablauf (30 Runden spielen, Aufgaben einlösen, Level steigen, Kreativ-Platz getrennt); Nachbarn mit nachgebildetem Konto und Firestore (Post annehmen, finden, hinzufügen, besuchen, helfen, beschenken, heimkehren) | `e2e/` |
| `cd firebase && npm test` | 10 Tests der Firestore-Regeln im Emulator (Nachbarn, Post, Fälschungen, bestehende Spielstand-Regeln) | `firebase/` |
| `node tools/test-cloud-games.cjs ricoville` (im Repo-Hauptordner) | Cloud-Skript-Einbindung im Browser | `../tools/` |

Die E2E-Tests bauen das Spiel nach `../ricoville/` und liefern das Repo-Hauptverzeichnis aus (`e2e/serve.mjs`), damit Pfade wie auf GitHub Pages stimmen. Mit `?e2e=1` stellt das Spiel `window.__rv` bereit (Zeit vorspulen, Feld → Bildschirm). Ohne diesen Parameter gibt es keinen Zeitsprung.

Lokales Chromium statt Download: `PW_CHROMIUM=/pfad/zu/chrome npm run test:e2e`.

Nicht automatisch getestet: echte Google-Anmeldung, Nachbarn gegen echtes Firebase, Safari/iOS, Firefox, echte Handys (nur Chromium-Emulation), Service-Worker-Update im installierten Zustand.
