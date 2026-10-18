# Spinwelten-Backend (optional, serverautoritativ)

Kleiner HTTP/JSON-Server für die **asynchronen Online-Funktionen** von „Spinwelten 3D“: Angriffe und Raubzüge auf echte
(auch gerade nicht spielende) Spieler, globale Rangliste, Teams mit Geschenken, Kartentausch und eine öffentliche Raumliste
für P2P-Schnellspiel. Das Spiel selbst läuft ohne diesen Server vollständig offline/solo gegen Bots.

- **Keine Abhängigkeiten:** nur Node ≥ 20 Standardbibliothek (`http`, `crypto`, `fs`, `vm`, `node:test`). Kein `npm install`.
- **Eine Quelle der Wahrheit:** Der Server lädt die Spiel-Logik des Spiels (`spinwelten/js/core/rng.js`, `js/data/reels.js`,
  `js/core/economy.js`) per `vm` wie ein Browser-Skript und rechnet mit exakt denselben Tabellen und Formeln.
- **Status:** vollständig implementiert und getestet, **noch nicht deployt**. Ohne eingetragene Server-Adresse meldet der
  Client im Spiel ehrlich „Server nicht eingerichtet“ (`SW.OnlineAPI.status()` → `{ state: 'off' }`).

## Architektur

```
Browser (Spiel)                         spinwelten-backend (eine Node-Instanz)
 js/net/online-api.js  ── HTTPS/JSON ──▶ server.js   HTTP, CORS, 16-KB-Limit, Zeitlimits
   Firebase-ID-Token (AnMaChaCloud)      app.js      Routen, Auth, Rate-Limits, Validierung
   nonce je Aktion                       auth.js     Firebase-ID-Token (RS256, Google-Zertifikate)
                                         transactions.js  Entwürfe → atomarer Commit, nonce-Idempotenz, Audit
                                         economy.js  Konto, Energie, Spin, Bauen, Reparieren
                                         pvp.js / attacks.js / raids.js  Ziele, Schutz, Limits, Rache
                                         teams.js / trades.js / leaderboards.js / events.js / rooms.js
                                         game.js     lädt die Spiel-Logik (SW.rng, SW.REELS, SW.ECON)
                                         storage.js  JSON-Zustand (tmp+fsync+rename) + audit.jsonl
```

- Alle Änderungen einer Anfrage laufen in **einer Transaktion**: Handler arbeiten auf Kopien der betroffenen Datensätze
  (z. B. Angreifer *und* Opfer beim Raub); erst wenn alles geprüft ist, werden alle Kopien synchron übernommen. Bei einem
  Fehler wird nichts übernommen. Vor dem Übernehmen wird geprüft, dass keine Zahl NaN/Infinity/negativ ist.
- Persistenz: Zustand im Speicher, gebündelt (≈ 0,4 s, spätestens 3 s nach einer Änderung) in `DATA_DIR/state.json`
  geschrieben (tmp-Datei → fsync → rename; alle 10 min Kopie nach `state.json.bak`). Schreibvorgänge laufen strikt
  nacheinander. Jede Buchung landet zusätzlich als Zeile in `DATA_DIR/audit.jsonl` (uid, Aktion, nonce, Delta, Zeit).
  Bei SIGTERM/SIGINT wird vor dem Beenden gespeichert.
- Beim Start wird `state.json` geladen. **Beschädigte oder unbekannte Datei → Start verweigert** mit klarer Meldung;
  die Datei und die Sicherung bleiben unverändert. Fehlt `state.json`, aber `state.json.bak` existiert, wird ebenfalls
  nicht gestartet (keine stille Neuanlage über vorhandene Daten).

## Trust-Boundaries

- **Der Browser ist nicht vertrauenswürdig.** Er schickt nur Wünsche (`spin {mult}`, `build {b}`, `raid {target, picks}` …).
  Der Server würfelt (`SW.ECON.roll(SW.rng.secure())`), rechnet Kosten/Belohnungen und bucht. Unbekannte Felder werden ignoriert;
  der Server übernimmt nie Münzen, Stufen oder Ergebnisse vom Client.
- **Uhr nur auf dem Server:** Energie-Regeneration, Ablauf von Aktionen (10 min), Rache-Token (24 h), Angebote (48 h),
  Raum-TTL (90 s) und Event-Rotation hängen ausschließlich an der Server-Uhr.
- **Raub:** Die Anordnung der 6 Fundstellen wird erst **nach** dem Abschicken der 3 Picks serverseitig mit sicherem Zufall
  gemischt – der Client kann sie vorher nicht kennen.
