# RADIO-BINGO – Quellcode

Moderiertes 3D-Bingo für easygames (Vite, TypeScript, Three.js, Web Audio, Web Speech).

- `npm install` – Abhängigkeiten
- `npm run dev` – Entwicklungsserver (Online-Teil und `../cloud/*` nur über einen Server im easygames-Ordner)
- `npx vitest run` – Kern-Tests (Karten, Muster, Ziehung, Punkte, Jackpot-Wahrscheinlichkeit)
- `npm run build:easygames` – baut nach `../radio-bingo/` und erzeugt die PWA-Dateien (`tools/make-pwa.py`)
- `node tests/e2e.mjs [Screenshot-Ordner]` – Browser-Test (Server im easygames-Ordner auf Port 8766, Playwright)

Aufbau: `src/core` (Bingo-Logik, Modi, Moderationstexte), `src/render` (Studio, Moderator), `src/audio` (Stimme, Klänge),
`src/net` (Online & Handys über `../cloud/fire-peer.js`), `src/ui` (Karten), `src/app.ts` (Show-Ablauf und Oberfläche).
Der Moderator ist ein freigestelltes Foto (`public/host-cut.webp`), das Spielbild liegt in `public/card.jpg`.
