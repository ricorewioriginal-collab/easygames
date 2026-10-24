# easygames – Hinweise für Claude

Minispiele für Browser, Handy und die Android-App, jedes Spiel in einem eigenen Ordner. Übersicht und Technik: [README.md](README.md).
Ressourcensparend und fehlerfrei bauen: kleine, gezielte Änderungen, bestehende Logik wiederverwenden, am Gameplay nichts ändern, was nicht verlangt ist.

## Mehrspieler-Regeln (fest, gelten für alle Spiele)

1. **Links immer über die easygames-Homepage.** Einladungs-, Beitritts-, TV- und Spiellinks (Text, Kopieren-Knopf, QR-Code) zeigen immer auf
   `https://ricorewioriginal-collab.github.io/easygames/<spiel>/…` – nie auf die lokale Adresse der App (`appassets.androidplatform.net`),
   `file://`, `localhost` oder das lokale Netz. Nur so öffnet jedes Gerät den Link: Browser, App, iPhone, Android und TV.
   - Spiele mit `cloud/fire-peer.js`: `EasyGamesLink.share(url)` setzt die Regel um (Pfad, `?…` und `#…` bleiben gleich).
     Muster: `const u = …; return window.EasyGamesLink ? EasyGamesLink.share(u) : u;`
   - Seiten mit `device.js`/`gamekit.js`: `EasyGamesDevice.tvUrl()`, `EasyGamesDevice.publicBase()`, `EasyGamesKit.joinUrl()`.
   - Andere Homepage nur über `window.EASYGAMES_PUBLIC_BASE` (vor den Skripten setzen). Die Adresse steht in `cloud/fire-peer.js`,
     `device.js`, `ricopoly/js/game.js` und `riftzone/client/src/app.ts` – bei einer Änderung alle vier anpassen.
   - Nur Navigation auf **demselben** Gerät (z. B. „Controller hier öffnen“) bleibt lokal, damit die App offline funktioniert.
   - Ausnahme **„Spiel teilen“ auf einbindenden Seiten**: Bekommt ein Spiel `?eg_share=<Adresse>` (Spiele-Hub, `easygames.js` mit `share`,
     Bibliothek mit `eg_share`), zeigt der Teilen-Link für das Spiel selbst auf diese Seite (z. B. `https://www.ricorewi-radio.de/#games/<id>`).
     `EasyGamesLink.share()` und `EasyGamesDevice.gameLink()` erledigen das; Links mit `?…`/`#…` (Einladung, TV) bleiben auf der Homepage.
2. **Online über Firebase.** Neue Spiele mit Online- oder Handy-Modus binden `<script src="../cloud/fire-peer.js"></script>` vor dem
   Spielcode ein und nutzen PeerJS wie gewohnt (Details: [cloud/README.md](cloud/README.md)). Keine eigene Vermittlung bauen.
3. **Sichtbar im Menü.** Jedes Spiel mit Online-Möglichkeit zeigt sie im Hauptmenü (oder in den Einstellungen) mit 🌐 und dem Wort
   „Online“, z. B. „🌐 Online & Handys“. Im Online-Fenster steht kurz, dass Mitspieler per Link/Code von überall beitreten können.
4. **In der Spieleliste eintragen.** `modes.js`: `online: true` für jedes Spiel, das über mehrere Geräte per Code/QR/Link spielbar ist.
5. **Einbindung muss alles können.** Spiele mit Sprachausgabe laden `cloud/anmacha-cloud.js` (spricht eingebettet über die einbindende
   Seite, auch verschachtelt). iframes für Spiele nutzen die Freigaben aus `easygames.js` (`FRAME_ALLOW`, öffentlich `EasyGames.allow`);
   dieselbe Liste steht in `index.html`, `hub/anmacha-hub.js`, `einbinden.html`, `cloud/anmacha-account.js` – `tools/check-games.js` prüft beides.

## Nach Änderungen

- `node tools/build-sync.js` (Dateiliste der App aktualisieren), bei neuen Spielen auch `python3 tools/make-pwa.py <ordner>`.
- Neue Spiele: `node tools/make-share.cjs <spiel-id>` erzeugt die Teilen-Vorschau (`share/<id>.jpg` und `share/<id>.html`, Bild und Beschreibung für Chats/soziale Netze) – mit einchecken; die Teilen-Dialoge verweisen darauf.
- `node tools/check-games.js` prüft alle Spiele; RIFTZONE nach Quelländerung neu bauen: `cd riftzone && node scripts/build.mjs`.
