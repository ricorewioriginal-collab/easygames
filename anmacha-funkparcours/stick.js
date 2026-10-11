/* Funkparcours – Touch-Steuerung: Analog-Stick links (nur waagerecht ausgewertet) und runde Aktionsknöpfe rechts.
   Wird im Spiel (Touch-Geräte) und auf dem Handy-Pad genutzt. Bits wie Tastatur: 1 links, 2 rechts, 4 Sprung. */
export const STICK_HTML = '<div class="stick" aria-label="Laufen: Stick nach links oder rechts ziehen"><i></i><b></b></div>';
export const JUMP_HTML = '<button class="act main" data-k="j" aria-label="Springen"><span class="ai">⤒</span><span>Springen</span></button>';
const DEAD = 0.28;

// Stick: Finger irgendwo im Stick-Feld aufsetzen, der Knopf folgt bis zum Rand. onMask(bits) nur bei Änderung.
export function stick(el, onMask) {
  const knob = el.querySelector('b'); let id = null, cx = 0, cy = 0, R = 1, m = 0;
  const set = (dx, dy) => {
    const d = Math.hypot(dx, dy), k = d > R ? R / d : 1; dx *= k; dy *= k;
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const v = dx / R, nm = v < -DEAD ? 1 : v > DEAD ? 2 : 0; if (nm !== m) { m = nm; onMask(m); }
  };
  const end = e => { if (e.pointerId !== id) return; id = null; el.classList.remove('on'); set(0, 0); };
  el.addEventListener('pointerdown', e => {
    e.preventDefault(); if (id != null) return; id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {}
    const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width * 0.32; el.classList.add('on'); set(e.clientX - cx, e.clientY - cy);
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX - cx, e.clientY - cy); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => el.addEventListener(ev, end));
  return { reset() { id = null; el.classList.remove('on'); set(0, 0); } };
}

// Halte-Knopf (z. B. Springen): onDown/onUp beim Drücken und Loslassen.
export function hold(b, onDown, onUp) {
  let on = false; const up = () => { if (on) { on = false; b.classList.remove('on'); onUp(); } };
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} if (!on) { on = true; b.classList.add('on'); onDown(); } });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, up));
  return up;
}
