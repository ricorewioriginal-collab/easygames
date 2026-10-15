# Mimori – Dein 3D-Haustier mit klassischer Pflege und Spielhalle

Eigenständige, kostenlose Mobile-First-Haustier-App in EasyGames. Entwickelt für Android-Browser, installierte PWA, Tablet und Desktop.

## Was ist neu?

**3D-Grafik:** Auf mobilen Geräten waren die weißen Lichtflächen teils ausgebrannt. Die Szene verwendet jetzt warmes, deutlich zurückgenommenes Licht, eine niedrigere Belichtung (ACES Filmic Tone Mapping bei Exposure 0,83), matte/sattere Materialien und einen sichtbaren Kontakt-Schatten. Drei Zimmerstile passen die Farben an. Die vier eigenständig geformten Mimoris (Fluffi, Nubbi, Foxi, Drachi) bleiben frei drehbar und in vier Fellfarben verfügbar.

**Spielhalle:** Statt des sehr einfachen Sternfangs gibt es fünf unterschiedliche Minigames mit eigenständiger Steuerung, Punkten, Zeitlimit und Sieg-/Niederlage-Bedingungen:

1. **🍓 Beerensturm:** Fruchtfang mit horizontal bewegtem Korb und Bomben. Touch zum Bewegen oder Pfeiltasten. Drei Leben, Kombos und seltene Bonusfrüchte.
2. **🃏 Zauber-Memory:** Sechs versteckte Paare in einem 3×4-Raster. Karten aufdecken, Paare merken, in 50 Sekunden schaffen. Treffer werden belohnt.
3. **🎵 Beat-Party:** Vier Notenspuren mit Treffzone. Im richtigen Rhythmus auf die vier Touch-Flächen tippen oder D/F/J/K drücken. Kombos und Trefferwertung.
4. **☁️ Wolken-Sprint:** Ein automatisch laufender Hindernisparcours. Springe per Touch / Leertaste / Pfeil hoch, sammle Sterne und weiche Hindernissen aus.
5. **🫧 Blasenlabor:** Helle Seifenblasen einsammeln, roten Schleim vermeiden, drei Leben und Kombos. Die Blasen bewegen sich und werden schneller.

Die Spiele werden nicht als reine Dekoration ausgegeben: Jedes hat einen eigenen Spielzustand, Gameplay, Eingaben, Kollision/Zuordnung, Ende und Belohnung. Bestwerte werden im normalen Spielstand gespeichert.

**Belohnungen und Accessoires:** Für die Resultate gibt es Sterne und Erfahrung. Ein Tagesgeschenk bringt einmal pro Tag zusätzliche Sterne, Beeren und Seife. Im Shop kannst du ein Glöckchen, eine Schleife oder eine Sternkrone sowie zwei alternative Zimmerwelten freischalten. Kein Echtgeld, keine Werbung und kein Pay-to-win.

**Foto:** Über „Mimori-Foto“ kann der 3D-Inhalt, wenn der Browser es erlaubt, als PNG gespeichert werden.

## Weiterhin enthalten

- Füttern, Spielen, Baden, Schlafen, Kuscheln, Tanzen und Überraschungen
- Selbst erzeugte Sounds, einschließlich Schnurren beim Kuscheln
- Langfristiges Wachstum und Bedürfnisse basierend auf vergangener Zeit
- Vier unterschiedliche 3D-Wesen, vier Farbvarianten
- Opt-in-Erinnerungen, solange Browser/PWA laufen (keine zuverlässige Zustellung bei geschlossener App)
- Lokaler Spielstand unter `easygames.mimori.v1`
- Bestehende Google-Speicherintegration über `../cloud/anmacha-cloud.js` und `data-game="mimori"`, freiwillig. Der Google-Abgleich erfordert Internet und Anmeldung und wird nicht als offline verfügbar behauptet
- Offline-PWA mit Service Worker

## Technische Dateiliste

- `index.html` – App-Oberfläche
- `game.js` – 3D-Haustier, Pflege, Shop, Google-kompatibler Spielstand, App-Aktionen
- `model.js` – Pflegewerte, Sternkonto, Bestwerte, Belohnungen, Tagesbonus, Besitz und Shop
- `sound.js` – lokale Web-Audio-Effekte
- `arcade.js`, `arcade.css` – eigenständige Canvas-/DOM-Minispiele und responsives Spielhallen-Design
- `sw.js` – Offline-/PWA-Cache, ohne externen Push-Server
- `icon.svg`, `manifest.webmanifest`

## Tests

```sh
node tools/test-mimori.cjs
node tools/test-mimori-arcade.cjs
node tools/build-sync.js --check
```

