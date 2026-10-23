// Mehrspieler-Fähigkeiten je Spiel-ID (aus den Spielen bzw. ihren Beschreibungen).
//   pad    = Handys koppeln sich per QR-Code/Code (?join=…) als Controller oder Pads; Gastgeber ist PC oder TV
//   online = Mehrspieler über mehrere Geräte per Code/QR/Link, auch übers Internet (Firebase, cloud/fire-peer.js);
//            Einladungslinks zeigen immer auf die easygames-Homepage (Mehrspieler-Regel, siehe CLAUDE.md)
//   multi  = Mehrspieler/Duell/Splitscreen auf einem Gerät
//   tvParam = Das Spiel kennt den Parameter ?tv (öffnet direkt die Lobby mit QR-Code für den Fernseher)
window.EASYGAMES_MODES = {
  'anmacha-undercover': { online: true },
  'spinwelten': { online: true },
  'anmacha-podcast-tycoon': { online: true, multi: true },
  'anmacha-kart': { pad: true, multi: true, online: true, tvParam: true },
  'anmacha-quiz': { pad: true, online: true, multi: true },
  'anmacha-koffer-dealer': { pad: true, online: true },
  'anmacha-hoererwahl': { pad: true, online: true },
  'anmacha-frequenzrad': { pad: true, online: true, multi: true },
  'anmacha-preisradar': { pad: true, online: true, multi: true },
  'anmacha-funkparcours': { pad: true, online: true, multi: true },
  'FunkhausReality': { pad: true, online: true },
  'MachMichAus': { pad: true, online: true },
  'turbokick': { online: true, multi: true },
  'fabelkick': { multi: true },
  'colorpop-universe': { multi: true },
  'ricopoly': { online: true, multi: true },
  'partyverse': { online: true, multi: true },
  'riftzone': { online: true },
  'ricolife': { online: true },
  'anmacha-kartenrausch': { pad: true, online: true, multi: true },
  'wortfunk': { pad: true, online: true, multi: true, tvParam: true },
  'wortgitter': { pad: true, online: true, tvParam: true },
  'saftblitz': { multi: true },
  'funkmaler': { pad: true, online: true, multi: true, tvParam: true },
  'funkgolf': { multi: true },
  'tortenschlacht': { pad: true, online: true, multi: true, tvParam: true },
  'funkgalgen': { pad: true, online: true, multi: true, tvParam: true },
  'winzflitzer': { multi: true },
  'gay-life': { online: true },
  'bunte-insel': { online: true, pad: true, multi: true, tvParam: true },
  'zeitsprung-wissen': { pad: true, online: true },
  'zeitsprung-castingshow': { pad: true, online: true },
  'zeitsprung-kinderserien': { pad: true, online: true },
  'zeitsprung-eurovision': { pad: true, online: true },
  'zeitsprung-movie': { pad: true, online: true },
  'zeitsprung-radio': { pad: true, online: true },
  'zotik': { online: true },
  'anmacha-spielesammlung': { multi: true },
  'anmacha-radio-match': { multi: true },
  'anmacha-memory': { multi: true },
  'anmacha-showdown': { multi: true },
  'anmacha-gesucht': { multi: true }
};

