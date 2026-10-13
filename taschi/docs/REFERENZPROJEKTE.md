# Recherche: Vier Monster-RPG-Projekte als technische Referenz

Stand: 13. Oktober 2026. Diese Übersicht basiert auf den öffentlich zugänglichen READMEs; sie ist **keine Übernahme ihrer Quelltexte oder Assets**.

| Projekt | Architektur / Schwerpunkt | Konsequenz für TASCHI | Lizenzbefund |
| --- | --- | --- | --- |
| [YanivGabay/pokemon-clone](https://github.com/YanivGabay/pokemon-clone) | C++ und SFML, Tiled-Karten, StateMachine mit separaten Zuständen für Start, Erkundung, Begegnung, Kampf, EP und Übergänge | Klare Zustandsübergänge und Spielkarten-Daten statt ineinander verschachtelter UI-Dialoge | Keine LICENSE-Datei im Repository-Root abrufbar; Inhalte nicht übernehmen |
| [agss0/pokaylib](https://github.com/agss0/pokaylib) | C/raylib 5, klassische 2D-Generationen, getrennte Datenlisten für Attacken und Arten | Kampfparameter sowie Level-/Attackenlogik als eigenständige Datenmodule konzipieren | Keine LICENSE-Datei im Repository-Root abrufbar; Sprite-Assets laut README aus fremdem Fanprojekt; nicht übernehmen |
| [khizarsiddiqui/Pokemon-Clone](https://github.com/khizarsiddiqui/Pokemon-Clone) | HTML/CSS/Bootstrap-Nachbau einer Website, kein dokumentierter Spiel-Engine-Kern | Für TASCHI praktisch ungeeignet | Keine LICENSE-Datei im Repository-Root abrufbar |
| [ivopc/Poke-Engine](https://github.com/ivopc/Poke-Engine) | Browser-Game mit JavaScript, HTML, CSS und Node; laut Autor veraltete Architektur; Mobiljoystick als offene Aufgabe | Browsertechnologie passt, aber keine unreflektierte Migration und keine Pokémon-Medien | MIT für den Engine-Quelltext im Repository; Rechte an dargestellten Franchise-Grafiken sind separat zu prüfen |

## Bereits konkret angewendet

TASCHI besitzt bereits eine getrennte 3D-Overworld, einen Kampfablauf mit Haupt-/Untermenüs, Spielstand-Verwaltung, 16 Orden und Sternenliga. Als nächster mechanischer Baustein wurde ein **Attackenpunkte-System (AP)** aus eigenständiger Implementierung ergänzt. Jede Attacke verbraucht AP, die Anzeige erfolgt direkt im Attackenmenü, Heilung füllt AP wieder auf. Alte Saves erhalten beim nächsten Einsatz fehlende AP-Werte.

## Technisch notwendige nächste Verbesserungen

- Spielzustände als explizite State Machine (Titel, Intro, freie Welt, Interaktion, Kampfübergang, Kampf, Ergebnis, Menü), damit Controller- und Touch-Eingaben nicht gleichzeitig unerwünschte Aktionen auslösen.
- Kampfsystem in unabhängige Daten-/Logik-Module und Darstellung trennen; Statusveränderungen, zuverlässige Aktionen bei leeren AP, Gegner-KI, Doppelkämpfe.
- 3D-Welt datengetrieben in echte, individuell gestaltete Regionen gliedern. Zugängliche Hausinneren, NPC-Tagesabläufe, Story-Flags.
- Keine fremden Monster, Pokémon-Namen, Sounds, Designs, Markenkennzeichen oder Sprite-Sheets übernehmen.
- Reale End-to-End-Tests auf Smartphone, PC und Gamepad; Syntaxcheck ist nur eine Teilprüfung.

