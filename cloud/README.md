# Cloud-Speicher für alle Spiele

Kostenlos, ohne Server, ohne Build-Schritt. Spielstände liegen in Firebase Firestore (Spark-Tarif, 1 GB, 20k Schreibzugriffe/Tag gratis, wird nicht pausiert).
Spieler melden sich mit einem Klick auf ☁ → „Mit Google anmelden“ an; ihr Fortschritt folgt ihnen auf jedes Gerät.

## Einmalig einrichten (nur du kannst das)
1. https://console.firebase.google.com → Projekt anlegen (Analytics aus).
2. Build → Authentication → Anmeldemethode → Google aktivieren. Unter Einstellungen → Autorisierte Domains `ricorewioriginal-collab.github.io` hinzufügen.
3. Build → Firestore Database → erstellen (Produktionsmodus, Region eur3) → Reiter „Regeln“ → Inhalt von `cloud/firestore.rules` einfügen → Veröffentlichen.
4. Projekteinstellungen → Web-App (</>) hinzufügen → `projectId` und `apiKey` kopieren und oben in `cloud/anmacha-cloud.js` bei `CONFIG` eintragen (der apiKey ist öffentlich gedacht, der Schutz sind die Regeln).

## Ein Spiel anbinden (eine Zeile vor `</body>`)
```html
<script src="../cloud/anmacha-cloud.js" data-game="snake" data-prefix="anmachaSnake" defer></script>
```
`data-prefix` = Anfänge der localStorage-Schlüssel, die mitgesichert werden (kommagetrennt). Am Spielcode ändert sich nichts.
Ohne Eintrag in `CONFIG` tut das Skript nichts.

## Funktionsweise
- Pro Schlüssel zählt der neuere Zeitstempel (gewinnt der zuletzt gespielte Stand).
- Schreiben gebündelt (3 s nach Änderung, beim Verlassen), Laden beim Start. Wird beim Start etwas Neueres geladen, lädt die Seite einmal neu.
- Daten liegen unter `users/<uid>/saves/<spiel>`; die Regeln erlauben nur dem eigenen Nutzer Lesen und Schreiben.
- Das Firebase-SDK wird nur geladen, wenn sich ein Spieler angemeldet hat; sonst bleibt alles bei localStorage.

## Für Spiele mit eigenen Daten
`window.AnMaChaCloud.account()` liefert für Angemeldete `{ uid, name, token, project }` (sonst `null`), `signIn()` startet die Anmeldung. Damit spricht RicoVille Firestore für die Nachbarn direkt per REST an. Deren Regeln stehen im Block „RicoVille" in `firestore.rules`; nach Änderungen dort die ganze Datei neu veröffentlichen.

## Apps (Android/Windows)
Erkannt werden die RicoReWi-App (`appassets.local`), die easygames-App (`appassets.androidplatform.net` bzw. JS-Brücke `EasyGamesApp`) und Windows (User-Agent `RicoReWiApp/`). Nur dort gilt die Kopplung; in normalen Browsern läuft die Anmeldung direkt.

Google sperrt die Anmeldung in App-Fenstern. Deshalb koppelt sich die App über den Browser: Sie zeigt einen Link `…/#koppeln=<Code>`, auf der Seite (ricorewi-radio.de, Skript eingebunden) meldet man sich mit Google an, die App erkennt die Kopplung automatisch und nutzt danach denselben Cloud-Speicher wie im Web. Dafür muss der Block `match /pair/{code}` aus `firestore.rules` veröffentlicht sein, und `www.ricorewi-radio.de` sowie `ricorewi-radio.de` müssen unter Authentication → Einstellungen → Autorisierte Domains stehen (dort findet die Anmeldung statt).

## Ältere Sicherung (genau eine je Nutzer und Spiel)

Ersetzt beim ersten Abgleich einer Sitzung (Start oder Anmeldung) der neuere Stand einen abweichenden älteren (egal ob lokal oder in der Cloud), wird der ersetzte Eintrag im Dokument `users/<uid>/saves/<spiel>__alt` aufgehoben und überschreibt dabei die vorherige Sicherung. Im Cloud-Fenster stellt „Älteren Stand wiederherstellen“ sie zurück und tauscht sie mit dem aktuellen Stand, es bleibt also immer genau eine ältere Sicherung. Die Firestore-Regeln decken das Dokument bereits ab (`{game}` ist ein Platzhalter), es ist nichts neu zu veröffentlichen. Apps mit eigenem Abgleich (Favoriten in Android/Windows, ZOTIK-Apps) haben das noch nicht.

