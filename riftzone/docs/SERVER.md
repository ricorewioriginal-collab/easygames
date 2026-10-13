# RIFTZONE-Server (Ubuntu)

Der Server verwaltet Lobbys, Gruppen, Warteschlangen und private Matches und rechnet jedes Match **autoritativ**:
Bewegung, Treffer, Schaden, Inventar, Bauen, Zone und Platzierung entscheidet nur der Server. Clients schicken
ausschließlich Eingaben (Bewegungsrichtung, Blickwinkel, Tasten, Einmal-Aktionen).

GitHub Pages kann keinen solchen Server betreiben (nur statische Dateien). Client und Server sind daher getrennt:

| Teil   | Wo                                         | Was                                  |
| ------ | ------------------------------------------ | ------------------------------------ |
| Client | GitHub Pages (`riftzone/app/`) oder Server | das gebaute Spiel                    |
| Server | eigener Ubuntu-Rechner/VPS                 | `riftzone/server/` (Node.js ≥ 20.19) |

## Schnellinstallation (Ubuntu 22.04/24.04)

```bash
git clone https://github.com/ricorewioriginal-collab/easygames.git
cd easygames/riftzone
sudo bash deploy/install.sh
```

Das Skript installiert bei Bedarf Node.js 22, legt den Systembenutzer `riftzone` an, kopiert alles nach
`/opt/riftzone`, baut den Server, legt `/etc/riftzone.env` an und startet den systemd-Dienst `riftzone`.

- Status: `systemctl status riftzone` · Logs: `journalctl -u riftzone -f`
- Gesundheit: `curl http://127.0.0.1:2610/health`
- Einstellungen ändern: `/etc/riftzone.env` bearbeiten, dann `sudo systemctl restart riftzone`

## TLS (wss://)

Browser auf `https://`-Seiten (z. B. GitHub Pages) dürfen nur `wss://` verbinden. Den Server deshalb hinter einen
Reverse-Proxy mit Zertifikat stellen – Beispiele: [`deploy/Caddyfile.example`](../deploy/Caddyfile.example) (Caddy holt
Zertifikate automatisch) und [`deploy/nginx.conf.example`](../deploy/nginx.conf.example). Der WebSocket liegt unter `/ws`.

Im Spiel dann unter *Einstellungen → Online* z. B. `riftzone.example.de` eintragen (wird zu `wss://riftzone.example.de/ws`).
Alternativ lässt sich der Server direkt über die URL vorgeben: `…/riftzone/app/?server=riftzone.example.de`.

## Einstellungen (Umgebungsvariablen)

| Variable            | Standard   | Bedeutung                                                                 |
| ------------------- | ---------- | ------------------------------------------------------------------------- |
| `PORT` / `HOST`     | 2610 / 0.0.0.0 | Adresse des HTTP-/WebSocket-Servers                                    |
| `ALLOWED_ORIGINS`   | leer       | erlaubte Webseiten (Komma-getrennt). **Leer = alle** (nur zum Testen)      |
| `DATA_DIR`          | `./data`   | Ablage der Rangliste (`stats.json`)                                       |
| `PUBLIC_MATCH_SIZE` | 100        | Teilnehmer je öffentlichem Match (fehlende Plätze füllen Bots)            |
| `QUEUE_WAIT`        | 25         | Sekunden Wartezeit, bevor ein öffentliches Match mit Bots startet         |
| `MIN_HUMANS`        | 1          | Mindestzahl Menschen für ein öffentliches Match                           |
| `MAX_MATCHES`       | 8          | gleichzeitige Matches (Schutz vor Überlast)                               |
| `SNAPSHOT_EVERY`    | 2          | Zustandspaket alle n Ticks (Simulation 30 Hz → 15 Hz Pakete)              |
| `BOT_SKILL`         | 1          | Bot-Stärke in öffentlichen Matches (0–2)                                  |
| `STATIC_DIR`        | leer       | optional: Ordner mit dem gebauten Spiel mitausliefern (z. B. `/opt/riftzone/app`) |

## Docker

```bash
cd riftzone
docker build -f server/Dockerfile -t riftzone-server .
docker run -d -p 2610:2610 -v riftzone-data:/data -e ALLOWED_ORIGINS=https://deinname.github.io riftzone-server
```

## HTTP-Schnittstellen

- `GET /health` – Zustand, Version, Spieler online, laufende Matches
- `GET /api/leaderboard` – Top 50 (Siege, Ausschaltungen, Matches)
- `GET /api/status` – Kurzstatus
- `WS /ws` – Spielverbindung (JSON für Lobby, binär für Eingaben/Spielzustand)

## Was der Server leistet

- **Matchmaking:** Warteschlangen je Modus (Solo/Duo/Squad × mit/ohne Bauen). Gruppen werden gemeinsam eingereiht und
  landen im selben Team; nach `QUEUE_WAIT` startet das Match und Bots füllen auf.
- **Gruppen:** Code mit 5 Zeichen, max. 4 Mitglieder, Gruppenleitung startet, andere melden „bereit“, Einladungslink.
- **Private Lobbys:** Code, Host legt Teamgröße, Bauen, Teilnehmerzahl, Bots, Bot-Stärke und Zonentempo fest.
- **Freunde:** Spieler-ID (erste 8 Zeichen) eintragen → Anwesenheit (online/im Match) und Gruppeneinladung.
- **Wiederverbindung:** Bricht die Verbindung ab, spielt die KI die Figur weiter. Beim erneuten Verbinden (gleiches
  Gerät/Profil, bis 30 min) übernimmt man sie wieder.
- **Schutz:** Server-Autorität für alle spielentscheidenden Werte, Prüfung von Version/ID, Ratenbegrenzung
  (Lobby-Nachrichten ≤ 30/s, Eingabepakete ≤ 70/s), Nachrichten-Größenlimits, Plausibilitätsgrenzen für Eingaben,
  bereinigte Namen, Herkunftsprüfung (`ALLOWED_ORIGINS`), Überlastschutz beim Senden.
- **Netzcode:** 30-Hz-Simulation, binäre Zustandspakete mit Interessenbereich (≈ 360 m + Teammitglieder),
  Snapshot-Interpolation, Client-Vorhersage mit Abgleich (auch für Fahrer), Lag-Kompensation bis 350 ms.

## Grenzen

- Ein Serverprozess hält alle Matches im Speicher; horizontales Skalieren über mehrere Prozesse ist nicht eingebaut.
- Es gibt keine Konten mit Passwort: Identität ist eine zufällige Profil-ID aus dem Browser. Wer sie kennt, kann sie
  verwenden. Für öffentliche Server mit Wertungen sollte eine echte Anmeldung ergänzt werden.
- Bandbreite: bei 100 Teilnehmern etwa 15–35 KB/s je Spieler (abhängig von der Spielerdichte in der Nähe).
