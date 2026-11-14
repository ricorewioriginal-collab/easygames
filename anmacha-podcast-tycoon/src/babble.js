/* AnMaCha – Der Podcast · Brabbel-Stimmen für NPCs (eigene, synthetische „Tier-Plapper“-Stimme wie in gemütlichen Lebenssimulationen).
   Jede Silbe wird zu einem kurzen, gefilterten Ton; Tonhöhe, Klangfarbe und Tempo hängen fest vom Namen ab – jede Figur klingt immer gleich.
   Spricht bei: Gesprächen mit Passanten (Talk-Fenster), Sprechblasen mit „…“ und NPC-Zeilen in Zwischensequenzen. Lautstärke = Effekte. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, D = AMC.Data, Save = AMC.Save;
  const BB = AMC.Babble = {};
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h; };
  const HOSTS = () => Object.values(D.HOSTS || {}).map(h => h.name).concat(['Andrew', 'Marco', 'RicoReWi', 'Rico', 'Gisela', 'Erzähler', '🎙️']);
  const FEM = /(in|a|e|y|i)$|frau|oma|tante|mia|jule|helga|hilde|lena|jana/i;
  let busy = 0, tm = [];
  BB.voice = function (name) {
    const h = hash(String(name || '?')), first = String(name || '').trim().split(/\s+/).pop(), fem = FEM.test(first) && !/(o|er)$/i.test(first);
    return { base: (fem ? 330 : 190) * (0.85 + (h % 31) / 100), wave: ['triangle', 'square', 'sawtooth'][h % 3], q: 4 + (h >> 5) % 5, rate: 0.058 + ((h >> 9) % 5) * 0.006, wob: 0.06 + ((h >> 12) % 4) * 0.02 };
  };
  const VOW = { a: 0, e: 4, i: 7, o: -3, u: -5, 'ä': 2, 'ö': -1, 'ü': 5, y: 6 };
  BB.stop = () => { tm.forEach(clearTimeout); tm = []; busy = 0; };
  /** Text als Brabbeln sprechen; end() läuft danach. Gibt true zurück, wenn etwas zu hören ist. */
  BB.say = function (name, text, end) {
    const A = AMC.Audio, ctx = A && A.ctx, st = Save.data.settings || {};
    if (!ctx || !A.ready || st.babble === false || !(st.sfx > 0)) return false;
    BB.stop();
    const v = BB.voice(name), syl = (String(text).toLowerCase().match(/[bcdfghjklmnpqrstvwxzß]*[aeiouäöüy]+/g) || []).slice(0, 34);
    if (!syl.length) return false;
    const out = ctx.createGain(); out.gain.value = Math.min(0.32, st.sfx * 0.3); out.connect(ctx.destination);
    let t = ctx.currentTime + 0.03;
    syl.forEach((s, i) => {
      const vow = s.match(/[aeiouäöüy]/)[0], step = VOW[vow] || 0, up = /[?]/.test(text) && i > syl.length - 4 ? 3 + i - syl.length + 4 : 0;
      const f = v.base * Math.pow(2, (step + up) / 12) * (1 + (Math.random() - 0.5) * v.wob), dur = v.rate * (s.length > 3 ? 1.25 : 1);
      const o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = v.wave; o.frequency.setValueAtTime(f * 1.08, t); o.frequency.exponentialRampToValueAtTime(f, t + dur * 0.6);
      bp.type = 'bandpass'; bp.frequency.value = f * (2 + step * 0.08); bp.Q.value = v.q;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(bp); bp.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
      t += dur + (/[,.!?;:]/.test(text.split(/\s+/)[Math.min(i, 99)] || '') ? 0.03 : 0.014);
    });
    const ms = (t - ctx.currentTime) * 1000 + 60; busy = 1;
    tm.push(setTimeout(() => { busy = 0; try { out.disconnect(); } catch (e) { /* egal */ } if (end) end(); }, ms));
    return true;
  };
  BB.busy = () => !!busy;
  const npc = name => name && /\p{L}/u.test(name) && !HOSTS().includes(name);

  // Sprechblasen mit wörtlicher Rede von NPCs
  if (AMC.UI && AMC.UI.bubble) {
    const bub = AMC.UI.bubble;
    AMC.UI.bubble = function (name, text) { bub.apply(this, arguments); if (npc(name) && /^„/.test(String(text || ''))) BB.say(name, text); };
  }
  // Talk-Fenster: Begrüßung und Antworten der Passanten
  let lastSay = '';
  new MutationObserver(() => {
    const el = document.getElementById('tkSay'); if (!el) { lastSay = ''; return; }
    const txt = el.textContent; if (txt === lastSay) return; lastSay = txt;
    const b = el.querySelector('b'), name = b ? b.textContent.replace(/:\s*$/, '') : ''; if (npc(name)) BB.say(name, txt.slice(b.textContent.length));
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})(typeof window !== 'undefined' ? window : globalThis);
