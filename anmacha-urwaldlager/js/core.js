/* Urwaldlager – Grundlagen: Namensraum, Hilfsfunktionen, Speicher, Einstellungen, Zeitgeber */
(function () {
  'use strict';
  const UL = window.UL = window.UL || {};
  UL.VERSION = '3.0.0';
  const Q = new URLSearchParams(location.search);
  UL.query = Q;
  UL.debug = Q.has('debug');
  UL.bot = Q.get('bot') === '1';

  UL.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  UL.lerp = (a, b, t) => a + (b - a) * t;
  UL.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  UL.angDamp = (a, b, k, dt) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * (1 - Math.exp(-k * dt)); };
  UL.smooth = t => t * t * (3 - 2 * t);
  UL.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Zufall mit Startwert (Staffeln lassen sich so nachvollziehen und testen)
  UL.RNG = class {
    constructor(seed) { this.s = (seed >>> 0) || 1; }
    next() { let t = this.s += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    range(a, b) { return a + (b - a) * this.next(); }
    int(a, b) { return Math.floor(this.range(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    chance(p) { return this.next() < p; }
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  };
  UL.rng = new UL.RNG(Date.now() & 0xffffffff);
  UL.rand = (a = 0, b = 1) => UL.rng.range(a, b);
  UL.pick = arr => UL.rng.pick(arr);

  // Speicher (localStorage, Präfix ul_ – passt zur Google-Sicherung von anmacha-cloud.js)
  UL.store = {
    get(k, d) { try { const v = localStorage.getItem('ul_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ul_' + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem('ul_' + k); } catch (e) { } }
  };

  const DEF = { quality: 'auto', music: 0.5, sfx: 0.8, voice: true, sens: 1, invertY: false, shake: true, autoRun: false, hints: true };
  UL.settings = Object.assign({}, DEF, UL.store.get('settings', {}));
  UL.saveSettings = () => UL.store.set('settings', UL.settings);

  // Ereignisse
  const ev = {};
  UL.on = (n, f) => { (ev[n] = ev[n] || []).push(f); return () => { ev[n] = ev[n].filter(x => x !== f); }; };
  UL.emit = (n, a, b) => { (ev[n] || []).slice().forEach(f => { try { f(a, b); } catch (e) { console.error(e); } }); };

  // Zeitgeber in Spielzeit (stehen bei Pause still)
  const timers = [];
  UL.after = (sec, fn) => { const t = { t: sec, fn }; timers.push(t); return t; };
  UL.sleep = sec => new Promise(r => UL.after(sec, r));
  UL.cancel = t => { const i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1); };
  UL.tickTimers = dt => { for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; t.t -= dt; if (t.t <= 0) { timers.splice(i, 1); try { t.fn(); } catch (e) { console.error(e); } } } };
  UL.clearTimers = () => { timers.length = 0; };

  // Gerät
  UL.touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  UL.portrait = () => innerHeight > innerWidth * 1.05;
  UL.mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (UL.touch && Math.min(screen.width, screen.height) < 820);

  UL.fmtTime = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
})();
