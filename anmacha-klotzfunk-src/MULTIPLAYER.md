# Mehrspieler

## Kurz
Bis zu 4 Gäste spielen in der Welt eines Gastgebers mit, im Überlebens- oder Kreativmodus. Dafür gibt es **keinen eigenen Server**:
Die Browser verbinden sich direkt (WebRTC-DataChannel). Den Verbindungsaufbau übernehmen die Spieler selbst, indem sie zwei kurze Codes
austauschen (je ca. 600 Zeichen, z. B. per Messenger). Ohne Mehrspieler bleibt alles wie bisher: Das Spiel läuft rein statisch auf GitHub Pages.

## Ablauf
1. **Gastgeber:** Pause → 👥 Mehrspieler → „Einladung erstellen“, Code kopieren und schicken.
2. **Gast:** Hauptmenü → „👥 Bei Freunden mitspielen“, Namen eingeben, Einladung einfügen, „Antwort erstellen“, Antwort-Code zurückschicken.
3. **Gastgeber:** Antwort einfügen, „Verbinden“. Der Gast bekommt die Welt und steht neben dem Gastgeber.

Für jeden weiteren Gast eine neue Einladung. Der Gastgeber kann Gäste in derselben Liste entfernen.
Schließt der Gastgeber die Welt (Hauptmenü) oder bricht die Verbindung ab, kehrt der Gast ins Hauptmenü zurück.

## Netzwerk und zusätzliche Infrastruktur
| Fall | Was nötig ist |
|---|---|
| Beide im selben WLAN | nichts; „Über das Internet verbinden“ kann aus bleiben (dann wird kein fremder Dienst angefragt) |
| Über das Internet | „Über das Internet verbinden“ an (Standard). Der Browser fragt dann den öffentlichen, kostenlosen STUN-Server von Google (`stun.l.google.com:19302`) nach der eigenen öffentlichen Adresse. Es werden keine Spieldaten darüber geschickt. |
| Strenge Router oder manche Mobilfunknetze (symmetrisches NAT) | Hier reicht STUN oft nicht. Dann bräuchte es einen TURN-Server (leitet Daten weiter). Das Spiel setzt keinen voraus; wer einen betreiben will, trägt ihn in `src/rtc.js` (`STUN`-Liste) ein. |

## Wer entscheidet was (Sicherheit)
Der Gastgeber ist die Autorität über die Welt:
- **Sitzung:** Ein Gast bekommt beim Beitreten eine Kennung (Token); Nachrichten ohne passendes Token werden verworfen. Falsche Spielversion oder volle Welt wird abgewiesen.
- **Blockänderungen** schickt der Gast als Wunsch mit dem Zustand vorher. Der Gastgeber prüft Reichweite (9 Blöcke vom Auge; Kreativ 200 für Formen), gültige Block-Ids
  (im Überleben nur baubare Blöcke, also z. B. kein Wasser), eine Höchstrate (Überleben 64 auf einmal, 32/s nach; Kreativ 8 192 und 2 000/s) und ob der Block **noch so ist wie vorher**.
  Bauen zwei Spieler denselben Block gleichzeitig ab, gewinnt der erste; der zweite bekommt eine Ablehnung, der Block wird bei ihm zurückgesetzt und die Beute wieder abgezogen (keine Duplikation).
- **Positionen:** Sprünge schneller als 60 Blöcke/s werden nicht übernommen.
- **Tiere und Gegner** laufen nur beim Gastgeber. Gäste sehen sie im Umkreis von 64 Blöcken und schicken Treffer; der Gastgeber zieht Leben ab und schickt die Beute.
  Gegner verfolgen den jeweils nächsten Spieler, Treffer auf Gäste schickt der Gastgeber an den Gast (Rüstung wirkt beim Gast).
- **Wachstum, Signale, Uhrzeit** rechnet der Gastgeber und verteilt das Ergebnis.

## Grenzen (ehrlich)
- Der **Vorrat eines Gastes** liegt in seinem Browser und gilt nur für den Besuch (Startvorrat wie in einer neuen Welt). Der Gastgeber prüft die Welt, nicht den Vorrat des Gastes:
  Wer im eigenen Browser schummelt, kann sich Blöcke geben, aber nichts an der Welt vorbei verändern. Gespeichert wird nur beim Gastgeber.
- Tiere entstehen nur rund um den Gastgeber; wer weit weg erkundet, trifft dort keine.
- Fahrzeuge werden nicht geteilt (jeder sieht nur seine eigenen; die Figur des anderen sitzt dann sichtbar „auf dem Wasser“).
- Story-Welten sind nur allein spielbar.
- Pausiert der Gastgeber, läuft seine Welt für die Gäste weiter.
- Getestet wurde mit zwei Browsern auf einem Rechner (siehe TESTING.md), nicht über echte Internetverbindungen.

## Technik
| Datei | Aufgabe |
|---|---|
| `src/net.js` | Protokoll ohne Netzwerk-Code: `NetHost` (Prüfen, Verteilen, Tiere, Treffer) und `NetGuest` (Welt empfangen in Teilen von 16 000 Zeichen, Wünsche, Ablehnungen) |
| `src/rtc.js` | WebRTC-Verbindung, Codes packen (deflate + Base64), optional STUN |
| `src/mp.js` | Verbindet Spiel und Protokoll: Hooks für Blockänderungen, Tiere beim Gast, Schaden, Beute |
| `src/avatars.js` | andere Spieler als Figur mit Namensschild, weich zur gemeldeten Position geführt |

Nachrichten (JSON): `hello`, `welcome` + `part`, `pos`/`pp` (10×/s), `sets`/`ack`, `bs` (Blöcke je Bild gebündelt), `mobs` (5×/s), `hit`/`drops`, `hurt`, `time` (1×/s), `left`, `bye`.
