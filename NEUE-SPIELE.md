# Was ein neues Spiel braucht

Kurze Pflicht-Liste für jedes neue easygames-Spiel. Es soll überall gleich gut laufen: **PC (Browser und Windows-App), Handy,
TV und mit Gamecontroller**, auch offline in den Apps. Schritt für Schritt zum Anlegen: [README – Neues Spiel hinzufügen](README.md#neues-spiel-hinzufügen),
feste Regeln für Mehrspieler-Links und Einbindung: [CLAUDE.md](CLAUDE.md).

## 1. Läuft auf jedem Gerät

| Gerät | Was das Spiel können muss |
| --- | --- |
| **PC (Browser, Windows-App)** | Maus und Tastatur, füllt das Fenster (`100vw`/`100dvh`, kein Scrollen der Seite), läuft im iframe |
| **Handy / Tablet** | Touch-Bedienung (eigene Knöpfe oder Wischen), Hoch- und Querformat, keine Hover-only-Elemente; `python3 tools/make-pwa.py <ordner>` macht es installierbar |
| **TV** | Bedienung nur mit Pfeiltasten + OK/Enter + Zurück (Fernbedienung); Mehrspieler: Gastgeber am TV (`?tv`/`tvParam`), Mitspieler per QR-Code am Handy (`?join=CODE`) – Hilfen: `device.js`, `gamekit.js`, Vorlage `tools/spiel-vorlage/` |
| **Gamecontroller** | siehe Abschnitt 2 – Pflicht für jedes Spiel |

## 2. Gamecontroller (Pflicht)

Jedes Spiel bindet **`gamepad.js`** ein – genau eine von zwei Arten:

- **Spiel ohne eigene Controller-Steuerung** (Normalfall):
  `<script src="../gamepad.js" data-pad="…" data-pad-labels="…" defer></script>`
  Der Controller wird zu Tasten: Steuerkreuz/linker Stick = Pfeile, A = Enter, B = Esc, X = Leertaste … – je Spiel anpassbar in `data-pad`
  (z. B. `a=Space/Enter`, `ls=wasd`, `y=KeyF:Inventar@#bInv` = Taste, Beschriftung und Bildschirm-Knopf). Menüs ohne Pfeiltasten bedient er
  automatisch über den gelben Leuchtrahmen.
- **Spiel mit eigener Controller-Steuerung** (liest `navigator.getGamepads()` selbst):
  `<script src="../gamepad.js" data-pad="info" data-pad-labels="ls=Laufen; a=Springen; …" defer></script>`
  Dann ahmt gamepad.js keine Tasten nach, liefert aber jeden Controller im Standard-Layout, die Belegungs-Übersicht und hilft dort, wo das
  Spiel den Controller nicht kennt (Fenster wie „Game Over“, Bildschirm-Knöpfe per **Select halten**).

**Immer eintragen:** `data-pad-labels` – was jede Taste im Spiel macht (`a=…; b=…; x=…; y=…; lb=…; rb=…; lt=…; rt=…; ls=…; rs=…; dpad=…; start=…`).
Die Beschriftungen erscheinen in der Controller-Übersicht (erster Controller-Druck und **Select + Start**), in der TikTok-Steuerung („A drücken (Springen)“)
und in den Apps.

**Das liefert gamepad.js automatisch – nicht selbst nachbauen:**

- jeder Controller (Xbox, PlayStation, Switch, 8BitDo, günstige USB-/Bluetooth-Pads) im Standard-Layout; eigene Belegung je Controller in den Apps
- Umbelegen je Spiel (**Select + Start**), Bildschirm-Tastatur für Textfelder (öffnet sich von selbst), Leuchtrahmen-Navigation in Menüs und
  Fenstern, Scrollen zu Knöpfen außerhalb des sichtbaren Bereichs
- Klick über den Leuchtrahmen ist ein Mausklick (kein Touch) – das Spiel schaltet dabei nicht in die Touch-Bedienung

**Spiel-Regeln, damit der Controller überall geht:**

- Menüs, Fenster und Dialoge aus echten Knöpfen (`<button>` oder `[role=button]`), sichtbar und nicht von anderem verdeckt.
- Pfeiltasten nur dann mit `preventDefault()` abfangen, wenn das Spiel sie wirklich nutzt – sonst funktioniert die Menü-Navigation nicht.
- Touch-Modus nur bei echter Berührung umschalten (`e.isTrusted`, nicht bei `html.eg-pad` = Controller-Modus).
- Texteingaben als normales `<input>`/`<textarea>` (dann kommt die Bildschirm-Tastatur von selbst).
- Prüfen: `NODE_PATH=$(npm root -g) node tools/test-gamepad.cjs` und das Spiel einmal mit Controller von Start bis Spielende durchspielen.

## 3. Pflicht-Bausteine im Spiel

- **Statistik:** `<script src="../egstat.js" defer></script>` (anonym, für das Control Center).
- **Online/Handy-Mehrspieler:** `<script src="../cloud/fire-peer.js"></script>` vor dem Spielcode, Links immer auf die easygames-Homepage
  (`EasyGamesLink.share(url)`), Menüpunkt „🌐 Online“, in `modes.js` `online: true` – Regeln in [CLAUDE.md](CLAUDE.md).
- **Spielstand in der Cloud (optional, empfohlen):** `cloud/anmacha-cloud.js` mit `data-game`/`data-prefix` – bringt Google-Spielstand,
  Ranglisten und Erfolge mit (`cloud/README.md`).
- **Sprachausgabe:** `cloud/anmacha-cloud.js` einbinden – spricht dann auch eingebettet über die einbindende Seite.
- **Anleitung:** `guides/<id>.json` mit Handbuch, Ratgeber, Lösungsbuch (`node tools/check-guides.js <id>`), Bedienung inkl. Controller.
- **Teilen-Vorschau:** `node tools/make-share.cjs <id>`, Karte/Logo: `node tools/make-cards.cjs <id>`.
- **Offline-fähig:** keine Dateien von fremden Servern (CDN) – Bibliotheken über `vendor/` (`node tools/fetch-vendor.js`), sonst laufen
  die Apps nicht offline.

## 4. Wie das Spiel in die Apps kommt

**Windows-App „easygames“** (Quellen: RicoReWi-Radio-Repo, `windows-easygames/`)

- Spiele-Client wie Steam: jedes Spiel einzeln installieren, läuft danach offline unter `https://appassets.local/<spiel>/` (WebView2/Edge).
- Holt Spiele und gemeinsame Dateien vom Server: zuerst `/games-live/` (Server-Abgleich mit diesem Repo, Dienst `ricorewi-games-sync` alle
  2 Minuten), sonst `/android-app/assets/games/` (Git-Stand der Website). Neue Spiele und Updates erscheinen dadurch ohne neue EXE.
- Die App legt um jedes Spiel: Controller-Belegung der App (gilt in allen Spielen), Ton sofort, **Home-Taste** = zurück in die Bibliothek,
  **Aufnahme** (F9 Clip der letzten 30 s, F8/F10 Aufnahme starten/stoppen; Export MP4 16:9, MP4 9:16, GIF), TikTok-LIVE-Steuerung,
  Konto/Erfolge/Ranglisten als eigene Fenster. Das Spiel muss dafür nichts tun.
- Änderungen an der App selbst brauchen einen neuen Build auf dem Server (`ricorewi-radio-windows-build`); Spiel-Änderungen nicht.

**RicoReWi Radio App (Android) und Portal** (Quellen: RicoReWi-Radio-Repo, `android/`, `android-app/`)

- Spiele liegen gebündelt in der App (offline) und werden über dieselbe Dateiliste aktualisiert (`/games-live/`, sonst Git-Stand).
- Nach Spiel-Änderungen im RicoReWi-Radio-Repo: `php scripts/sync-easygames.php <easygames-Checkout>`, dann
  `php scripts/test-android-assets.php` und `NODE_PATH=$(npm root -g) node scripts/test-games-offline.cjs <spiel-ids>` (lädt das Spiel ohne Internet).
- Ein Spiel darf nur mit `onlineReason` in `games.json` online bleiben (nicht gebündelt).

**Browser / Homepage / TV / Einbindung:** GitHub Pages (`https://ricorewioriginal-collab.github.io/easygames/`), Einbindung über
`easygames.js`, Stream-Overlay `stream.html?game=<id>` – gilt automatisch für jedes Spiel.

## 5. Vor dem Einchecken

```
node tools/build-sync.js                       # Dateiliste der Apps
node tools/check-games.js                      # alle Spiele
node tools/check-guides.js <id>                # Anleitung
NODE_PATH=$(npm root -g) node tools/test-gamepad.cjs
python3 tools/make-pwa.py <ordner> && python3 tools/make-thumbs.py
```
