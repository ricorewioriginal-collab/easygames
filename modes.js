// Mehrspieler-Fähigkeiten je Spiel-ID (aus den Spielen bzw. ihren Beschreibungen).
//   pad    = Handys koppeln sich per QR-Code/Code (?join=…) als Controller oder Pads; Gastgeber ist PC oder TV
//   online = Mehrspieler über mehrere Geräte per Code/QR
//   multi  = Mehrspieler/Duell/Splitscreen auf einem Gerät
//   tvParam = Das Spiel kennt den Parameter ?tv (öffnet direkt die Lobby mit QR-Code für den Fernseher)
window.EASYGAMES_MODES = {
  'anmacha-kart': { pad: true, multi: true, online: true, tvParam: true },
  'anmacha-quiz': { pad: true, multi: true },
  'anmacha-koffer-dealer': { pad: true },
  'anmacha-hoererwahl': { pad: true },
  'anmacha-frequenzrad': { pad: true, multi: true },
  'anmacha-preisradar': { pad: true, multi: true },
  'anmacha-funkparcours': { pad: true, multi: true },
  'FunkhausReality': { pad: true },
  'MachMichAus': { pad: true },
  'turbokick': { online: true, multi: true },
  'partyverse': { online: true, multi: true },
  'riftzone': { online: true },
  'anmacha-stapelrausch': { online: true, multi: true },
  'gay-life': { online: true },
  'bunte-insel': { online: true, pad: true, multi: true, tvParam: true },
  'anmacha-spielesammlung': { multi: true },
  'anmacha-memory': { multi: true },
  'anmacha-showdown': { multi: true },
  'anmacha-gesucht': { multi: true }
};