## Ranglisten (öffentliche Bestenlisten, nur mit Freigabe)
**In den Spielen gibt es keine Oberfläche** (nichts verdeckt Spielinhalt): `cloud/anmacha-board.js` (wird von `anmacha-cloud.js` nachgeladen) reicht Bestwerte nur still im Hintergrund ein, sobald der Spieler sie freigegeben hat. Ansehen, Freigabe, Spitzname und Löschen liegen auf der **zentralen Seite `ranglisten.html`** (alle Spiele, Spiel-Auswahl, Ranglisten-Tabs, Top 25, eigene Zeile hervorgehoben; ohne Anmeldung lesbar):
- Einstieg: Hub (🏆 Ranglisten), `https://…/easygames/ranglisten.html[?embed=1&game=<spiel-id>]`.
- **Einbetten (iframe oder JavaScript):** `<div data-easygames="ranglisten" data-game="anmacha-snake"></div>`, `<button data-easygames="ranglisten" data-mode="overlay">🏆 Ranglisten</button>`, `EasyGames.open('ranglisten', { game })`, `EasyGames.leaderboard('#ziel')` – funktioniert auf easygames, RicoReWi Radio und jeder Seite, die easygames einbindet.
- Mitmachen: Google-Anmeldung → Spitzname (2–20 Zeichen) → „Bestwerte öffentlich zeigen“. Öffentlich sind **nur Spitzname, Bestwert und Zeitpunkt**. „Freigabe beenden“ löscht alle eigenen Einträge in allen Spielen.
- Die Freigabe liegt zusätzlich im eigenen Profil `users/<uid>/saves/__board` (vorhandene Regeln genügen) und gilt dadurch auf jedem Gerät/Ursprung, auch in den Apps: Das Spiel liest sie nach der Anmeldung und reicht dann ein.
- Die Spiele-Zuordnung kommt aus `sync/catalog.json` (`cloud.game`/`cloud.prefix`, erzeugt von `tools/build-sync.js`): **neue Spiele erscheinen automatisch**.
- Daten: `boards/<spiel>[__<modus>]/e/<uid>` = `{ n, s, o, t }`. Regeln: jeder schreibt nur seinen eigenen Eintrag, ein Eintrag wird nur besser (nie schlechter), Löschen jederzeit.
- **Automatisch für alle Spiele (auch neue):** Spiele ohne Eintrag in `REG` bekommen feste Ranglisten, deren Werte `detect()` aus den synchronisierten Spielständen liest: **Highscore** (`best`, `highscore`, `record`, Top-10-Listen wie `rank`/`hof`/`top`), **Gesamtpunkte** (Summe eines Containers `best`/`records`/`scores`), **Bestzeit** (`lap`/`time` unter `best`), **Siege**, **Sterne**, **XP**. Das Panel zeigt nur Ranglisten, die Einträge haben oder für die der Spieler selbst einen Wert hat. Spielzeit/Verstrichenes zählt nicht. Eine Heuristik: Bei ausgebbaren Währungen (z. B. „Sterne“ in Sandbox-Spielen) einen leeren Eintrag `'spiel': []` in `REG` setzen = bewusst keine Rangliste.
- Welche Spiele/Werte (kuratiert): Registry `REG` oben in `cloud/anmacha-board.js` (Schlüssel = `data-game`; `key`/`path` zeigen auf den localStorage-Wert, `agg: 'sum'|'max'|'min'` + `*` fasst z. B. Punkte aller Level zusammen). Neues Spiel: Eintrag ergänzen, `node tools/test-board.mjs` prüft Schlüssel, Präfix und Skriptpfad.
- Spiele mit abweichendem Skriptpfad (Kiko: `vendor/`) setzen `data-board-src`; `data-board="off"` schaltet die Rangliste eines Spiels ab.
- **Einmalig in der Firebase-Konsole:** Firestore → Regeln → den neuen Inhalt von `cloud/firestore.rules` einfügen und veröffentlichen (sonst zeigen die Ranglisten „noch nicht freigeschaltet“).
- Die Werte kommen vom Gerät des Spielers und sind **nicht manipulationssicher** (Spaß-Ranglisten). Unpassende Spitznamen/Einträge entfernst du in der Konsole unter `boards/…/e/…`.

