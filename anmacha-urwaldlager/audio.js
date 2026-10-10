/* Urwaldlager – Klänge werden im Browser erzeugt (Web Audio), inkl. Dschungel-Ambiente */
(function (root) {
  'use strict';
  let ac = null, master = null, amb = null, on = true, ambOn = false, tm = null;
  try { on = localStorage.getItem('ul_snd') !== '0'; } catch (e) { }
  function ctx() {
    if (!ac) { const A = root.AudioContext || root.webkitAudioContext; if (!A) return null; try { ac = new A(); master = ac.createGain(); master.gain.value = on ? .8 : 0; master.connect(ac.destination); } catch (e) { ac = null; return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, d, type, v, when, f2) {
    const c = ctx(); if (!c || !on) return; const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .12, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
  }
  function noise(d, v, f0, f1, when) {
    const c = ctx(); if (!c || !on) return; const n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (when || 0); s.buffer = b; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0 || 800, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.value = v || .15; s.connect(fl); fl.connect(g); g.connect(master); s.start(t);
  }
  const PADS = [[620, 'square', 880], [150, 'square', 120], [110, 'sawtooth', 70], [420, 'triangle', 640]];
  const S = {
    unlock() { ctx(); },
    isOn() { return on; },
    toggle() { on = !on; try { localStorage.setItem('ul_snd', on ? '1' : '0'); } catch (e) { } if (master) master.gain.value = on ? .8 : 0; if (on) S.ambience(true); return on; },
    click() { tone(660, .06, 'triangle', .07); },
    star() { tone(880, .09, 'triangle', .13); tone(1320, .14, 'triangle', .11, .07); },
    bad() { tone(160, .22, 'sawtooth', .13, 0, 70); },
    gag() { noise(.5, .16, 400, 120); tone(130, .4, 'sawtooth', .09, 0, 60); },
    swallow() { tone(300, .12, 'sine', .14, 0, 120); noise(.12, .1, 600, 300); },
    thud() { tone(90, .16, 'sine', .22, 0, 40); },
    splash() { noise(.35, .14, 1800, 300); },
    pad(i) { const p = PADS[i % 4]; tone(p[0], .32, p[1], .1, 0, p[2]); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .14, i * .11)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, .34, 'sawtooth', .09, i * .15)); },
    drum() { tone(120, .18, 'sine', .22, 0, 55); noise(.06, .08, 2000, 900); },
    reveal() { tone(520, .08, 'square', .06); },
    fan() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .4, 'triangle', .13, i * .1)); },
    ambience(force) {
      if (!ctx() || !on) return; if (ambOn && !force) return; ambOn = true; if (tm) clearTimeout(tm);
      if (!amb) { // leises Rauschen als Blätterwind
        const c = ac, n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
        const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; s.loop = true; f.type = 'lowpass'; f.frequency.value = 520; g.gain.value = .035; s.connect(f); f.connect(g); g.connect(master); s.start(); amb = s;
      }
      const loop = () => {
        if (!on) { ambOn = false; return; }
        const r = Math.random();
        if (r < .5) { const f = 1800 + Math.random() * 1800; tone(f, .1, 'sine', .035); tone(f * 1.25, .12, 'sine', .03, .12); if (Math.random() < .5) tone(f * .9, .1, 'sine', .03, .26); }
        else if (r < .75) { for (let i = 0; i < 3; i++) tone(180 + Math.random() * 30, .09, 'square', .018, i * .13, 140); }
        else tone(700 + Math.random() * 300, .5, 'sine', .02, 0, 300 + Math.random() * 200);
        tm = setTimeout(loop, 1800 + Math.random() * 3200);
      };
      loop();
    }
  };
  root.USnd = S;
})(typeof window !== 'undefined' ? window : globalThis);
