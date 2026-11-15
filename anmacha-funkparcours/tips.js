/* Titanparcours – Bedien-Hinweise pro Hindernis. Erscheinen beim Anlauf auf ein Hindernis, passend zu Gerät (Tastatur, Touch, Gamepad) und Ansicht. */
const T = {
  Stufensprung: 'Mit {F} Anlauf nehmen und mit {J} von Stufe zu Stufe springen. Kurz tippen = kleiner Sprung.',
  Schiebebrücke: 'Am Rand warten, bis die Brücke ganz nah ist, dann {J}. Auf der Brücke stehen bleiben und am anderen Ende abspringen.',
  Fahrstuhl: 'Mit {J} auf die Plattform, mitfahren und oben auf die nächste Plattform springen.',
  Bruchplatten: 'Nicht stehen bleiben! {F} halten und mit {J} zügig über die Platten.',
  Sandsäcke: 'Warten, bis der Sack wegschwingt, dann mit {F} durchlaufen.',
  Drehwalzen: 'Mit {F} voll drüber laufen, die Walzen ziehen nach hinten. Am Ende {J}.',
  Seilschwung: 'Mit {J} zum Seil und kurz davor {G} drücken. Mit {J} loslassen, wenn das Seil nach vorn schwingt.',
  Ringschwung: 'Mit {J} hoch und kurz vor dem Ring {G} drücken. Mit {J} geht es zum nächsten Ring.',
  Trampolin: 'Aufs Trampolin springen, oben {G} an der Stange und mit {F} hangeln. Am Ende {J}.',
  Hangelstangen: '{J} zur Stange und {G}. Mit {F} hangeln, am Ende mit {J} abspringen.',
  Klippenhänger: '{J} und {G} an die Leiste, mit {F} hangeln. {J} ist der Hechtsprung zur nächsten Leiste.',
  Pendelbalken: 'Mit Anlauf {D} und unter den Balken durchrutschen, oder warten, bis er wegschwingt.',
  Rutschtunnel: 'Mit Anlauf {D} halten und unter den Toren durchrutschen.',
  Lachsleiter: '{J} und {G} an die Stange, dann {J} im Takt. Nicht zu schnell drücken, sonst rutschst du ab.',
  Kletterstange: '{J} und {G} an die Stange, dann {J} immer wieder drücken: Griff für Griff nach oben.',
  Kletterseil: '{J} und {G} ans Seil, dann {J} immer wieder drücken: Griff für Griff nach oben.',
  Pendelkugeln: 'Mit kurzen Sprüngen ({J}) von Kugel zu Kugel. Auf der Kugel kurz abbremsen.',
  Schrägstange: '{J} und {G} an die Stange, mit {F} nach unten hangeln, unten mit {J} abspringen.',
  Kurvengleiter: '{J} und {G} an den Griff, mitgleiten und am Ende mit {J} abspringen.',
  Spinnenkamin: 'Zwischen die Wände springen und {J} immer wieder drücken, um dich hochzustemmen.',
  Steilwand: 'Auf der Anlaufbahn mit {F} voll sprinten. Oben an der Kante {G}, dann mit {F} hochziehen.'
};
const KEYS = {
  keys: v => ({ F: v ? '↑ / W' : '→ / D', J: 'Leertaste', G: 'E', D: 'Shift' }),
  touch: v => ({ F: v ? 'Stick ↑' : 'Stick →', J: 'Springen', G: 'Greifen', D: 'Ducken' }),
  pad: v => ({ F: v ? 'Linker Stick ↑' : 'Linker Stick →', J: 'Ⓐ', G: 'Ⓧ / RB', D: 'Ⓑ' })   // Controller: Hinweise, sobald einer verbunden ist
};
export function makeTips(el) {
  const head = el.querySelector('b'), body = el.querySelector('span'); let hideT = 0, cur = '';
  const padOn = () => { try { return [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(g => g && g.connected); } catch (e) { return false; } };
  const dev = () => document.documentElement.classList.contains('fp-pad') || padOn() ? 'pad' : document.body.classList.contains('touch') ? 'touch' : 'keys';
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  return {
    text(name, back) { const t = T[name]; if (!t) return ''; const k = KEYS[dev()](!!back); return t.replace(/\{([FJGD])\}/g, (_, x) => `<kbd>${esc(k[x])}</kbd>`); },
    show(name, back, ms = 6000) { const h = this.text(name, back); if (!h) return; cur = name; head.textContent = name; body.innerHTML = h; el.hidden = false; requestAnimationFrame(() => el.classList.add('on')); clearTimeout(hideT); if (ms) hideT = setTimeout(() => this.hide(), ms); },
    hide() { clearTimeout(hideT); el.classList.remove('on'); cur = ''; hideT = setTimeout(() => { if (!cur) el.hidden = true; }, 300); },
    get cur() { return cur; }
  };
}
export const TIP_NAMES = Object.keys(T);
