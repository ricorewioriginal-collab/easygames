# Stand – RicoLife 3D

Stand: 17.10.2026 · Spielstand-Version 1 · Service-Worker-Cache `eg-ricolife-v1`

## Fertig

- **Stadt Lindenhafen:** 3 Bezirke, 25 Grundstücke, Tag/Nacht, Jahreszeiten, Wetter, 47 Stadtbewohner mit Tagesablauf
- **Figuren:** Haushalt-Editor mit 3D-Vorschau (Aussehen, Kleidung, Merkmale, Lebensziel), Altersstufen, Haustiere
- **Leben:** 8 Bedürfnisse, Emotionen, Autonomie, Warteschlange mit Abbrechen, Reservierungen von Plätzen
- **Soziales:** 44 Handlungen, Freundschaft/Romantik, Familie, Nachwuchs, Einziehen
- **Beruf und Geld:** 9 Berufe (3 vor Ort spielbar), Schule, Lohn, wöchentliche Rechnungen, Haushaltsbuch
- **Bau-/Kaufmodus:** Wände, Böden, Räume, Treppen, 159 kaufbare Objekte, Fertighäuser, Rückgängig/Wiederholen
- **Geschichten:** 3 Geschichten mit je 8 Aufgaben, 46 Zufallsereignisse
- **Speichern:** 3 Plätze, Sicherungskopie, Export/Import, Autosave, Google-Spielstand über `anmacha-cloud`
- **Mehrspieler:** Besuch über Code mit bis zu 3 Gästen über `cloud/fire-peer.js` (Firebase-Vermittlung, WebRTC); Gastgeber rechnet, Gäste steuern ihre eigene Figur und chatten
- **Steuerung:** Touch, Maus/Tastatur (umbelegbar), Controller
- **PWA:** offline spielbar, installierbar, Update-Hinweis „Neue Version verfügbar – Jetzt aktualisieren“

## Grenzen

- **Nicht auf echter Hardware getestet.** Alle Browser-Tests liefen in Chromium mit Software-Grafik (SwiftShader), Handys nur als Emulation (Pixel 7 hoch/quer). Leistung auf echten Handys und echten Controllern ist ungeprüft.
- Auf den Handy-Profilen läuft nur der Handy-Test F; die übrigen Abläufe (A–E, G–M) laufen auf dem Desktop-Profil.
- Gäste im Mehrspieler dürfen nicht bauen, kaufen, arbeiten gehen oder Familienentscheidungen treffen (Schutz des Gastgeber-Spielstands). Fällt der Gastgeber weg, endet der Besuch; der Gast kann seine Figur behalten.
- Mehrspieler braucht Internet; offline geht nur Einzelspieler.
- 6 der 9 Berufe laufen „im Hintergrund“ (Figur fährt weg und kommt mit Lohn zurück).
- Grafik ist bewusst schlicht (prozedurale Modelle, keine Fremd-Assets), siehe [ASSETS.md](ASSETS.md).

## Firestore-Regeln

Keine Änderung nötig: Der Mehrspieler nutzt nur die bestehende Vermittlung von `cloud/fire-peer.js`.