Die automatisierten Tests decken Pflege und alte Spielstände, 3D-Modellinitialisierung im Mock, vier Arten, Farbwechsel, Sternkonto, Tagesbonus, Einkäufe, Arcade-Spielzustände, Timer, Touch-/Button-Eingaben, Ergebnis- und Einmal-Belohnungen ab. Ein echter Test auf verschiedenen Mobilgeräten bleibt erforderlich, insbesondere Farben/Belichtung, Audio, Download und Google-Login. Wenn JavaScript bei geschlossener PWA pausiert, erfolgen auch keine Benachrichtigungen.

## Klassische Tamagotchi-Pflege

- **Toilette:** Der Harndrang steigt mit der vergangenen Zeit. Regelmäßige Toilettengänge verschieben den nächsten Unfall. Unangekündigte Unfälle entstehen in bewusst unregelmäßigen Abständen; auch beim nächsten Öffnen nach einer Pause werden versäumte Ereignisse nachgerechnet.
- **Aufräumen:** Hinterlassenschaften erscheinen sichtbar im Zimmer. Werden sie längere Zeit nicht entfernt, sinken Hygiene und Gesundheit; später kann das Tier krank werden. Aufräumen ist jederzeit möglich und kostet keine Ingame-Währung.
- **Medizin:** Bei Krankheit oder schwacher Gesundheit kann das Haustier direkt behandelt werden – ohne Echtgeld oder Spielwährung. Medizin allein ersetzt das Saubermachen nicht.
- **Licht:** Schlafen ist ein anhaltender Zustand; nur mit ausgeschaltetem Licht erholt sich Mimori zügig. Licht lässt sich separat umschalten, und der Raum verdunkelt sich sichtbar.
- **Hilferuf:** Bedürfnisse lösen eine sichtbare, blinkende Glocke aus. Die kurzen Pieptöne können unabhängig von den Browser-Benachrichtigungen aktiv ein-/ausgeschaltet werden; mobile Browser erlauben Sound erst nach Nutzerinteraktion.

Alle neuen Zustandsfelder gehören zum bestehenden Spielstand unter `easygames.mimori.v1` und werden damit auch vom vorhandenen Google-Sync erfasst. Alte Spielstände ohne diese Felder werden beim Laden ergänzt.

## Cover / Drittanbieter

- **`cover.svg`** ist die bearbeitbare Vektorvorlage des eigens illustrierten 1200×630-Katalogmotivs mit allen vier Figuren.
- **`og:image`**, Twitter-Card, Beschreibung und kanonische URL liegen auf der direkt spielbaren `mimori/index.html`. `games.js` und `sync/catalog.json` verweisen auf das Cover statt des App-Icons.
- Der GitHub-Workflow `.github/workflows/mimori-cover.yml` hat das **echte 1200×630-PNG** `mimori/cover.png` erfolgreich erstellt. Die Katalogkarte in `games.js` und `sync/catalog.json`, Open Graph, Twitter-Card und die PWA-Screenshot-Angabe zeigen nun auf dieses PNG. Die Vektorvorlage bleibt weiterhin vorhanden.

## Mimori Wohnwelt und Familie

Das große 3D-Fenster enthält **12 eigene, geometrisch gebaute Kulissen**:
Wohnzimmer, Schlafzimmer, Badezimmer, Küche und Garten (kostenlos);
Partyraum, Musikstudio, Sternwarte, Winterhütte, Wolkeninsel, Zauberlabor und Spielzimmer (mit erspielten Sternen freischalten).
Jede Kulisse besitzt andere Möbel, Farben und Einrichtungsobjekte. Im Zimmermenü
lassen sich zusätzlich acht Arten von 3D-Dekoration kaufen, z. B. Pflanzen,
Bilder, Lichterketten, Teppiche, Aquarium, Kamin, Sternenmobile und Sitzgruppe.
Die Bauausgaben und die pro Zimmer eingerichteten Möbel werden lokal und über
den vorhandenen Google-Spielstand unter `easygames.mimori.v1` mitgesichert.
Jeder Bewohner merkt sich außerdem seinen zuletzt ausgewählten Raum.

**Erscheinungsvarianten:** Alle vier Tierarten unterstützen unabhängig von der
Fellfarbe drei per Einstellungen wählbare Looks: männlich, weiblich sowie
divers/androgyn. Die Varianten verändern tatsächlich sichtbare 3D-Details
(z. B. Stirn, Augenakzente, Blumen oder asymmetrischen Schopf).

**Familie und Hochzeit:** Bis zu vier Bewohner einschließlich des ersten
Mimoris können angelegt werden. Jeder besitzt eigene Pflegewerte, Gesundheit,
Fellfarbe, Erscheinungsvariante und Inventar. Über die Familienübersicht kann
jeder Bewohner einzeln oder der komplette Haushalt über Schnellpflege versorgt
werden. Durch wiederholte Dates wächst die Beziehung; ab 60 Herzen pro gewähltem
Partner kann eine Hochzeit zwischen zwei, drei oder vier Mimoris gefeiert werden.
Es gibt keine Einschränkungen hinsichtlich der gewählten Geschlechter oder
Erscheinungsvarianten. Nach einer Hochzeit werden Partner als zusätzliche
kleinere 3D-Wesen in der Szene angezeigt. Alle Familieninformationen liegen im
bestehenden `household`-Feld desselben Google-synchronisierten Spielstands.

