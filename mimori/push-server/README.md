# Mimori Web Push – eigener Node-Server

Nur erforderlich, wenn Erinnerungen **auch bei geschlossenem Spiel** ankommen sollen. Die 3D-App funktioniert
ohne Server und ohne Anmeldung; aus der statischen Web-App allein lassen sich keine zuverlässigen
Hintergrundbenachrichtigungen verschicken.

## Voraussetzungen

- Node.js **20 oder neuer**, HTTPS-Subdomain mit Reverse Proxy auf `127.0.0.1:8787`.
- Eine eigene, dauerhaft laufende Server-Instanz (z.B. per systemd). Das Prozessintervall prüft alle 15 Minuten.
- Öffentlicher, von der Web-App erreichbarer HTTPS-Origin und gültige Web-Push-VAPID-Schlüssel.

## Einrichtung (auf eigenem Rechner/Server)

```bash
cd mimori/push-server
npm install --omit=dev
cp .env.example .env
npx web-push generate-vapid-keys
```

Öffne danach `.env` und trage die zwei generierten VAPID-Schlüssel ein. **Der PRIVATE-Schlüssel darf niemals
in GitHub, im Spielcode oder im Browser stehen.** `VAPID_SUBJECT` sollte `mailto:kontakt@example.de`
sein, keine Beispieladresse. `ALLOWED_ORIGINS` muss die tatsächliche HTTPS-Origin der Webseite(n) enthalten.
Nicht den vollständigen `/mimori/`-Pfad angeben. Beispiel:
`https://ricorewioriginal-collab.github.io`.

Starte den Dienst:

```bash
npm start
```

Der Prozess lauscht nur auf `127.0.0.1`. Für öffentliche Nutzung richte im vorhandenen Webserver einen
**HTTPS-Reverse-Proxy** auf diesen Port ein und verwende eine richtige Domain, beispielsweise
`https://push.deinedomain.de`. In KeyHelp lässt sich die passende Subdomain durch die bestehende
Serververwaltung und Reverse-Proxy-Konfiguration anbinden; bitte keine fremden KeyHelp-Sites überschreiben.

Danach `mimori/push-config.json` mit der öffentlichen **HTTPS-Basisadresse** befüllen. Die Spielseite
liest die öffentliche VAPID-Adresse mit `GET /api/config` aus. Über `POST /api/subscribe` wird nur
nach Benutzerzustimmung ein Gerät registriert; `POST /api/state` aktualisiert seinen Pflegestand,
`POST /api/unsubscribe` entfernt das Abo und `POST /api/test` sendet eine Testmeldung.

## Verhalten, Sicherheit und Grenzen

- Meldungen bei einem Wert von 35 % oder darunter. Ruhezeit standardmäßig 22:00–08:00 lokaler Gerätezeit.
- Maximal drei automatische Meldungen pro UTC-Tag und fünf Stunden Abstand pro Bedürfnis.
- Ungültige Push-Endpunkte werden nach Status 404/410 entfernt. Die Endpunkt-Domains sind auf typische
  Browser-Push-Dienste beschränkt, um SSRF zu reduzieren.
- Nur explizit zugelassene Web-Origin(s) dürfen per Browser Anfragen stellen; einfache IP-Rate-Limits aktiv.
- Der Browser generiert eine zufällige Geräte-ID (Token). Es gibt keine serverweite Nutzeranmeldung.
  Bei Verlust der lokalen Geräte-ID kann ein alter Eintrag bestehen bleiben, bis der Browser-Push-Dienst
  ihn zurückweist. Ein produktiver großer Dienst benötigt zusätzlich Nutzerkonten und eine Datenbank.
- Daten liegen lokal im `data/subscriptions.json` des Servers (Serverdatei **nicht öffentlich zugänglich**).
  Das Verzeichnis liegt in `.gitignore`, enthält sensible Push-Endpunkte und muss geschützt werden.
- Private VAPID-Schlüssel, Prozesskontrolle und Reverse Proxy sind noch nicht in diesem Repository
  vorkonfiguriert. Ohne deren Einrichtung ist Push auf GitHub Pages **nicht aktiviert**.
- Keine stille Push-Zustellung: Jeder empfangene Push erzeugt eine sichtbare Benachrichtigung.

### Tests

`node ../../tools/test-mimori.cjs` prüft die Benachrichtigungslogik ohne Netzwerk.
Echte Web-Push-Zustellung mit verbundenen Geräten separat testen.
