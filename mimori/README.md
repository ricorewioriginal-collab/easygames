# Mimori – Deine 3D-Haustier-App

Mobile-first-Tamagotchi-Spiel innerhalb von EasyGames für Android-Browser, PWA, Tablet und Desktop.

## Bedienung

- **Großes 3D-Wesen:** direkt auf dem Bildschirm mit dem Finger nach links/rechts wischen und frei herumdrehen. Maus ziehen funktioniert ebenfalls. Mit ↶ / ↷ kannst du auch über große Tasten drehen, ● richtet das Wesen wieder nach vorne aus.
- **Darunter die Pflegetasten:** Füttern 🍓, Spielen 🪀, Baden 🫧, Schlafen 🌙, Kuscheln 💞 und Sternfang ⭐.
- **Weitere Spielereien:** Tanzen 🎵, eine eigene Stimme 🎶 und Überraschungen 🎁, jeweils mit eigens programmierten Sounds und Effekten.
- **Oben links:** Name, Alter und Figurenart. **Oben rechts:** Entwicklungsstufe und ⚙ Einstellungen.
- **Einstellungen (mobiler Drawer):** Figurenwechsel, Fellfarbe, Ton ein/aus, Name, optionale Erinnerungen, Spielanleitung und Google-Speicherung.

## Vier eigenständige 3D-Wesen

Jeder der vier Typen hat eine eigene Modellstruktur, nicht bloß dieselbe Figur in anderen Farben.

| Wesen | Körperbau |
|---|---|
| **Fluffi** | Runder Langohren-Hase mit Puschelschwanz |
| **Nubbi** | Niedriger kugeliger Otter mit Rückenpanzer und Antennen |
| **Foxi** | Schlanker kleiner Fuchs mit spitzen Ohren, längerer Schnauze und buschigem Schweif |
| **Drachi** | Kleiner Drache mit Schnauze, Hörnern, Rückenstacheln, Flügeln und Schwanz |

Alle Typen unterstützen vier Fellfarben. Beim Wechsel bleiben Futter, Erfahrung, Alter und die anderen Werte des bisherigen Haustiers erhalten. Die ausgewählte Figurenart wird im normalen Spielstand gespeichert, auch bei älteren vorhandenen Spielständen funktioniert der Standardtyp Fluffi.

## Unterschiedliche Sounds und Animationen

Alle Töne werden mit Web Audio lokal synthetisiert, ohne Audio-Dateien oder fremde Samples:
- Kuscheln: mehrstimmiges tiefes, rhythmisch modulierendes **Schnurren**
- Füttern: kleine Kau-/Schmatzgeräusche
- Baden: Blubbern und aufsteigende Blasenklänge
- Schlafen: leises, langsames Ausatmen
- Spielen: schnelle, hüpfende Töne
- Tanzen: kleine rhythmische Tonfolge
- Jedes Wesen hat eine charakteristische Begrüßungsstimme

Beim Spielen gibt es unterschiedliche Sterne/Herzen/Blasen-Partikel, Bewegungen und Wachstumseffekte.

## Speicherstand und Google

Mimori speichert `easygames.mimori.v1` automatisch lokal. Google-Sync nutzt das **bereits vorhandene** `cloud/anmacha-cloud.js` mit `data-game="mimori"` und dem vorhandenen Firebase-Projekt; zusätzliche Zugangsdaten werden nicht benötigt. Die Anmeldung bleibt freiwillig. Funktioniert bei vorhandenem Google-Login und Onlinezugang gemäß `cloud/README.md`. Die Cloud-Synchronisation wird bei einem anderen Gerät aus der gespeicherten Figur inklusive Typ und Farbe wiederhergestellt.

## Erinnerungen

Freiwillige lokale Browser-/PWA-Benachrichtigungen. Die Anwendung muss laufen; eine vollständig geschlossene oder vom Betriebssystem pausierte App verschickt **keine** Meldungen. Ruhezeit 22–8 Uhr, maximal drei Meldungen/Tag, zeitlicher Mindestabstand. Ein Push-Server ist nicht nötig. Die Browser-Berechtigung wird erst angefragt, wenn jemand die Erinnerungen aktiv einschaltet.

## Testen

```bash
node tools/test-mimori.cjs
node tools/build-sync.js --check
```

Die Regressionstests prüfen u. a. vier voneinander abweichende Modellgeometrien, gespeicherte Figuren-/Farbauswahl, Touch-Rotation, Pfeiltasten, Pflegeaktionen, Bonusaktionen, lokale Erinnerungen und die Cloud-Einbindung. Die automatisierte WebGL-Simulation ersetzt **keinen echten Test** auf Android, iOS und Desktop; Google-Login und echte Audioausgabe müssen auf Geräten geprüft werden.
