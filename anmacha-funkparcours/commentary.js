/* Live-Kommentator für Titanparcours: die Trailer-Stimme (vorproduzierte Ansagen in assets/vo, siehe tools/titan-voice).
   Eine Stimme, keine Überlagerung: höchstens zwei Ansagen warten, wichtige Ansagen (priority) unterbrechen.
   say(key, { priority, ifIdle, chance, cooldown }) → Länge der Ansage in Sekunden (0 = nicht gesprochen). */
import { VO } from './assets/vo/vo.js';
const BASE = new URL('./assets/vo/', import.meta.url).href;
export function makeCommentator() {
  const AC = window.AudioContext || window.webkitAudioContext, supported = !!AC;
  const KEY = 'fpVoice', saved = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
  let on = saved === null ? true : saved === '1', ac = null, out = null, src = null, busy = false, queue = [], gen = 0, warm = false;
  const bufs = {}, lastPick = {}, lastSaid = {}, log = [];
  function ctx() {
    if (!supported) return null;
    if (!ac) { ac = new AC(); out = ac.createGain(); out.gain.value = 1.0; out.connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  // Browser erlauben Ton erst nach einer Eingabe: beim ersten Tippen/Taste entsperren und alle Ansagen im Hintergrund laden.
  const unlock = () => { if (!on) return; ctx(); if (!warm) { warm = true; preloadAll(); } };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, unlock, { passive: true }));
  function load(file) {
    if (!bufs[file]) bufs[file] = fetch(BASE + file).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(b => new Promise((ok, no) => ctx().decodeAudioData(b, ok, no))).catch(() => { delete bufs[file]; return null; });
    return bufs[file];
  }
  function preloadAll() { const files = Object.values(VO).flat().map(v => v[0]); let i = 0; const next = () => { if (i < files.length) load(files[i++]).then(next); }; for (let k = 0; k < 4; k++) next(); }
  function pick(key) { const list = VO[key]; if (!list || !list.length) return null; let n = Math.floor(Math.random() * list.length); if (list.length > 1 && n === lastPick[key]) n = (n + 1) % list.length; lastPick[key] = n; return list[n]; }
  function stop() { gen++; queue = []; busy = false; if (src) { try { src.onended = null; src.stop(); } catch (e) {} src = null; } }
  function pump() {
    if (!on || busy || !queue.length || !ctx()) return;
    const item = queue.shift(), g = gen; busy = true;
    load(item.file).then(buf => {
      if (g !== gen) return;
      // Ansagen, die beim Laden veraltet sind (Spieler ist längst weiter), lieber weglassen
      if (!buf || performance.now() - item.at > 2500) { busy = false; pump(); return; }
      try {
        const s = ac.createBufferSource(); s.buffer = buf; s.connect(out); src = s;
        s.onended = () => { if (g !== gen) return; src = null; busy = false; setTimeout(pump, 120); };
        s.start();
      } catch (e) { busy = false; pump(); }
    });
  }
  function say(key, o = {}) {
    if (!on || !supported || !VO[key]) return 0;
    const now = performance.now();
    if (o.ifIdle && (busy || queue.length)) return 0;
    if (o.chance != null && Math.random() > o.chance) return 0;
    if (o.cooldown && lastSaid[key] && now - lastSaid[key] < o.cooldown * 1000) return 0;
    const v = pick(key); if (!v) return 0;
    lastSaid[key] = now; log.push(key); if (log.length > 60) log.shift();
    if (o.priority) stop();
    if (queue.length >= 2) queue.shift();
    queue.push({ file: v[0], at: now }); pump();
    return v[1];
  }
  function setOn(v) { on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (!on) stop(); else unlock(); return on; }
  return { say, stop, setOn, get on() { return on; }, get busy() { return busy || queue.length > 0; }, supported, log, has: k => !!VO[k], len: k => (VO[k] ? Math.max(...VO[k].map(v => v[1])) : 0) };
}
