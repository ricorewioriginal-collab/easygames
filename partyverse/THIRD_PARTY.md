# Drittanbieter-Software

PARTYVERSE verwendet **keine fremden Assets**: Figuren, Welten, Musik und Klänge sind eigene Arbeiten (3D-Modelle aus Code, Musik und Effekte prozedural erzeugt).

Folgende Open-Source-Bibliotheken werden eingesetzt (Version und Lizenz aus `package.json` bzw. `node_modules/*/package.json` geprüft):

| Paket | Version | Lizenz | Verwendung |
| --- | --- | --- | --- |
| three | 0.170.0 | MIT | 3D-Darstellung |
| colyseus | 0.15.57 | MIT | Spielserver (Online-Modus) |
| colyseus.js | 0.15.28 | MIT | Client für den Online-Modus |
| @colyseus/schema | 2.0.37 | MIT | Zustandssynchronisierung |
| @colyseus/ws-transport | 0.15.3 | MIT | WebSocket-Transport des Servers |
| express | 4.21.2 | MIT | HTTP-Server |
| qrcode-generator | 1.4.4 | MIT | QR-Codes für „Online ohne Server“ zeichnen |
| jsqr | 1.4.0 | Apache-2.0 | QR-Codes per Kamera lesen (Rückfall, wenn der Browser keinen eigenen Leser hat) |
| vite | 5.4.21 | MIT | Entwicklung und Build |
| typescript | 5.6.3 | Apache-2.0 | Programmiersprache und Typprüfung |
| vitest | 2.1.9 | MIT | Tests |

PARTYVERSE ist ein unabhängiges Spiel mit eigener Marke. Es enthält kein Nintendo-Material und steht in keiner Verbindung zu Nintendo.