- **Offline-Spielstände werden nie übernommen.** Server-Konten starten neu (Profil `classic`, ngp 0, 5 × Basis Münzen,
  50 Energie) – unabhängig vom Solo-Spielstand im Browser.
- **P2P-Räume sind NICHT serverautoritativ.** Private/öffentliche Echtzeit-Räume laufen per WebRTC über `cloud/fire-peer.js`
  direkt zwischen den Geräten. Der Server führt nur eine öffentliche Liste (Code, Modus, Belegung) und baut **kein** Signaling.
  Ergebnisse aus P2P-Räumen fließen nicht in Server-Konten oder Ranglisten ein.
- **Keine fremden Kennungen nach außen:** Andere Spieler erscheinen nur mit `pid` = HMAC-SHA256(`TARGET_SECRET`, uid)
  (24 Hex-Zeichen), Anzeigename und öffentlichen Spielwerten. Echte uids, Tokens und interne Felder verlassen den Server nie.
- **Anzeigename nur aus dem Token** (`name`-Claim), gefiltert (Buchstaben, Ziffern, Leerzeichen, `-_.`, max. 20 Zeichen),
  sonst „Hüter-XXXX“. Kein Freitext vom Client – auch Teamnamen kommen nur aus einer festen Liste von 40 Namen.

## Anmeldung

`Authorization: Bearer <Firebase-ID-Token>` des Firebase-Projekts `FIREBASE_PROJECT_ID` (Standard `ricorewi-games-save`).
Geprüft werden RS256-Signatur mit den öffentlichen Google-Zertifikaten
(`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`, Cache gemäß `Cache-Control: max-age`),
`aud` = Projekt, `iss` = `https://securetoken.google.com/<Projekt>`, `exp` in der Zukunft, `iat`/`auth_time` nicht in der Zukunft
(5 min Toleranz), `sub` (= uid) 1–128 Zeichen. Anonyme Firebase-Nutzer (`sign_in_provider: anonymous`) dürfen die Raumliste und
Ranglisten nutzen, **alle Konto-Endpunkte antworten ihnen mit 403** `anonymous_not_allowed`.

Testmodus: `AUTH_MODE=test` funktioniert **nur zusammen mit `NODE_ENV=test`** (sonst Startabbruch). Dann dienen eigene öffentliche
Schlüssel (`AUTH_TEST_KEYS_FILE`, JSON `{ kid: PEM }`, oder in den Tests injiziert) als Zertifikatsquelle – geprüft wird über
denselben Code-Pfad wie in Produktion. Nur im Testmodus existiert `POST /v1/test/patch` (Werte setzen, z. B. Münzen auffüllen).

## Endpunkte

Alle Antworten: `{ ok, result?, state?, error? }`. Fehler: `{ ok:false, error:'code' }` mit passendem HTTP-Status
(400 Eingabe, 401 Anmeldung, 402 zu wenig Münzen, 403 verboten/geschützt, 404 unbekannt, 409 Zustand passt nicht, 410 abgelaufen,
413 zu groß, 429 Limit mit `Retry-After`, 503 vorübergehend).
**Konto-Aktionen (POST) brauchen `nonce`** (8–64 Zeichen `[A-Za-z0-9_-]`): Dieselbe nonce vom selben Nutzer liefert die
gespeicherte Antwort erneut (Header `X-Idempotent-Replay: 1`), ohne zweite Buchung. Gespeichert werden die letzten 500 nonces
je Konto für 48 h; die vollständige Antwort für die neuesten 32 (ältere Wiederholung → 409 `nonce_used`, ebenfalls ohne Buchung).
Dieselbe nonce für eine andere Aktion → 409 `nonce_reused`. `state` ist der eigene Kontostand nach der Aktion.