**Radio:** Im Wohnzimmer steht dauerhaft ein modelliertes 3D-Radio.
Die Radio-Schaltfläche öffnet 13 Sender, jeweils mit Mimori-Fantasienamen,
dem realen Sendernamen und der deutlich sichtbaren Quellenangabe **laut.fm**.
Die Stationsliste stammt aus dem Repository `ricorewi-radio`,
`Hörerbot/stations.json`, mit entsprechenden Anzeigenamen aus `Stations.java`.
Die Streams werden erst nach bewusstem Antippen abgespielt, unter
`https://stream.laut.fm/<stationskennung>`; sie benötigen Internet,
werden nicht in den Offline-Spielstand aufgenommen und können von Browser-,
Netzwerk- oder Streamserver-Bedingungen abhängen.

### Zusätzliche Dateien und Tests

- `household.js`: zusätzliche Bewohner, eigene Zimmer, Beziehungen, Hochzeit, Shop und Schnellpflege
- `rooms3d.js`: zwölf vollständig aus Three.js-Geometrien gerenderte Raumkulissen
- `radio.js`: Auswahl der 13 echten laut.fm-Sender und sichere Bedienung von HTML-Audio
- `home.css`: mobile Familien-/Zimmereinrichtung und Radiobedienung
- `tools/test-mimori-home.cjs`: Persistenz, Familien-/Hochzeitsvarianten, 3D-Räume und Kaufregeln
- `tools/test-mimori-radio.cjs`: Start/Wechsel/Stop von Streams mit simuliertem HTMLAudioElement

Die zusätzlichen Browser-Simulationen sind keine echten Smartphone- oder
Streaming-Tests. Vor allem die Darstellung komplexerer Kulissen auf schwächeren
Geräten sollte im Browser nach der Veröffentlichung kontrolliert werden.

## 2026-10-15 – Ein großes Spielfenster für Browser und Android

- Ein einziges fast bildschirmfüllendes 3D-Spielfeld statt 3D oben plus separaten Pflege-/Status-Karten darunter.
- Sechs integrierte Navigationsbereiche im selben Feld: Pflege, Werte, Räume, Familie, Radio, Spielhalle. Pflege-/Status-Karten werden mit ihren bestehenden Event-Handlern ins eingeblendete Bottom-Sheet versetzt, nicht dupliziert.
- Raum-/Familien-/Radio-Funktionen erscheinen als einzelne Register im Spielfeld. Einstellungs-Drawer ist ebenfalls in den Spielbereich integriert. Warnungen sind eine einklappbare, antippbare Glocke.
- Eigene Abmessungen für Android-Hochformat, Querformat und Desktop mit großen Touchflächen. Die 3D-Figur bleibt sichtbar und drehbar.
- Robustere WebGL-Initialisierung: drei Grafikprofile von normal bis ressourcenschonend. Bei fehlendem Three.js, nicht möglichem WebGL-Kontext oder Context-Loss zeigt die Anwendung eine eigene, dreh- und streichelbare 2D-Ersatzfigur statt des leeren Felds. Das ist **kein 3D-Ersatz**; echtes WebGL bleibt von Browser und GPU abhängig.
- `scene-ui.js` und `scene-ui.css` integrieren die Oberfläche, `fallback.js` zeichnet die Ersatzfigur. Offline-Kernressourcen und Android-Manifest-Prüfsummen wurden aktualisiert.

Über das EasyGames-Android-Projekt wird der WebView explizit GPU-gerendert; in `ricorewi-radio` sind Manifest und GameActivity ebenfalls auf Hardwarebeschleunigung eingestellt. Quellcodeänderungen in Android benötigen einen neuen APK-Build und eine Installation; bestehende APKs ändern sich dadurch nicht automatisch.

## Ein großes Hauptfenster für alle Funktionen

Pflege, Werte, Räume, Familie, Radio und die fünf Minigames öffnen sich jetzt als integrierte Panels innerhalb einer fast bildschirmfüllenden Mimori-Spielszene. Der Hilferuf bleibt eine kleine antippbare Glocke. Das Layout berücksichtigt Mobilgeräte im Hoch- und Querformat.

Bei fehlendem WebGL probiert Mimori zunächst sparsame Renderer-Einstellungen und zeichnet das Haustier andernfalls in einer interaktiven Canvas-2D-Ersatzansicht. Der neue Test `node tools/test-mimori-scene.cjs` prüft Navigation, eingebettete Spielhalle und die Touch-Eingaben des Fallbacks. Echte APK-/Gerätetests stehen noch aus.
