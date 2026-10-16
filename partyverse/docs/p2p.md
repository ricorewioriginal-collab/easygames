# Online mit Freunden (Raumcode über Firebase)

PARTYVERSE nutzt für Online-Partien dieselbe Vermittlung wie alle easygames-Spiele: `../cloud/fire-peer.js`
(Firebase, anonyme Anmeldung, Rückfall PeerJS). Es gibt keinen eigenen Spielserver.

## Ablauf

1. **Gastgeber:** _🌐 Online mit Freunden → Neuen Raum eröffnen._ Es erscheinen ein **5-stelliger Raumcode**, ein **QR-Code** und die Knöpfe _Einladung teilen_ / _Link kopieren_.
2. **Mitspieler:** QR-Code scannen oder Link öffnen (`…/easygames/partyverse/app/?room=CODE`) – oder im Spiel unter _Raum beitreten_ den Code eingeben.
3. Bis zu 3 Mitspieler; freie Plätze kann der Gastgeber mit Bots füllen. Alle drücken _Bereit_, der Gastgeber startet.

Einladungslinks zeigen immer auf die easygames-Homepage, nie auf die lokale App-Adresse (Mehrspieler-Regel, siehe `../../CLAUDE.md`).
So funktioniert die Einladung aus der Android-App heraus auch im Browser, auf iPhone, Android und am TV.

## Wie es funktioniert

- `client/src/net/p2pLink.ts` lädt `fire-peer.js` erst, wenn jemand online spielt. Der Gastgeber belegt die Kennung `partyverse-<CODE>`, Gäste verbinden sich darüber. Firebase vermittelt nur den Verbindungsaufbau; gespielt wird direkt Gerät zu Gerät (WebRTC, STUN/TURN wie PeerJS).
- Nach dem Spielstart gibt der Gastgeber den Raumcode frei (`stopListening`), Firebase wird dann nicht mehr abgefragt.
- **Der Gastgeber führt den Spielkern aus** (`HostSession`): Zugrecht, Würfel, Bewegung, Ressourcen und Minispiel-Ergebnisse werden dort entschieden und geprüft. Gäste (`GuestSession`) senden nur Absichten. Nachrichten der Gäste werden formgeprüft (`shared/src/net/p2p.ts`).
- Bricht die Verbindung eines Gastes ab, übernimmt ein Bot. **Verlässt der Gastgeber das Spiel, endet die Partie.**
- Firebase-Regeln: Abschnitt „Online-Kopplung“ in `../cloud/firestore.rules` (einmalig in der Firebase-Konsole veröffentlicht).
