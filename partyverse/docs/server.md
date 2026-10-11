# PARTYVERSE – Spielserver (Online-Modus)

Der Online-Modus braucht einen **eigenen Colyseus-Server** (Node.js). **GitHub Pages kann keinen solchen Server hosten**: Pages liefert nur statische Dateien aus und erlaubt keine laufenden Prozesse oder WebSocket-Verbindungen. Die Webseite (Client) und der Spielserver sind deshalb getrennt:

| Teil | Wo | Was |
| --- | --- | --- |
| Client | GitHub Pages (oder jeder statische Host) | `partyverse/app/` – das gebaute Spiel |
| Server | Ein beliebiger Node-Host (eigener Rechner, VPS, Container-Dienst) | `server/` – Räume, Würfel, Regeln, Minispiel-Prüfung |

Lokale Partien (Hot-Seat, gegen Bots) laufen komplett im Browser und brauchen **keinen** Server und keine Umgebungsvariablen.

## Lokal starten

```bash
cd partyverse
npm install
npm run server          # Entwicklungsmodus (tsx), Port 2567
npm run dev             # Client auf http://localhost:5173
```

Im Spiel: *Optionen → Online-Server* `ws://localhost:2567` eintragen (oder beim Bauen `VITE_SERVER_URL=ws://localhost:2567` setzen). Ein Gesundheitstest ist unter `http://localhost:2567/health` erreichbar.

## Produktion

```bash
npm ci
npm run server:build    # erzeugt server/dist/server.mjs
PORT=2567 ALLOWED_ORIGINS=https://deinname.github.io npm run server:start
```

| Variable | Bedeutung |
| --- | --- |
| `PORT` | Port des Servers (Standard 2567) |
| `ALLOWED_ORIGINS` | Komma-getrennte Liste erlaubter Browser-Herkünfte (z. B. die Pages-Adresse). Leer = alle erlaubt (nur zum Testen!) |

Es werden **keine Geheimnisse** gebraucht. Für Browser auf `https://`-Seiten muss der Server per **`wss://`** erreichbar sein (TLS über einen Reverse-Proxy wie Caddy/nginx oder die Terminierung des Hosts). Reverse-Proxy: WebSocket-Upgrade weiterreichen.

### Docker

```bash
docker build -f server/Dockerfile -t partyverse-server .
docker run -p 2567:2567 -e ALLOWED_ORIGINS=https://deinname.github.io partyverse-server
```

## Was der Server entscheidet

Der Server ist die einzige Instanz für Spielregeln: Zugrecht, Würfel (privater Zufallsgenerator, nie an Clients gesendet), Bewegung, Ressourcen, Gegenstände, Ereignisse und Siegbedingungen. Minispiel-Ergebnisse werden **nachgerechnet**: Clients senden nur ihr Eingabeprotokoll, der Server simuliert das Spiel mit demselben Startwert und akzeptiert nur das berechnete Ergebnis. Nachrichten werden geprüft (Form, Länge, Rate), Namen bereinigt.

- Räume: öffentlich (in der Liste) oder privat (4-stelliger Code).
- Bis zu 4 Spieler, Host-Rechte für Start, Konfiguration und Bots.
- Verbindungsabbruch: Rückkehr per Wiederverbindungs-Token (Seite neu laden funktioniert), sonst übernimmt nach der Karenzzeit ein Bot.

## Grenzen

Ein Server-Prozess hält alle Räume im Speicher. Für mehrere Instanzen wäre ein externer Matchmaking-/Presence-Dienst nötig (nicht enthalten).
