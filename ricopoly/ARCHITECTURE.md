# Architektur

RicoPoly ist eine statische Seite ohne Build-Schritt. Alle Module sind klassische Skripte (UMD), die sich unter `window.Rico*` registrieren und in Node per `require` testbar sind.

## Schichten

```
game.js (UI, Ablauf)  ──►  rules.js (Zustand + Regeln)  ◄──  ai.js (Bots)
     │                         ▲
     ├─► board3d.js ──► characters.js, worlds.js (Darstellung, rekonstruiert aus dem Zustand)
     ├─► audio.js, profile.js, i18n.js
     └─► net.js (HostCore: prüft Aktionen mit rules.js; Client: sendet Wünsche, zeigt Zustände)
```

## Regel-Engine (`js/rules.js`)

- `apply(state, action) → { ok, state, events, err, dup }` ist ein reiner Reducer: Der Zustand wird geklont, die Aktion geprüft und vollständig ausgeführt oder gar nicht (atomar).
- Zufall kommt aus einem Seed (mulberry32) im Zustand. Dieselben Aktionen ergeben denselben Spielverlauf; Würfel sind zwei echte W6.
- Phasen: `roll`, `buy`, `auction`, `debt`, `end`, `over` (intern zusätzlich `resolve`). Schulden liegen in einer Warteschlange; nach dem Begleichen setzt eine gespeicherte Fortsetzung den Zug fort.
- Doppelte Aktionen werden über eine Aktions-ID (`aid`) erkannt, veraltete Züge über die Zug-ID (`tid`).
- Jede Änderung erzeugt Ereignisse (`dice`, `move`, `pay`, `buy`, `build`, `card`, `trade`, `bankrupt`, `win` …), die die Oberfläche nacheinander animiert. Das Protokoll ist auf 250 Einträge begrenzt; ein Spielstand ist etwa 20 KB groß.
- `validate(state)` prüft geladene Spielstände (Schema, Geld, Besitz, Gebäudevorrat).

## Darstellung

`board3d.js` baut Brett, Felder (Texte als Canvas-Texturen), Gebäude, Würfel und Kulisse mit Three.js r128 (`../vendor`). Instanzierte Meshes für Kulisse, Schatten nur auf „Hoch“, Pixelverhältnis je Qualitätsstufe, automatische Absenkung bei niedriger Bildrate, 30-FPS-Energiesparmodus, Pause bei verstecktem Tab, Wiederherstellung nach WebGL-Kontextverlust.

## Online (`js/net.js`)

- Der Ersteller eines Raums ist Gastgeber. `HostCore` ist transportunabhängig: Er nimmt Beitritte an, verwaltet Bereit-Status, prüft jede Aktion (`cleanAction` erzwingt den eigenen Platz und erlaubte Felder), wendet sie mit `rules.js` an und verteilt den Zustand ohne Zufallszustand (`sanitize`).
- Schutz: Nachrichtenlimit (20/s pro Verbindung), Versionsprüfung, Wiederbeitritt nur mit dem geheimen Geräte-Schlüssel, Zugzeit und Abwesenheit werden vom Gastgeber per Computerzug überbrückt.
- Transport: Bevorzugt WebRTC-Datenkanäle, deren Aufbau `js/fire.js` über Firestore vermittelt (Gast legt sein Angebot unter `ricopoly_rooms/<code>/join/<uid>` ab, der Gastgeber fragt nur in der Lobby oder bei fehlenden Mitspielern nach und trägt die Antwort ein; ohne Trickle-ICE, also je ein Schreibzugriff). Der Gastgeber öffnet zusätzlich seinen PeerJS-Platz; Gäste nehmen PeerJS, wenn es für den Code keinen Firebase-Raum gibt oder der Aufbau scheitert. Beide Wege liefern Verbindungen mit derselben Schnittstelle an `HostCore`.
- Öffentliche Räume stehen in `ricopoly_pub` (mit Lebenszeichen) und zusätzlich unter festen PeerJS-Kennungen `ricopoly-pub-1..8`; `scan()` fragt beides ab und führt die Listen zusammen.
- Clients verbinden sich mit Rückoff neu und fordern danach den aktuellen Stand an.

## Speicher

`profile.js` schreibt alles unter dem Präfix `ricopoly.v1.` in `localStorage`. `../cloud/anmacha-cloud.js` (eingebunden mit `data-prefix="ricopoly.v1."`) gleicht diese Schlüssel nach Google-Anmeldung mit Firestore ab. Die weltweite Rangliste (`ricopoly_board`) schreibt `js/fire.js` nach jeder beendeten Partie; Regeln und Grenzen in `FIREBASE_SETUP.md`.
