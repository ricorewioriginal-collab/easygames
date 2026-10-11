# Geschichte

Alle Inhalte stehen als Daten in `story.js`. Die Quest-Engine (`quests.js`) liest sie; das Spiel setzt keine Storyflags von Hand.

## Kapitel

| # | Insel | Titel | Inhalt |
|---|---|---|---|
| 1 | Windwiesen | Der Himmel verstummt | Mira weckt Aeru, die Windlaternen erwachen, auf der Ostinsel liegt eine Feder mit dem Siegel der Sternenwarte. |
| 2 | Bernsteinhain | Die Stimmen der Vergangenheit | Oru zeigt im Bernstein die Lange Nacht: Ein junger Sternenwächter namens Vesper stand vor dem verschlossenen Hafentor. Laternenlied „Morgen Ost, Abend West, Nacht Treppe“. |
| 3 | Sternenwarte | Das gebrochene Sternentor | Mittelpunkt: Kampf gegen Vesper (3 Phasen). Danach gibt Vesper das Licht zurück und warnt vor der Stille. |
| 4 | Wolkenriffe | Die verlorenen Windwege | Flugkapitel: Tessa retten, drei Windwege (Ringe) knüpfen, Vesper stellt sich Luma. |
| 5 | Kristallklamm | Das Echo der Wahrheit | Laternen auf Kristalltürmen, Stille-Schatten, Ringe. Wahrheit: Die Stille ist eingesperrter Wind – und sie holt sich Vesper. |
| 6 | Morgenruinen | Der letzte Morgen | Leuchtfeuer, Hafenwindwege, Finale gegen die Stille (3 Phasen, Anker im Flug). Abspann, dann freies Weiterspielen. |

## Hauptquests (Reihenfolge)

Jede Hauptquest setzt die vorige voraus (`when: 'done:…'`). Leuchtkerne gibt es nur als Belohnung von Hauptquests; das Tor zur nächsten Insel öffnet sich erst mit dem Kern der aktuellen Insel.

1. `c1_wake` Wach auf → Mira → drei Windlaternen → Mira
2. `c1_trace` Edda → drei Nebelkäfer → Feder auf der Ostinsel → Mira · **Kern 1**
3. `c2_voices` Ankunft → Oru → drei Bernsteintropfen → Oru
4. `c2_song` Laternen in Liedreihenfolge → Oru · **Kern 2**
5. `c3_gate` Ankunft → Sela → Ivo → vier Sturmfunken → drei Laternen → Sela
6. `c3_storm` Boss Vesper → Sela · **Kern 3**
7. `c4_reefs` Ankunft → Luma → Tessa (Westriff) → drei Ringe → Vesper (Ostriff) → Luma → Vesper · **Kern 4**
8. `c5_truth` Ankunft → Yara → Turmlaternen → Elin → drei Stille-Schatten → drei Ringe → Yara · **Kern 5**
9. `c6_harbor` Ankunft → Neri → Juno → Leuchtfeuer → Ringe → Neri
10. `c6_finale` Boss Stille → Neri und Vesper · **Kern 6, Abspann**

## Nebenquests

Pro Insel eine (Pip, Nim, Tavi, Kito, Boro, Vela). Sie werden erst verfügbar, wenn die Hauptquest der Insel begonnen hat, verlangen zwei bestimmte Splitter von den Außeninseln (schon gesammelte zählen rückwirkend) und belohnen mit voller Heilung und Dank. Sie sind optional.

## Figuren

Mira, Edda, Pip (Windwiesen) · Oru, Fenn, Nim (Bernsteinhain) · Sela, Ivo, Tavi (Sternenwarte) · Luma, Tessa, Kito (Wolkenriffe) · Yara, Elin, Boro (Kristallklamm) · Neri, Juno, Vela (Morgenruinen) · Vesper (Sternenwächter, erst Gegner, dann Verbündeter; wohnt nach dem Ende im Hafen) · die Stille.

Figuren erscheinen, ziehen um oder verschwinden abhängig vom Questfortschritt (`appear`-Regeln). Nach Meilensteinen reagieren sie mit neuen Sätzen (`reactions`).

## Dialogregeln

- Ein Gesprächsschritt zählt nur durch echtes Ansprechen der Figur.
- Ein Dialog kann nicht doppelt starten; Pause unterbricht ihn und setzt an derselben Zeile fort.
- Bereits gesehene Dialoge lassen sich überspringen (X oder „Überspringen“).
- Die automatische Story-Prüfung (`tests/story.cjs`) bestätigt: 32 Storydialoge erscheinen genau einmal in dieser Reihenfolge.
