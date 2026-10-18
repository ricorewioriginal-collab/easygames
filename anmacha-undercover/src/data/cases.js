/* AnMaCha UNDERCOVER 3D – Detektiv & Alibi: 12 Fallvarianten. Jeder Fall aktiviert eine Kombination aus Spurenarten
   (insgesamt 10 Arten, siehe core/evidence.js) und eine Besonderheit. Wer, wo und wann ergibt sich jedes Mal neu aus der Partie. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const CLUE_TYPES = {
    schuh: { n: 'Fußspuren', icon: '👣', desc: 'Schuhgröße der Person, die zuletzt am Fundort war (S/M/L).' },
    faser: { n: 'Stofffaser', icon: '🧵', desc: 'Farbfamilie der Kleidung (warm, kühl oder neutral).' },
    haar: { n: 'Haarfund', icon: '💇', desc: 'Kurze oder lange Haare (bzw. keine).' },
    geraeusch: { n: 'Geräusch', icon: '🔊', desc: 'Mit oder ohne Kopfbedeckung/Accessoire (Knistern am Mikro).' },
    tuer: { n: 'Türlogbuch', icon: '🚪', desc: 'Wer kurz vor und nach dem Vorfall die Türen des Raums passiert hat.' },
    kamera: { n: 'Kameraaufnahme', icon: '📹', desc: 'Wer zur Tatzeit im Raum zu sehen war (ohne Gesicht – nur wer).' },
    zeit: { n: 'Zeitpunkt', icon: '⏱️', desc: 'Ungefährer Zeitpunkt des Vorfalls (± einige Sekunden) – gleiche mit Alibis ab.' },
    zeuge: { n: 'Zeugenaussage', icon: '🗣️', desc: 'Eine Person hat jemanden in der Nähe gesehen – Zeugen können sich irren.' },
    logbuch: { n: 'Stationslogbuch', icon: '📓', desc: 'Wer die Stationen im Raum kurz zuvor benutzt hat.' },
    melder: { n: 'Bewegungsmelder', icon: '📡', desc: 'Wer sich in den 30 s davor in der Nähe des Fundorts bewegt hat.' }
  };
  const CASES = [
    { id: 'masterband', n: 'Das verschwundene Master-Band', types: ['schuh', 'tuer', 'zeit', 'zeuge'], twist: 'none', intro: 'Das Master-Band der Jubiläumssendung ist weg – und jemand will verhindern, dass es gefunden wird.' },
    { id: 'mitternacht', n: 'Funkstille um Mitternacht', types: ['faser', 'kamera', 'logbuch', 'zeit'], twist: 'blackout', intro: 'Punkt Mitternacht fällt das Licht aus. Wer nutzt die Dunkelheit?' },
    { id: 'mischpult', n: 'Der Fall Mischpult', types: ['haar', 'melder', 'tuer', 'zeuge'], twist: 'incident', intro: 'Schon vor Schichtbeginn liegt jemand ausgeknipst am Mischpult. Die Spuren sind noch frisch.' },
    { id: 'doppelfrequenz', n: 'Doppelte Frequenz', types: ['schuh', 'faser', 'kamera', 'logbuch'], twist: 'two', intro: 'Zwei Störsignale, zwei Täter? Die Peilung deutet auf ein eingespieltes Duo.' },
    { id: 'alibi', n: 'Das falsche Alibi', types: ['zeit', 'tuer', 'logbuch', 'geraeusch'], twist: 'tamper', intro: 'Jemand hat Erfahrung mit falschen Alibis – und mehr Gelegenheiten, Spuren zu verwischen.' },
    { id: 'kabelsalat', n: 'Spuren im Kabelsalat', types: ['schuh', 'haar', 'melder', 'zeit'], twist: 'none', intro: 'Zwischen den Kabeln im Technikraum bleibt jeder Schritt hängen.' },
    { id: 'zeuge', n: 'Der Zeuge, der zu viel wusste', types: ['zeuge', 'faser', 'tuer', 'geraeusch'], twist: 'unreliable', intro: 'Alle wollen etwas gesehen haben. Aber wer erinnert sich richtig?' },
    { id: 'blackout', n: 'Blackout im Sendesaal', types: ['melder', 'schuh', 'haar', 'zeit'], twist: 'blackout', intro: 'Stromausfall direkt zum Start. Kameras nützen nichts – die Sensoren schon.' },
    { id: 'rauschen', n: 'Das Rauschen im Archiv', types: ['geraeusch', 'logbuch', 'zeuge', 'faser'], twist: 'incident', intro: 'Aus dem Archiv kommt ein seltsames Rauschen – und dort liegt schon jemand.' },
    { id: 'kamera', n: 'Die Kamera lügt nicht', types: ['kamera', 'tuer', 'faser', 'zeit'], twist: 'tamper', intro: 'Die Aufnahmen sind echt. Fragt sich nur, ob jemand sie bearbeitet hat.' },
    { id: 'notruf', n: 'Der Notruf ohne Absender', types: ['zeuge', 'melder', 'geraeusch', 'schuh'], twist: 'many', intro: 'Ein anonymer Notruf kündigt Ärger an. Jede Spur zählt doppelt.' },
    { id: 'sendeschluss', n: 'Sendeschluss', types: 'random5', twist: 'fast', intro: 'Nur bis Sendeschluss Zeit. Danach sind alle Spuren verloren.' }
  ];
  AMU.CLUE_TYPES = CLUE_TYPES; AMU.CASES = CASES;
  if (typeof module !== 'undefined' && module.exports) module.exports = { CLUE_TYPES, CASES };
})(typeof window !== 'undefined' ? window : globalThis);