## Erfolge (spielübergreifend, privat)
**Zentrale Seite `erfolge.html`** (Hub „🏅 Erfolge“, `https://…/easygames/erfolge.html[?embed=1]`, einbettbar mit `data-easygames="erfolge"` / `EasyGames.open('erfolge')` / `EasyGames.achievements('#ziel')`). 14 Erfolge mit 40 Stufen (Entdecker, Stammgast, Serie, Rekordjäger, Sterne, Siege, Bestzeiten, Teamplayer, Komplettist, Nachteule, Frühaufsteher, Wochenend-Held, Wolkenspieler, Ranglisten-Star), Punkte ergeben einen Rang (Neuling … Legende).
- **Quelle:** die lokalen Spielstände aller Spiele (erkannt über `anmacha-board.js`: `values()`, auch neue Spiele automatisch) und die Spielspuren `anmacha-seen` (Spiel, Tag, Uhrzeit), die jedes Spiel über die stille Laufzeit mitschreibt (auch Spiele ohne Rangliste). Rechenlogik ohne DOM in `cloud/anmacha-ach.js` (`node tools/test-ach.mjs`).
- **Sicherung:** lokal in `anmacha-ach`; mit Google-Anmeldung zusätzlich im eigenen Profil `users/<uid>/saves/__ach` (**keine neue Firestore-Regel nötig**, gleiche Regel wie der Spielstand). Beim Abgleich zählt jede Freischaltung, die irgendein Gerät kennt (frühester Zeitpunkt gewinnt). Nichts davon ist öffentlich.
- **Umfang:** 22 spielübergreifende Erfolge mit 60 Stufen (Entdecken, Kategorien, Serien und Tage, Alter, Marathon, Rekorde, Sterne, Siege, Zeiten, Mehrspieler, Spiel-Erfolge sowie Nachteule, Frühaufsteher, Wochenende, App, TV, Controller, Cloud, Rangliste). Die Ränge sind Anteile der Maximalpunkte und wachsen mit neuen Erfolgen mit. Kategorien je Spiel stehen in `GENRES` (`anmacha-ach.js`; `tools/test-gameach.cjs` prüft, dass jedes Katalogspiel eingetragen ist).
- **Eigene Erfolge der Spiele** (`cloud/anmacha-gameach.js`): Spiele mit eigenem Erfolgssystem (Wobbel, Markthalle, RicoPoly, RicoVille, Partyverse, Funkblasen, Gay Life, Taschi, Bunte Insel) stehen mit allen Definitionen in `REG` (Lesefunktion je Spielstand). Die Seite listet sie je Spiel (aufklappbar, mit Fortschritt) und zählt sie für „Spiel-Erfolge“. **Neue Spiele mit Erfolgen** schreiben nur `localStorage['anmacha-gameach.<cloud-id>'] = JSON.stringify({ t: 'Titel', d: [{ id, icon, title, desc }], u: { id: Zeitstempel } })` – ohne Änderung an der Seite. Im Profil (`__ach`) liegen dazu `gu` (`"spiel:id": Zeit`), `v` (beste Werte je Spiel) und `m` (meiste Spiele an einem Tag); die stille Laufzeit (`anmacha-board.js`) gleicht sie im Hintergrund ab (höchstens alle 5 Minuten).
- Neue Erfolge: in `DEFS` (`cloud/anmacha-ach.js`) eintragen (Kennzahl, Schwellen, Namen), Kennzahlen in `statsOf()`.

## RicoPoly 3D: Rangliste und Online-Räume

`firestore.rules` enthält zusätzlich einen Abschnitt für RicoPoly (`ricopoly_board`, `ricopoly_rooms`, `ricopoly_pub`). Er braucht die **anonyme Anmeldung** (Authentication → Anmeldemethode → Anonym). Details, Verbrauch und Grenzen: `ricopoly/FIREBASE_SETUP.md`. Andere Spiele sind davon nicht betroffen.

## Online-Kopplung aller Spiele über Firebase (`cloud/fire-peer.js`)

