// Konsolen-Menüsteuerung: Gamepad (Steuerkreuz/linker Stick, Ⓐ, Ⓑ) und Pfeiltasten bewegen den Fokus räumlich
// durch Menüs, Dialoge und Pause-Fenster. Während der Fahrt ohne offenes Fenster bleibt das Gamepad beim Zug (input.ts).
const FOCUSABLE = 'button:not([disabled]),select:not([disabled]),input:not([disabled]):not([type=hidden]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
type Dir = 'up' | 'down' | 'left' | 'right';

/** Oberste aktive Menüebene: letztes offenes Fenster, sonst der Vollbild-Menübildschirm */
export function navLayer(): HTMLElement | null {
  const ovs = document.querySelectorAll<HTMLElement>('.overlay');
  if (ovs.length) return ovs[ovs.length - 1];
  return document.querySelector<HTMLElement>('#ui .screen');
}

function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

const items = (layer: HTMLElement) => [...layer.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(visible);

/** Nächstes Element in Richtung d (Abstand in Laufrichtung + doppelt gewichteter Querversatz) */
export function pick(from: DOMRect, cands: { el: HTMLElement; r: DOMRect }[], d: Dir): HTMLElement | null {
  const cx = from.left + from.width / 2, cy = from.top + from.height / 2;
  let best: HTMLElement | null = null, bestS = Infinity;
  for (const { el, r } of cands) {
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const dx = x - cx, dy = y - cy;
    const main = d === 'up' ? -dy : d === 'down' ? dy : d === 'left' ? -dx : dx;
    if (main <= 4) continue;
    // Überlappung quer zur Richtung bevorzugen (Zeilen/Spalten bleiben erhalten)
    const cross = d === 'up' || d === 'down'
      ? Math.max(0, Math.max(r.left, from.left) < Math.min(r.right, from.right) ? 0 : Math.abs(dx))
      : Math.max(0, Math.max(r.top, from.top) < Math.min(r.bottom, from.bottom) ? 0 : Math.abs(dy));
    const s = main + cross * 2;
    if (s < bestS) { bestS = s; best = el; }
  }
  return best;
}

function focusEl(el: HTMLElement) {
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

function firstOf(layer: HTMLElement): HTMLElement | null {
  const list = items(layer);
  return list.find((e) => e.classList.contains('primary')) ?? list[0] ?? null;
}

function move(d: Dir) {
  const layer = navLayer(); if (!layer) return false;
  const cur = document.activeElement as HTMLElement | null;
  if (!cur || !layer.contains(cur) || cur === layer) { const f = firstOf(layer); if (f) focusEl(f); return !!f; }
  // Auswahllisten und Schieberegler: links/rechts ändert den Wert
  if ((d === 'left' || d === 'right') && cur instanceof HTMLSelectElement) {
    const n = cur.options.length; if (!n) return true;
    cur.selectedIndex = (cur.selectedIndex + (d === 'right' ? 1 : n - 1)) % n;
    cur.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  if ((d === 'left' || d === 'right') && cur instanceof HTMLInputElement && cur.type === 'range') {
    if (d === 'right') cur.stepUp(); else cur.stepDown();
    cur.dispatchEvent(new Event('input', { bubbles: true })); cur.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  const from = cur.getBoundingClientRect();
  const next = pick(from, items(layer).filter((e) => e !== cur).map((el) => ({ el, r: el.getBoundingClientRect() })), d);
  if (next) focusEl(next);
  return true;
}

const BACK_RE = /^(←|✕|zurück|abbrechen|schließen|weiterfahren|▶ weiterfahren|nein)/i;

/** Ⓑ: Zurück-Knopf des Bildschirms bzw. Abbrechen/Schließen im Fenster */
function back() {
  const layer = navLayer(); if (!layer) return;
  const list = items(layer).filter((e) => e.tagName === 'BUTTON');
  const b = list.find((e) => e.dataset.back !== undefined || e.getAttribute('aria-label') === 'Zurück')
    ?? list.find((e) => BACK_RE.test((e.textContent ?? '').trim()));
  if (b) b.click();
  else if (layer.classList.contains('dlg') && list.length > 1) list[list.length - 1].click();
}

function activate() {
  const layer = navLayer(); if (!layer) return;
  const cur = document.activeElement as HTMLElement | null;
  if (cur && layer.contains(cur) && cur !== layer) {
    if (cur instanceof HTMLSelectElement) { move('right'); return; }
    cur.click();
  } else { const f = firstOf(layer); if (f) focusEl(f); }
}

let started = false;
const prev: boolean[] = [];
let held: Dir | null = null, repeatAt = 0;
let lastLayer: HTMLElement | null = null;

function setPadMode(on: boolean) { document.body.classList.toggle('pad', on); }

/** Fokus setzen, sobald eine neue Menüebene erscheint (nur bei Gamepad/Tastatur, nicht bei Touch) */
function autoFocus() {
  const layer = navLayer();
  if (layer === lastLayer) return;
  lastLayer = layer;
  if (!layer || !document.body.classList.contains('pad')) return;
  const cur = document.activeElement as HTMLElement | null;
  if (cur && layer.contains(cur) && cur !== layer) return;
  const f = firstOf(layer); if (f) focusEl(f);
}

let hint: HTMLElement | null = null;
function poll(now: number) {
  requestAnimationFrame(poll);
  if (hint) hint.classList.toggle('on', document.body.classList.contains('pad') && !!navLayer());
  const pads = navigator.getGamepads?.() ?? [];
  const gp = [...pads].find((p) => p && p.connected);
  autoFocus();
  if (!gp) { held = null; return; }
  const layer = navLayer();
  const btn = (i: number) => !!gp.buttons[i]?.pressed;
  const edge = (i: number) => { const p = btn(i), e = p && !prev[i]; prev[i] = p; return e; };
  const ax = gp.axes[0] ?? 0, ay = gp.axes[1] ?? 0;
  const d: Dir | null = btn(12) || ay < -0.55 ? 'up' : btn(13) || ay > 0.55 ? 'down' : btn(14) || ax < -0.55 ? 'left' : btn(15) || ax > 0.55 ? 'right' : null;
  const a = edge(0), b = edge(1);
  for (let i = 2; i < 18; i++) prev[i] = btn(i);
  if (!layer) { held = null; return; }
  // Erste Gamepad-Eingabe zeigt nur den Fokus, ohne gleich zu springen oder auszulösen
  if ((d || a || b) && !document.body.classList.contains('pad')) { setPadMode(true); lastLayer = null; autoFocus(); held = d; repeatAt = now + 320; return; }
  if (d) {
    if (d !== held) { held = d; repeatAt = now + 320; move(d); }
    else if (now >= repeatAt) { repeatAt = now + 130; move(d); }
  } else held = null;
  if (a) activate();
  if (b) back();
}

const KEY_DIR: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

function onKey(e: KeyboardEvent) {
  const d = KEY_DIR[e.key];
  const layer = navLayer();
  if (!layer) return;
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range' && (t as HTMLInputElement).type !== 'checkbox'))) return;
  if (d) {
    // Karte/Editor-Leinwände behalten ihre Pfeiltasten
    if (t && t.tagName === 'CANVAS') return;
    setPadMode(true);
    e.preventDefault(); e.stopPropagation();
    move(d);
  } else if (e.key === 'Backspace' && !layer.classList.contains('overlay')) { setPadMode(true); e.preventDefault(); back(); }
}

/** Einmal beim Start aufrufen */
export function startPadNav() {
  if (started || typeof window === 'undefined') return;
  started = true;
  hint = document.createElement('div');
  hint.className = 'padhint'; hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = '<span><i>✚</i> Auswählen</span><span><i class="a"><span class="px">A</span><span class="pp">✕</span></i> Bestätigen</span><span><i class="b"><span class="px">B</span><span class="pp">○</span></i> Zurück</span>';
  document.body.appendChild(hint);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('pointerdown', () => setPadMode(false), true);
  window.addEventListener('gamepadconnected', () => { setPadMode(true); lastLayer = null; });
  requestAnimationFrame(poll);
}

/** true, wenn gerade ein Menü/Fenster bedient wird (Gamepad gehört dann der Menüsteuerung) */
export const menuOpen = () => !!document.querySelector('.overlay');
