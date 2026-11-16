# TikTok-LIVE-Steuerung in Spielen einbauen

Anleitung für neue und bestehende Spiele, die **eigene TikTok-Aktionen mit eigenen Animationen** bekommen sollen. Ohne
Zusatzarbeit funktioniert die TikTok-Steuerung schon in jedem Spiel: Geschenke, Likes und Chat-Befehle drücken den virtuellen
Controller (`pad:A`, `pad:LEFT` …) und lösen die allgemeinen Streiche/Effekte aus. Eigene Aktionen machen daraus echte
Spiel-Ereignisse („Geldregen“, „Kunde kommt“, „Stromausfall“), die der Streamer in den Einstellungen Geschenken zuweist.

Vorbild: **Marktrausch** – `anmacha-markthalle/tiktok.js` (24 Aktionen, Einblendungen mit Profilbild, Bildschirm-Effekte,
empfohlene Belegung).

## Wie es zusammenhängt

```
TikTok LIVE ──► Brücke (tools/tiktok-bridge.mjs · Node / tools/tiktok-bridge.py · Python)  ws://127.0.0.1:21213
                  │  Ereignis: {type:'gift'|'chat'|'like'|…, user, pic, handle, gift, count, diamonds, img}
                  ▼
           stream-tiktok.js  ──► Belegung (Geschenk → Aktion)  ──► run('game:<id>')  ──► window.EasyGamesStream.actions[i].run(user, profil)
```

- **Windows-App (EXE und Portable):** `stream-tiktok.js` wird direkt in das Spielfenster eingespielt (`windows/TikTok.cs`,
  `EmbedScript`), die App startet die Brücke selbst. Das Spiel ist dort die oberste Seite – `window.EasyGamesStream` wird direkt gelesen.
- **Browser/OBS/TikTok LIVE Studio:** `stream.html?game=<id>&tiktok=1` lädt das Spiel in einen iframe und liest
  `iframe.contentWindow.EasyGamesStream`. Gleiche Schnittstelle, nichts extra zu tun.

## Schnittstelle (eine Datei je Spiel, z. B. `<spiel>/tiktok.js`)

```js
'use strict';
/* <Spiel> × TikTok LIVE: eigene Aktionen für die TikTok-Steuerung (../stream-tiktok.js). Läuft ohne TikTok einfach nicht an. */
(() => {
  const last = {}, now = () => Date.now();
  const nm = u => String(u || 'Jemand').replace(/[<>&"]/g, '').trim().slice(0, 18) || 'Jemand';

  // Jede Aktion: id (ohne Leerzeichen), icon, label (deutsch, kurz), cd = Cooldown in Sekunden, f = was im Spiel passiert
  const ACTS = [
    { id: 'bonus',  icon: '💰', label: 'Bonus +100 Punkte', cd: 3,  f: (user) => { game.score += 100; return 'schenkt dir 100 Punkte!'; } },
    { id: 'sturm',  icon: '🌪️', label: 'Sturm',             cd: 30, f: (user) => { if (game.storm) return false; game.storm = 10; return 'lässt einen Sturm los!'; } },
  ];

  function run(a, user, pf) {
    if (!window.game || game.paused) return false;                       // nur wenn das Spiel läuft
    if (a.cd && now() - (last[a.id] || 0) < a.cd * 1000) return false;    // Cooldown: Chat darf das Spiel nicht zuspammen
    const text = a.f(user); if (!text) return false;                      // false = passt gerade nicht (nichts anzeigen)
    last[a.id] = now();
    showAlert(a.icon, nm(user), text, pf);                                // eigene Einblendung im Spiel (siehe unten)
    return true;
  }

  window.EasyGamesStream = {
    actions: ACTS.map(a => ({ id: a.id, icon: a.icon, label: a.label, run: (user, pf) => run(a, user, pf) })),
    // Empfohlene Belegung – gilt, bis der Streamer für dieses Spiel eine eigene speichert (gleiches Format wie die Einstellungen)
    defaults: {
      cooldown: 5,
      commands: [['bonus', 'game:bonus'], ['sturm', 'game:sturm'], ['links', 'pad:LEFT'], ['rechts', 'pad:RIGHT']],
      gifts: [
        { gift: 'Rose', icon: '🌹', action: 'game:bonus', label: 'Bonus +100' },
        { gift: 'Galaxy', icon: '🌌', action: 'game:sturm+fx:shake', label: 'Sturm' },
      ],
      likes: { every: 100, action: 'game:bonus', label: 'Bonus' },
    },
  };
})();
```

Einbinden in `<spiel>/index.html` **nach** dem Spielcode: `<script src="tiktok.js"></script>`.

### Regeln