Alle Spiele mit Handy-Kopplung oder Online-Modus über PeerJS (Funkhaus Reality, Mach mich aus!, Frequenzrad, Funkparcours, Hörerwahl, Kart Rush, Koffer DEALER, Preisradar, Quiz, Stapelrausch, Bunte Insel, Gay Life, ZEITSPRUNG Movie/Radio/Wissen, ZOTIK) verbinden sich jetzt wie RicoPoly über Firebase. Eingebunden ist das mit einer Zeile vor dem Spielcode:
```html
<script src="../cloud/fire-peer.js"></script>
```
Die Datei stellt `window.Peer` mit derselben Schnittstelle wie PeerJS bereit, am Spielcode ändert sich nichts. Firebase (gleiches Projekt `ricorewi-games-save`, anonyme Anmeldung, nur REST, ohne SDK) vermittelt nur den Verbindungsaufbau; gespielt wird wie bisher direkt Gerät zu Gerät (WebRTC, dieselben STUN/TURN-Server wie PeerJS).

- Daten: `p2p/<Kennung>` = Gastgeber (`h` = uid, `t` = Lebenszeichen alle 5 min, nach 15 min ohne Lebenszeichen verwaist), Angebote der Gäste unter `p2p/<Kennung>/in_<Gastgeber-uid>/<Gast-uid>_<Zufall>`. Der Gast räumt sein Angebot nach dem Verbinden weg, der Gastgeber gibt die Kennung beim Schließen frei.
- **Links (Mehrspieler-Regel):** `fire-peer.js` stellt `EasyGamesLink.share(url)` bereit. Alle Spiele erzeugen ihre Einladungs-Links und QR-Codes damit, sodass sie immer auf die easygames-Homepage zeigen statt auf die lokale App-Adresse (`appassets.androidplatform.net`, `file://`, `localhost`). Andere Homepage nur über `window.EASYGAMES_PUBLIC_BASE`. Siehe [`CLAUDE.md`](../CLAUDE.md).
- **Rückfall:** Ist Firebase nicht erreichbar, das Kontingent aufgebraucht oder sind die Regeln noch nicht veröffentlicht, läuft alles still über PeerJS weiter (wird erst dann aus `vendor/` geladen). Findet ein Gast den Raum nicht in Firebase, fragt er zur Sicherheit auch PeerJS. Mit `?p2p=peerjs` in der Adresse lässt sich PeerJS erzwingen.
- **Einmalig in der Firebase-Konsole:** Firestore → Regeln → den kompletten Inhalt von `cloud/firestore.rules` einfügen und veröffentlichen (Abschnitt „Online-Kopplung“). Die anonyme Anmeldung ist für RicoPoly schon eingeschaltet.
- **Verbrauch (Spark-Tarif, gratis 50.000 Lese- und 20.000 Schreibzugriffe pro Tag):** Ein offener Gastgeber fragt 10 Minuten nach dem Öffnen und nach jedem Beitritt alle 2 s nach Beitrittswünschen, sonst alle 4 s, im Hintergrund-Tab alle 15 s (je 1 Lesezugriff, also etwa 900–1.800 pro Stunde). Beitritt je Gerät: etwa 3 Schreib- und bis zu 10 Lesezugriffe. Grob reicht das für 30–50 Spielstunden mit offenem Gastgeber pro Tag; danach greift automatisch PeerJS.
- **Tests:** `node tools/test-fire-peer.js` (Regeln, 27 Prüfungen) und `node tools/test-fire-peer.js --browser` (zwei Chromium-Seiten verbinden sich echt, große Text- und Binärnachrichten, Fehlerfälle) gegen den Emulator (`firebase emulators:start --only auth,firestore`).
- RicoPoly behält seine eigene Anbindung (`ricopoly/js/fire.js`), RicoVille nutzt Firestore für die Nachbarn. **RIFTZONE** nutzt `fire-peer.js` für „Online ohne Server“: ein Gerät eröffnet einen Raum und rechnet selbst die Lobby und das Match, Freunde treten mit dem 5-stelligen Code bei (`riftzone/client/src/net/p2p.ts`). **PARTYVERSE** nutzt `fire-peer.js` für „🌐 Online mit Freunden“: der Gastgeber eröffnet einen Raum mit 5-stelligem Code, Freunde treten per Code, Link oder QR-Code bei (`partyverse/client/src/net/p2pLink.ts`); den früheren Spielserver-Modus gibt es nicht mehr. Nicht umgestellt: die QR-/Text-Code-Verbindung von TURBOKICK (kommt ganz ohne Vermittler aus).
