# Urwaldlager – Die große Wildnis-Show (3D)

Ein begehbares 3D-Dschungelcamp im Browser, für PC und Smartphone. Du ziehst mit erfundenen Mitcampern ins Urwaldlager, hältst das Camp am Laufen und bestehst Prüfungen. Am Ende kürt ein **simuliertes** Publikum den Champion. Alle Figuren, Namen, Moderationen und Inhalte sind frei erfunden.

## Spielen
`index.html` im Browser öffnen. Bei lokalem Start ist ein kleiner Webserver nötig, zum Beispiel `npx http-server` in der Repo-Wurzel. Three.js r128 liegt unter `vendor/`, deshalb braucht das Spiel kein CDN.

### Steuerung
| | PC | Smartphone |
|---|---|---|
| Laufen / Rennen | WASD, Shift | links ziehen (virtueller Joystick), ganz außen = rennen |
| Umsehen | Maus ziehen oder Klick ins Bild (Maus wird gefangen, Esc gibt sie frei), Mausrad = Zoom | rechts wischen |
| Aktion | E (zeigt immer, was gerade geht) | große grüne Kontext-Taste |
| Frucht essen | Q | Taste „Essen“ |
| Übersicht (Buschtrommel) | Tab | 🥁 oben rechts |
| Pause | P / Esc | ❚❚ oben rechts |
| Antworten im Gespräch | 1–4 oder Klick | antippen |

Jede Prüfung erklärt vor dem Start ihre eigene Steuerung, getrennt für PC und Touch.

## Inhalt
- **Camp in 3D:** Lagerfeuer mit Kochstelle, Schlafplätze unter der Plane, Wasserfass, Lagune, Holzstapel, Hängematte, die Plauderhöhle (Video-Tagebuch), die Buschtrommel, das Prüfungstor und der Moderationsfelsen. Dazu Dschungelwege, Tag und Nacht, Regen und Gewitter.
- **Camp-Leben:** Hunger, Energie und Laune sinken mit der Zeit. Holz, Wasser und Feuer sind echte Vorräte, die du selbst besorgst:
  - Äste sammeln, auf den Stapel legen und ins Feuer.
  - Mit dem Eimer an der Lagune schöpfen und ins Fass gießen.
  - Kochen ist ein Minispiel: Hitze halten, rühren, Zutaten in den Topf.
  - Schlafen im Bett, tagsüber Nickerchen.
- **Mitcamper:** Sie haben Persönlichkeiten und Tagesabläufe. Sie arbeiten oder faulenzen, kochen, quatschen, streiten, schließen Freundschaften und sprechen dich von selbst an (Bitten, Camp-Momente, Konfrontationen wegen Lästereien). Gespräche wirken sich auf Beziehungen und das Publikum aus.
- **Überraschungen:** Ein frecher (virtueller) Affe, Unwetter mit gerissener Plane, Streit zum Schlichten, eine Gummischlange im Bett, Heimweh, Geheimaufträge und nächtliches Geraschel.
- **Staffel:** Jeden Morgen kündigt die Buschtrommel die Prüfung an. Ab Tag 2 gibt es abends eine Ausscheidung. Am letzten Tag spielen die Finalisten ein dreiteiliges Finale, danach folgt die Siegerverkündung. Es gibt drei Längen (6, 8 oder 12 Camper), drei Schwierigkeitsgrade und zwei Modi („täglich antreten“ oder „Publikum nominiert“). Besetzung, Wetter, Ereignisse und Prüfungsreihenfolge wechseln von Staffel zu Staffel.
- **Simuliertes Publikum (transparent):** Die Gunst setzt sich zusammen aus Sympathie (45 %), Leistung (25 %) und Unterhaltung (30 %). Jede Änderung ist in der Buschtrommel-Übersicht mit Grund aufgelistet. Alle Abstimmungen sind ausdrücklich als Simulation gekennzeichnet.
- **12 Prüfungen + Finale**, jede mit eigener Umgebung, eigenen Regeln, Zeitlimit und drei Schwierigkeitsgraden. Alle Tiere sind virtuell bzw. Requisiten.