- **`run(user, profil)`**: `user` = Anzeigename, `profil = { pic, handle }` – `pic` ist das TikTok-Profilbild (https, kann leer
  sein), `handle` der @Name. Bild mit `referrerpolicy="no-referrer"` laden und bei Fehler auf den Anfangsbuchstaben zurückfallen.
- **Aktions-Texte in `defaults`:** `game:<id>` (eigene Aktion), `pad:A|B|X|Y|UP|DOWN|LEFT|RIGHT|START|SELECT|LB|RB`,
  allgemeine Streiche/Effekte (`fx:shake`, `fx:rain:🌹`, `fx:party:10`, `slow:10`, `invert:10`, `bomb:20` … – Liste im Reiter
  „Streiche & Effekte“). Mehrere mit `+` verbinden, wiederholen mit `*5`.
- **Geschenknamen** englisch wie bei TikTok (`Rose`, `Finger Heart`, `Money Gun`, `Galaxy`, `TikTok Universe` …) – maßgeblich ist
  `tiktok-gifts.json` (täglich aktualisiert, mit Bildern). Nicht mehr existierende Namen (z. B. „Universe“) lösen nie aus.
- **Cooldown je Aktion** und nur auslösen, wenn das Spiel in einem passenden Zustand ist (sonst `false` zurückgeben).
- **Spielstand nie hart löschen** ohne Sicherung: Format wie Marktrausch `wipe()` (`eg-tiktok-backup:<spiel-id>` in
  `localStorage`), danach `window.__egNoSave = 1`, damit das Spiel beim Neuladen nicht wieder speichert. So geht „↩ Wiederherstellen“.
- Kein Verhalten ändern, wenn keine TikTok-Steuerung läuft – `tiktok.js` legt nur die Liste an.

## Eigene Animationen und Einblendungen

Die Einblendung gehört **ins Spiel** (nicht ins Overlay), damit sie in der Windows-App, im Browser und in OBS gleich aussieht:

- Ein fester Layer (`position:fixed; z-index` hoch, `pointer-events:none`), Karten mit Profilbild im Ring in TikTok-Farben
  (`#25f4ee` → `#fe2c55`), Name fett, Text, kurzer Untertitel – höchstens 3 gleichzeitig, nach ~5 s ausblenden.
- Effekte je Aktion: Emoji-Regen, Blitz (`flash`), Wackeln (`shake`), großes Symbol, Stempel („BANKROTT“) – Vorlage `vfx()` in
  `anmacha-markthalle/tiktok.js`. Nur CSS-Animationen/Canvas, keine fremden Bibliotheken.
- Zusätzlich echte Spielreaktion (Geräusch, Figur reagiert, Zahl ändert sich), damit Zuschauer sehen, dass *ihr* Geschenk wirkt.
- Lesbar auf 9:16 hochkant (432 × 768) und 16:9 – das Overlay legt oben rechts die Geschenke-Legende und unten die Ereignisse ab;
  eigene Einblendungen daher oben mittig.

## Damit es in der Windows-App (EXE und Portable) läuft

- `tiktok.js` liegt im Spielordner und wird über `index.html` geladen → `node tools/build-sync.js` nimmt es in
  `sync/manifest.json` auf; die App lädt und aktualisiert es mit dem Spiel. Nicht in git-ignorierte Pfade legen.
- Keine Skripte von fremden Servern (nur die erlaubten CDNs aus `windows/Host.cs`), kein Service Worker als Voraussetzung.
- `window.EasyGamesStream` auf der **obersten Seite** des Spiels setzen (nicht in einem eingebetteten iframe des Spiels).
- Profilbilder und Geschenkbilder kommen online von TikToks Server – ohne Netz einfach Anfangsbuchstabe bzw. Emoji zeigen.
- Steuerung per Geschenk an Controller-Knöpfe (`pad:…`): das Spiel sollte `gamepad.js` laden oder Controller selbst abfragen; reine
  Tastatur-Spiele bekommen die Hilfsschicht automatisch nachgeladen.

## Testen

1. `node tools/tiktok-bridge.mjs --demo` (oder `python tools/tiktok-bridge.py --demo`) und
   `stream.html?game=<id>&tiktok=1&setup=1` öffnen: Reiter „Streiche & Effekte“ → „⭐ Highlights dieses Spiels“ zeigt die
   eigenen Aktionen mit ▶ zum Testen; „Belegung für: nur <Spiel>“ zeigt die empfohlene Belegung.
2. Windows-App: Bibliothek → „🎁 TikTok LIVE“ → Verbinden, dann „⚙ Belegung bearbeiten“ beim Spiel.
3. Automatisch: `NODE_PATH=$(npm root -g) node tools/test-stream-tiktok.cjs` (allgemein), danach `node tools/check-games.js`.
4. Screenshot der Einblendung mit Profilbild im Overlay mitliefern.