| Methode & Pfad | Anmeldung | Eingabe | Kurz |
|---|---|---|---|
| `GET /v1/health` | – | | `{ ok, version, time }` |
| `GET /v1/events` | – | | aktuelles Event (Rotation alle 3 Tage ab 2026-01-01 UTC), `start`/`end` |
| `GET /v1/teams/names` | – | | 40 feste Teamnamen |
| `POST /v1/account/init` | Konto | `nonce?` | Konto anlegen oder bestehendes liefern; Name aus Token |
| `GET /v1/me` | Konto | | Kontostand: Münzen, Energie (serverseitig regeneriert), Insel, `stages[5]`, `damaged[5]`, Schilde (max 3), `pending`, Karten, Zähler, Baukosten |
| `DELETE /v1/account` | Konto | | Konto löschen (siehe Datenschutz) |
| `POST /v1/spin` | Konto | `nonce, mult` | `mult` ∈ `multsFor(islandsDone)`, Energie ≥ mult. Antwort: `ids`, `outcome`, `reward`, gebuchte `coins`, ggf. `cards`, `pending`, `shieldOverflowCoins`, `actionCoins` |
| `POST /v1/build` | Konto | `nonce, b` (0–4) | eine Stufe, Kosten `buildCost(island,b,stage,'classic',0)`; beschädigt → erst reparieren; alle 5 auf Stufe 5 → nächste Insel (max 30) + Bonus (25 × Basis, 10 Energie) |
| `POST /v1/repair` | Konto | `nonce, b` | Kosten `repairCost(…)` |
| `GET /v1/targets` | Konto | | bis 6 Ziele für die offene Aktion: `target` (pid), `name`, `island`, `stages`, `damaged`, `shield` (bool) |
| `POST /v1/attack` | Konto | `nonce, target, b` | nur mit `pending` attack. Schild blockt genau einmal; sonst intakt → beschädigt, beschädigt → Stufe −1. Bauwerk ohne Stufe → 400 |
| `POST /v1/raid` | Konto | `nonce, target, picks[3]` | nur mit `pending` raid; Beute = Summe × Basis(Angreifer) × mult, gedeckelt durch `raidLootCap`; Antwort mit allen 6 Feldern |
| `POST /v1/revenge` | Konto | `nonce, token` | Rache-Token aus dem Verlauf (einmalig, 24 h) → `pending` attack gegen genau den Verursacher |
| `GET /v1/history` | Konto | | letzte 50 Ereignisse (neueste zuerst) mit `revengeToken` für das Opfer |
| `GET /v1/leaderboard?kind=islands\|coins` | jede | | Top 50 (`name`, `value`) + eigener Rang. islands = islandsDone·1000 + Summe Stufen; coins = verdiente Münzen |
| `POST /v1/teams/create` | Konto | `nonce, name` | Name nur aus `/v1/teams/names` |
| `POST /v1/teams/join` | Konto | `nonce, team` | max. 20 Mitglieder |
| `POST /v1/teams/leave` | Konto | `nonce` | Leiter geht → dienstältestes Mitglied übernimmt; leeres Team wird gelöscht |
| `GET /v1/teams/mine` | Konto | | Mitglieder (pid, Name, Rolle, Ausbauschritte der Woche), Wochenziel |
| `GET /v1/teams?open=1` | jede | | Teams mit freien Plätzen |
| `POST /v1/teams/gift` | Konto | `nonce, to` (pid) | 3 Spins an Teammitglied; max. 5 je Sender und Tag, max. 1 je Empfänger und Tag (UTC) |
| `POST /v1/trades/offer` | Konto | `nonce, to, give, want` | je 1 Karte (`w01c1`…`w30c8`), max. 5 offene Angebote, Ablauf 48 h |
| `POST /v1/trades/accept` | Konto | `nonce, trade` | nur Empfänger; atomarer Tausch, wenn beide die Karten noch besitzen – sonst 409 und nichts passiert |
| `POST /v1/trades/cancel` | Konto | `nonce, trade` | Anbieter oder Empfänger |
| `GET /v1/trades` | Konto | | `incoming`, `outgoing` |
| `POST /v1/rooms/publish` | jede (auch anonym) | `code` (5 aus `ABCDEFGHJKMNPQRSTUVWXYZ23456789`), `mode` race\|duel\|coop, `players` 1–8, `max` 2–8 | Heartbeat = erneut senden; TTL 90 s; 1 Raum je uid; max. 200 |
| `POST /v1/rooms/unpublish` | jede | | |
| `GET /v1/rooms` | jede | | `code, mode, players, max, age` (ohne uid) |
| `GET /v1/rooms/quick?mode=…` | jede | | passender Raum mit freiem Platz oder `null` |

Spielregeln im Detail: Schild-Überlauf (bei 3 Schilden) → stattdessen 10 × Basis × mult Münzen. Nur eine offene Aktion
(`pending`, 10 min); eine zweite Sturm-/Kompass-Aktion wird sofort in Münzen umgerechnet (Ø-Wert aus `SW.ECON.ATTACK/RAID`),
eine verfallene ebenso (Rache verfällt ersatzlos). Truhe → 2 zufällige Karten aus Alben ≤ aktueller Insel.
Anfängerschutz: Konten jünger als 24 h oder Insel 1 mit < 5 Stufen sind nie angreifbar. Pro Ziel max. 3 Angriffe/Raubzüge
pro Stunde von allen, max. 1 pro Stunde vom selben Angreifer (Rache umgeht Schutz und das Angreifer-Limit, nicht das 3/h-Limit).