| Datei | Prüfung |
|---|---|
| `trials/bruecke.js` | 🌉 Die Wackelbrücke: Balance gegen Windböen, Sprünge über Lücken |
| `trials/tunnel.js` | 🪲 Der Krabbeltunnel: Ego-Sicht, Labyrinth mit virtuellen Krabbeltieren, Ekel-Meter |
| `trials/dunkel.js` | 🔦 Die Dunkelkammer: Taschenlampe, Geräusche orten, Schreck-Requisiten |
| `trials/hoehe.js` | 🧗 Der Höhenparcours: Pfähle, Gondeln, rollende Stämme, Wind |
| `trials/tauchen.js` | 🤿 Die Schlammlagune: Tauchen mit Luftvorrat, Sterne im trüben Wasser suchen |
| `trials/parcours.js` | 🏃 Der Schlamm-Parcours: Hindernislauf mit Fahnen und Bestzeiten |
| `trials/schatz.js` | 🗺️ Die Schatzsuche: Karte lesen, Hinweisen folgen, graben |
| `trials/labyrinth.js` | 🧩 Das Rätsel-Labyrinth: Hebel, Schiebesteine, Schlüssel, Symboltür |
| `trials/dinner.js` | 🍽️ Das Ekel-Dinner: fünf erfundene Gänge mit eigener Ess-Mechanik, Würg-Meter |
| `trials/liane.js` | 🐒 Der Lianen-Schwung: Pendelphysik, reißende Lianen, Wind |
| `trials/totem.js` | 🗿 Der Totem-Turm: Kran-Stapeln mit Statik |
| `trials/staffel.js` | 🔄 Der Dschungel-Dreikampf (Multitask aus drei Teilen) |

- **Speichern:** Automatisch beim Tagesbeginn, nach Prüfungen und Abendrunden, jede Minute und beim Verlassen der Seite. Gespeichert wird in `localStorage` (`ul_save`). Bestwerte und Statistiken älterer Versionen (`ul_best`) bleiben erhalten. Die Google-Sicherung (`../cloud/anmacha-cloud.js`, Präfix `ul_`) ist im Titel- und Pausenmenü eingebettet.
- **Leistung:**
  - Gemeinsame Geometrien und Materialien, statische Teile zu wenigen Meshes verschmolzen, Pflanzen als InstancedMesh.
  - Typisch 30–90 Draw Calls im Camp.
  - Drei Qualitätsstufen und eine automatische Auflösungsanpassung bei Rucklern.
  - Spiellogik in festen Teilschritten, also unabhängig von der Bildrate.

## Tests
Mit Playwright und Software-WebGL. Der Server muss in der Repo-Wurzel auf Port 8080 laufen.
- `node tests/trial-runner.mjs <id> 1 d|m [level] [short]`: eine Prüfung mit eingebautem Testpiloten (Bot)
- `node tests/season-run.mjs d|m kurz|normal|lang taeglich|klassisch [win]`: ganze Staffel inklusive Speichern/Neuladen, Ausscheidungen und Finale
- `node tests/camp-actions.mjs d|m`: Camp-Aktionen (Holz, Wasser, Gespräch, Übersicht, Kochen, Lagerfeuer, Nacht, Pause)
- Entwickler-Direktstart: `index.html?trial=tunnel&bot=1&lv=1` (`&short=1&max=3` = Finalfassung)

### Ehrlicher Hinweis zu Gerätetests
Alles wurde automatisiert in Headless-Chromium getestet: Desktop 1000–1200 px und Smartphone-Querformat 740×360 mit Touch-Emulation, bei einigen Prüfungen zusätzlich Hochformat 390×800. Gerendert wurde dabei mit Software (SwiftShader), deshalb sagen die dort gemessenen Bildraten (4–8 fps) nichts über echte Geräte aus.

**Nicht getestet** wurde auf echten Android- oder iOS-Geräten, mit echten Touch-Gesten mit mehreren Fingern, im Vollbild/mit Orientierungssperre auf dem Handy, mit Gamepads, in Safari sowie die Tonausgabe. Auf schwachen Handys im Zweifel in den Einstellungen „Grafik: Niedrig“ wählen.