Rate-Limits (Token-Bucket): Spin 3/s je uid (Burst 5), andere Aufrufe 10/s je uid (Burst 20), 40/s je IP (Burst 80).

## Lokal starten

```bash
cd spinwelten-backend
TARGET_SECRET=$(openssl rand -hex 32) ALLOWED_ORIGINS=http://localhost:8080 PORT=8787 node src/server.js
curl -s localhost:8787/v1/health
```

Ohne echtes Firebase-Token geht lokal nur der Testmodus (eigene Schlüssel, siehe `test/helpers.js`):
`NODE_ENV=test AUTH_MODE=test AUTH_TEST_KEYS_FILE=keys.json PORT=8787 node src/server.js`.

## Tests

```bash
cd spinwelten-backend
npm test          # = node --test test/*.test.js
```

Abgedeckt: Auth (gültig, falsche Signatur, verändert, abgelaufen, falsches aud/iss/kid, anonym → 403, Testmodus ohne
NODE_ENV=test → Startabbruch), 2000 Spins über die Logik-Schicht + 220 über HTTP (Energie nie negativ, Münzen exakt,
Idempotenz auch parallel), Bauen bis Inselabschluss, Reparieren, Insel 30, Angriff (Schild/Schaden/Stufe −1, Anfängerschutz,
Limits je Ziel), Raub (Erhaltung der Münzen, Deckel, nie negativ, doppelte nonce, ohne pending → 409), Rache, Teams, Geschenke,
Tausch inkl. Rückabwicklung, Räume (TTL, Limits), Rangliste, Events, Persistenz/Neustart/Audit, korrupte Datei, CORS,
16-KB-Limit, Rate-Limit, Kontolöschung und der Browser-Client (`test/client.test.js`, inkl. Netz-Wiederholung mit gleicher nonce).

## Deploy

**HTTPS ist Pflicht** (der Client akzeptiert nur `https://`, außer `localhost`). Es läuft **genau eine Instanz**
(Zustand im Speicher + Datei); niemals horizontal skalieren.

Image bauen (im Ordner `spinwelten-backend`, die Spiel-Logik kommt als zweiter Build-Kontext):

```bash
docker build --build-context game=../spinwelten -t spinwelten-backend .
```

### Variante A: kleiner VPS (empfohlen, am einfachsten)

1. Repo auf den Server holen, in `spinwelten-backend/` `.env` aus `.env.example` anlegen (`TARGET_SECRET` setzen).
2. `docker compose up -d --build` (Volume `spinwelten-data` hält `state.json`, `.bak` und `audit.jsonl`).
3. HTTPS davor, z. B. Caddy: `api.example.org { reverse_proxy 127.0.0.1:8080 }` (holt Zertifikate automatisch), `TRUST_PROXY=1`.
4. Backup: das Volume (oder `DATA_DIR`) regelmäßig sichern, z. B. täglich `state.json` kopieren.

Kosten grob: 1 vCPU / 1–2 GB RAM reichen für einige tausend Konten → ca. 4–6 € im Monat.

### Variante B: Google Cloud Run (im bestehenden Firebase-Projekt)

```bash
gcloud run deploy spinwelten-backend --source . --region europe-west3 \
  --max-instances 1 --min-instances 1 --no-cpu-throttling --concurrency 80 \
  --set-env-vars FIREBASE_PROJECT_ID=ricorewi-games-save,ALLOWED_ORIGINS=https://ricorewioriginal-collab.github.io,TRUST_PROXY=1,DATA_DIR=/data \
  --set-secrets TARGET_SECRET=spinwelten-target-secret:latest
```

Hinweise: `--source` nutzt Cloud Build mit nur einem Kontext – vorher die Spiel-Logik nach `spinwelten-backend/game/js/…`
kopieren und `SPINWELTEN_GAME_DIR=/app/game` passend setzen, oder das Image wie oben lokal bauen und nach Artifact Registry
pushen (`--image`). `DATA_DIR` muss auf ein **persistentes** Volume zeigen (Cloud Run Volume-Mount mit Filestore/NFS);
das Container-Dateisystem von Cloud Run ist flüchtig. Cloud-Storage-FUSE ist für das atomare rename/fsync **nicht** geeignet.
Kosten grob: 1 dauerhaft laufende Instanz (min=max=1, CPU immer an) ca. 10–20 € im Monat plus Filestore – deshalb ist
Variante A für den Anfang günstiger.

### Was der Betreiber EINMALIG tun muss

1. Server deployen (Variante A oder B) und unter einer HTTPS-Adresse erreichbar machen.
2. Umgebungsvariablen setzen: `TARGET_SECRET` (Pflicht, zufällig, geheim, nie ändern – sonst ändern sich alle pids),
   ggf. `ALLOWED_ORIGINS`, `FIREBASE_PROJECT_ID`, `TRUST_PROXY=1`, `DATA_DIR` auf ein persistentes Volume.
3. Im Spiel die Server-Adresse eintragen: in `spinwelten/index.html` vor den Spielskripten
   `<script>window.SPINWELTEN_API_BASE = 'https://api.example.org';</script>` setzen (Standard: leerer String = aus),
   oder einzelne Spieler tragen sie in den Einstellungen ein (localStorage `spinweltenSettings.apiBase`).
4. Prüfen: `curl https://api.example.org/v1/health` und im Spiel `SW.OnlineAPI.status()` → `{ state: 'ok' }`.

### Umgebungsvariablen

| Variable | Standard | Bedeutung |
|---|---|---|
| `TARGET_SECRET` | – (Pflicht) | HMAC-Schlüssel für öffentliche Spieler-Kennungen |
| `FIREBASE_PROJECT_ID` | `ricorewi-games-save` | akzeptiertes Firebase-Projekt |
| `ALLOWED_ORIGINS` | `https://ricorewioriginal-collab.github.io` | kommagetrennt; fremde Origins → 403 |
| `PORT` / `HOST` | `8080` / `0.0.0.0` | |
| `DATA_DIR` | `./data` | `state.json`, `state.json.bak`, `audit.jsonl` |
| `TRUST_PROXY` | aus | `1` = Client-IP aus `X-Forwarded-For` (nur hinter eigenem Proxy) |
| `SPINWELTEN_GAME_DIR` | `../spinwelten` | Ordner mit `js/core` und `js/data` des Spiels |
| `AUTH_MODE` | `firebase` | `test` nur mit `NODE_ENV=test` |
| `AUTH_TEST_KEYS_FILE` | – | nur Testmodus |

## Datenschutz

Gespeichert werden je Konto: Firebase-uid, Anzeigename (aus dem Google-Konto, gefiltert und gekürzt), Erstellzeit und
Spielwerte (Münzen, Energie, Insel, Stufen, Schilde, Karten, Zähler, Verlauf der letzten 50 Ereignisse, Teamzugehörigkeit,
offene Tauschangebote) sowie die letzten nonces (Wiederholungsschutz, 48 h). Keine E-Mail-Adresse, kein Foto, keine IP-Adresse
(IP nur flüchtig im Speicher für das Rate-Limit). Das Audit-Log (`audit.jsonl`) enthält uid, Aktion, nonce, Wertänderung und Zeit
und dient der Nachvollziehbarkeit von Buchungen; der Betreiber sollte es nach einer festen Frist (z. B. 90 Tage) rotieren/löschen.
Öffentliche Raumliste: nur im Speicher, nach 90 s ohne Heartbeat weg.

**Löschung:** `DELETE /v1/account` (im Client `SW.OnlineAPI.deleteAccount()`) löscht das Konto sofort samt nonces, Tauschangeboten,
Rache-Token, Teammitgliedschaft und Raum; in den Verläufen anderer Spieler werden Einträge anonymisiert („Gelöschter Spieler“,
ohne Kennung). Der Audit-Eintrag der Löschung bleibt bis zur Rotation des Logs.

## Grenzen

- **Eine Instanz**, Zustand im Speicher, JSON-Datei als Speicher: gut bis etwa einige tausend Konten (Zielsuche und
  Rangliste gehen über alle Konten; Rangliste wird 30 s zwischengespeichert). Für mehr: einen Firestore-Adapter mit der
  Schnittstelle von `storage.js` (`open/data/markDirty/audit/flush/close`) schreiben und Transaktionen dort abbilden.
- Events werden angezeigt und Event-Punkte gesammelt, aber Event-Boni wirken (wie `bonus = {}`) noch nicht auf Spins.
- Kein Tagesbonus (`dailySpins`) auf dem Server.
